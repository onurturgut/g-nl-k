'use client';

import { useMemo, useState } from 'react';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  History,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Target,
  Timer,
} from 'lucide-react';
import Analytics from '@/components/Analytics';
import DailyNotesSummary from '@/components/DailyNotesSummary';
import FocusMode from '@/components/FocusMode';
import Header from '@/components/Header';
import Journal from '@/components/Journal';
import MiniCalendar from '@/components/MiniCalendar';
import MonthlyCalendarOverview from '@/components/MonthlyCalendarOverview';
import QuickNotes from '@/components/QuickNotes';
import QuickStats from '@/components/QuickStats';
import SettingsPanel from '@/components/SettingsPanel';
import TaskForm from '@/components/TaskForm';
import TaskTimeline from '@/components/TaskTimeline';
import WeeklyTasks from '@/components/WeeklyTasks';
import { usePlannerStore } from '@/store/usePlannerStore';

type Tab = 'dashboard' | 'calendar' | 'focus' | 'notes' | 'analytics' | 'journal' | 'settings';

const navItems = [
  { id: 'dashboard' as Tab, label: 'Bugün', icon: LayoutDashboard },
  { id: 'calendar' as Tab, label: 'Takvim', icon: CalendarDays },
  { id: 'focus' as Tab, label: 'Odak', icon: Timer },
  { id: 'notes' as Tab, label: 'Notlar', icon: NotebookPen },
  { id: 'journal' as Tab, label: 'Günlük', icon: BookOpen },
  { id: 'analytics' as Tab, label: 'Analiz', icon: BarChart3 },
  { id: 'settings' as Tab, label: 'Ayarlar', icon: Settings },
];

const tabTitles: Record<Tab, string> = {
  dashboard: 'Bugünün Akışı',
  calendar: 'Takvim',
  focus: 'Odak Modu',
  notes: 'Not Arşivi',
  journal: 'Günlük',
  analytics: 'Analiz',
  settings: 'Ayarlar',
};

export default function Index() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const copyPreviousDay = usePlannerStore((s) => s.copyPreviousDay);
  const allTasks = usePlannerStore((s) => s.tasks);
  const notes = usePlannerStore((s) => s.notes);

  const selectedTasks = useMemo(() => allTasks.filter((t) => t.date === selectedDate), [allTasks, selectedDate]);
  const selectedNotes = useMemo(() => notes.filter((note) => note.date === selectedDate), [notes, selectedDate]);

  const taskDates = useMemo(() => {
    const set = new Set(allTasks.map((t) => t.date));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [allTasks]);

  const todayTasks = useMemo(() => allTasks.filter((task) => task.date === today), [allTasks, today]);
  const todayDone = todayTasks.filter((task) => task.status === 'completed').length;
  const selectedDone = selectedTasks.filter((task) => task.status === 'completed').length;
  const progress = selectedTasks.length > 0 ? Math.round((selectedDone / selectedTasks.length) * 100) : 0;

  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const dateObj = parseISO(selectedDate);
  const displayDate = format(dateObj, 'd MMMM yyyy, EEEE', { locale: tr });
  const headerSubtitle = tab === 'dashboard' ? displayDate : undefined;

  const goPrev = () => setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'));
  const goNext = () => setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'));

  const handleCopyYesterday = () => {
    if (selectedTasks.length > 0) {
      const confirmed = confirm('Bu günde zaten görevler var. Yine de dünü kopyalamak ister misin?');
      if (!confirmed) return;
    }
    const prev = format(subDays(dateObj, 1), 'yyyy-MM-dd');
    copyPreviousDay(prev, selectedDate);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col rounded-xl border border-border/80 bg-card/92 p-3 shadow-soft backdrop-blur lg:flex">
          <div className="mb-5 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              GP
            </div>
            <p className="mt-3 text-sm font-semibold">Günlük Plan</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Görev, not, odak ve analiz merkezi.</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-lg bg-muted/70 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bugün</span>
              <span>{todayDone}/{todayTasks.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${todayTasks.length ? (todayDone / todayTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Header title={tabTitles[tab]} subtitle={headerSubtitle} />

          {tab === 'dashboard' && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-5">
                <div className="surface-panel rounded-xl p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goPrev}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Önceki gün"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={goNext}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Sonraki gün"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="ml-1">
                        <p className="text-sm font-semibold capitalize">{displayDate}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTasks.length} görev, {selectedNotes.length} not
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isToday && (
                        <button
                          onClick={() => setSelectedDate(today)}
                          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          Bugüne dön
                        </button>
                      )}
                      <button
                        onClick={() => setCalendarOpen((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        Takvim
                      </button>
                      <button
                        onClick={() => setHistoryOpen((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <History className="h-3.5 w-3.5" />
                        Geçmiş
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        Toplam görev
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{selectedTasks.length}</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tamamlanan
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{selectedDone}</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <NotebookPen className="h-3.5 w-3.5" />
                        Not
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{selectedNotes.length}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Gün ilerlemesi</span>
                      <span>%{progress}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {calendarOpen && (
                  <MiniCalendar
                    selectedDate={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setCalendarOpen(false);
                    }}
                  />
                )}

                {historyOpen && (
                  <div className="surface-panel max-h-72 overflow-y-auto rounded-xl p-3 animate-fade-in">
                    {taskDates.length === 0 && (
                      <p className="py-5 text-center text-xs text-muted-foreground">Henüz görev geçmişi yok.</p>
                    )}
                    {taskDates.map((d) => {
                      const count = allTasks.filter((t) => t.date === d).length;
                      const done = allTasks.filter((t) => t.date === d && t.status === 'completed').length;
                      const active = d === selectedDate;
                      return (
                        <button
                          key={d}
                          onClick={() => {
                            setSelectedDate(d);
                            setHistoryOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                            active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <span className="text-xs font-medium capitalize">
                            {format(parseISO(d), 'd MMMM EEEE', { locale: tr })}
                          </span>
                          <span className="text-xs text-muted-foreground">{done}/{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Görev listesi</h2>
                  <button
                    onClick={handleCopyYesterday}
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Dünü kopyala
                  </button>
                </div>

                {!isPast ? (
                  <TaskForm date={selectedDate} />
                ) : (
                  <p className="rounded-lg border border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
                    Geçmiş günler için yeni görev eklenemez.
                  </p>
                )}

                <TaskTimeline date={selectedDate} />
                <WeeklyTasks selectedDate={selectedDate} today={today} />
              </section>

              <aside className="space-y-5">
                <DailyNotesSummary date={selectedDate} onOpenNotes={() => setTab('notes')} />
                <QuickStats date={selectedDate} />
              </aside>
            </div>
          )}

          {tab === 'analytics' && <Analytics />}
          {tab === 'calendar' && <MonthlyCalendarOverview />}
          {tab === 'focus' && <FocusMode />}
          {tab === 'notes' && <QuickNotes />}
          {tab === 'journal' && <Journal date={today} />}
          {tab === 'settings' && <SettingsPanel />}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/80 bg-card/95 backdrop-blur safe-area-bottom lg:hidden">
        <div className="mx-auto flex max-w-2xl overflow-x-auto px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`min-w-16 flex-1 py-3 text-center transition-colors ${
                tab === item.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="mx-auto h-5 w-5" />
              <span className="mt-1 block text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
