import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, addWeeks, format, parseISO, startOfWeek } from 'date-fns';
import type { NotificationSoundId } from '@/lib/notificationSound';

export type TaskCategory = 'work' | 'personal' | 'sport' | 'health' | 'education' | 'other';
export type TaskStatus = 'pending' | 'completed' | 'missed' | 'postponed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  time: string; // HH:mm
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  note: string;
  date: string; // YYYY-MM-DD
  notificationEnabled: boolean;
  notificationMinutes: number; // 0, 5, 15, 30
  recurring: 'none' | 'daily' | 'weekly';
  recurringWeeks?: number;
  recurringWeekdays?: number[]; // 0 = Monday, 6 = Sunday
  createdAt?: string;
  updatedAt?: string;
  notifiedAt?: string;
}

export interface JournalEntry {
  date: string;
  whatIDid: string;
  whatWasMissing: string;
  tomorrowImprovement: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  dailyNotes: string;
  gratitude: string;
  updatedAt?: string;
}

export interface QuickNote {
  id: string;
  title?: string;
  text: string;
  createdAt: string;
  date?: string;
  time?: string;
  updatedAt?: string;
  type?: 'daily' | 'idea' | 'meeting' | 'checklist' | 'shopping' | 'ai-summary' | 'personal' | 'work';
  category?: 'daily' | 'ideas' | 'work' | 'personal' | 'meetings' | 'shopping' | 'archive' | 'trash';
  tags?: string[];
  pinned?: boolean;
  mood?: 'happy' | 'rocket' | 'sleepy' | 'calm' | 'angry';
  checklist?: { id: string; text: string; done: boolean }[];
  aiSummary?: string;
}

interface PlannerState {
  tasks: Task[];
  journals: Record<string, JournalEntry>;
  notes: QuickNote[];
  darkMode: boolean;
  notificationSoundEnabled: boolean;
  notificationVolume: number;
  notificationSoundId: NotificationSoundId;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  saveJournal: (entry: JournalEntry) => void;
  addNote: (note: Omit<QuickNote, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, updates: Partial<QuickNote>) => void;
  deleteNote: (id: string) => void;
  toggleDarkMode: () => void;
  setNotificationSoundEnabled: (enabled: boolean) => void;
  setNotificationVolume: (volume: number) => void;
  setNotificationSoundId: (soundId: NotificationSoundId) => void;
  copyPreviousDay: (fromDate: string, toDate: string) => void;
  getTasksForDate: (date: string) => Task[];
}

