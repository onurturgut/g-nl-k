import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, addWeeks, format, parseISO } from 'date-fns';
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

function expandRecurringTask(task: Omit<Task, 'id'>): Task[] {
  const count = task.recurring === 'daily' ? 30 : task.recurring === 'weekly' ? 12 : 1;
  const sourceDate = parseISO(task.date);
  const timestamp = new Date().toISOString();

  return Array.from({ length: count }, (_, index) => {
    const date = task.recurring === 'daily'
      ? addDays(sourceDate, index)
      : task.recurring === 'weekly'
        ? addWeeks(sourceDate, index)
        : sourceDate;

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
          },
          ...state.notes,
        ],
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