function buildTaskId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function expandRecurringTask(task: Omit<Task, 'id'>): Task[] {
  const sourceDate = parseISO(task.date);
  const timestamp = new Date().toISOString();

  if (task.recurring === 'daily') {
    return Array.from({ length: 30 }, (_, index) => {
      const date = addDays(sourceDate, index);

      return {
        ...task,
        id: buildTaskId(),
        date: format(date, 'yyyy-MM-dd'),
        status: index === 0 ? task.status : 'pending',
        createdAt: task.createdAt || timestamp,
        updatedAt: timestamp,
      };
    });
  }

  if (task.recurring === 'weekly') {
    const weekCount = Math.min(52, Math.max(1, task.recurringWeeks || 12));
    const selectedWeekdays =
      task.recurringWeekdays && task.recurringWeekdays.length > 0
        ? [...new Set(task.recurringWeekdays)].filter((day) => day >= 0 && day <= 6).sort((a, b) => a - b)
        : [getWeekdayIndex(sourceDate)];
    const firstWeekStart = startOfWeek(sourceDate, { weekStartsOn: 1 });
    const untilDate = addWeeks(sourceDate, weekCount);

    return Array.from({ length: weekCount + 1 }).flatMap((_, weekIndex) => {
      const weekStart = addWeeks(firstWeekStart, weekIndex);

      return selectedWeekdays
        .map((weekday) => addDays(weekStart, weekday))
        .filter((date) => date >= sourceDate && date < untilDate)
        .map((date) => ({
          ...task,
          id: buildTaskId(),
          date: format(date, 'yyyy-MM-dd'),
          status: format(date, 'yyyy-MM-dd') === task.date ? task.status : 'pending',
          recurringWeeks: weekCount,
          recurringWeekdays: selectedWeekdays,
          createdAt: task.createdAt || timestamp,
          updatedAt: timestamp,
        }));
    });
  }

  return [{
    ...task,
    id: buildTaskId(),
    date: format(sourceDate, 'yyyy-MM-dd'),
    createdAt: task.createdAt || timestamp,
    updatedAt: timestamp,
  }];
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: [],
      journals: {},
      notes: [],
      darkMode: false,
      notificationSoundEnabled: true,
      notificationVolume: 0.45,
      notificationSoundId: 'classic-bell',

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, ...expandRecurringTask(task)],
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),

      toggleTaskStatus: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed', updatedAt: new Date().toISOString() }
            : t
        ),
      })),

      saveJournal: (entry) => set((state) => ({
        journals: { ...state.journals, [entry.date]: { ...entry, updatedAt: new Date().toISOString() } },
      })),

      addNote: (note) => set((state) => ({
        notes: [
          {
            ...note,
            id: buildTaskId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: note.tags || [],
            pinned: note.pinned || false,
            mood: note.mood || 'calm',
            category: note.category || 'ideas',
            type: note.type || 'idea',
          },
          ...state.notes,
        ],
      })),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
        ),
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      })),

      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newMode };
      }),

      setNotificationSoundEnabled: (enabled) => set({ notificationSoundEnabled: enabled }),

      setNotificationVolume: (volume) => set({ notificationVolume: Math.min(1, Math.max(0, volume)) }),

      setNotificationSoundId: (soundId) => set({ notificationSoundId: soundId }),

      copyPreviousDay: (fromDate, toDate) => set((state) => {
        const prevTasks = state.tasks.filter((t) => t.date === fromDate);
        const newTasks = prevTasks.map((t) => ({
          ...t,
          id: buildTaskId(),
          date: toDate,
          status: 'pending' as TaskStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        return { tasks: [...state.tasks, ...newTasks] };
      }),

      getTasksForDate: (date) => {
        return get().tasks.filter((t) => t.date === date).sort((a, b) => a.time.localeCompare(b.time));
      },
    }),
    {
      name: 'planner-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);

// Motivation quotes
const quotes = [
  "Disiplin, motivasyonun bittiği yerde başlar.",
  "Her gün bir adım daha ileri.",
  "Başarı, küçük çabaların tekrarıdır.",
  "Bugün yaptığın, yarını belirler.",
  "Hedeflerine odaklan, geri kalanı gelir.",
  "Mükemmellik bir alışkanlıktır.",
  "Kendine yatırım yap, en iyi getiri odur.",
  "Sabır ve azim, başarının anahtarıdır.",
  "Güçlü ol, çünkü kolay olmayacak.",
  "Bugünü iyi değerlendir, yarın kendine teşekkür edeceksin.",
  "Küçük adımlar, büyük yolculuklar başlatır.",
  "Harekete geç, mükemmel an gelmeyecek.",
  "Başarısızlık, denemeyi bıraktığın andır.",
  "Sınırların, sadece zihninde var.",
  "Her sabah yeni bir başlangıçtır.",
];

export function getDailyQuote(): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return quotes[Math.abs(hash) % quotes.length];
}

export const categoryLabels: Record<TaskCategory, string> = {
  work: 'İş',
  personal: 'Kişisel',
  sport: 'Spor',
  health: 'Sağlık',
  education: 'Eğitim',
  other: 'Diğer',
};

export const priorityLabels: Record<TaskPriority, string> = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

export const statusLabels: Record<TaskStatus, string> = {
  pending: 'Bekliyor',
  completed: 'Tamamlandı',
  missed: 'Kaçırıldı',
  postponed: 'Ertelendi',
};
