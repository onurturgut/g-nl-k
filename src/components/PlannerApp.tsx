'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  LayoutDashboard,
  MoreHorizontal,
  NotebookPen,
  Settings,
  Timer,
} from 'lucide-react';
import Analytics from '@/components/Analytics';
import AppIntro from '@/components/AppIntro';
import DailyNotesSummary from '@/components/DailyNotesSummary';
import FocusMode from '@/components/FocusMode';
import Header from '@/components/Header';
import Journal from '@/components/Journal';
import MiniCalendar from '@/components/MiniCalendar';
import MonthlyCalendarOverview from '@/components/MonthlyCalendarOverview';
import QuickNotes from '@/components/QuickNotes';
import SettingsPanel from '@/components/SettingsPanel';
import TaskForm from '@/components/TaskForm';
import TaskTimeline from '@/components/TaskTimeline';
import WeeklyPlannerView from '@/components/WeeklyPlannerView';
import { usePlannerStore } from '@/store/usePlannerStore';

type Tab = 'dashboard' | 'calendar' | 'focus' | 'notes' | 'analytics' | 'journal' | 'settings';

const navItems = [
  { id: 'dashboard' as Tab, label: 'Plan', icon: LayoutDashboard },
  { id: 'calendar' as Tab, label: 'Takvim', icon: CalendarDays },
  { id: 'notes' as Tab, label: 'Notlar', icon: NotebookPen },
  { id: 'focus' as Tab, label: 'Odak', icon: Timer },
  { id: 'journal' as Tab, label: 'Günlük', icon: BookOpen },
  { id: 'analytics' as Tab, label: 'Analiz', icon: BarChart3 },
  { id: 'settings' as Tab, label: 'Ayarlar', icon: Settings },
];

const mobilePrimaryItems = navItems.filter((item) => ['dashboard', 'calendar', 'notes'].includes(item.id));
const mobileMoreItems = navItems.filter((item) => ['focus', 'journal', 'analytics', 'settings'].includes(item.id));

const tabTitles: Record<Tab, string> = {
  dashboard: 'Plan',
  calendar: 'Takvim',
  focus: 'Odak Modu',
  notes: 'Notlar',
  journal: 'Günlük',
  analytics: 'Analiz',
  settings: 'Ayarlar',
};

export default function PlannerApp() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [planMode, setPlanMode] = useState<'weekly' | 'daily'>('weekly');
  const [showIntro, setShowIntro] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const copyPreviousDay = usePlannerStore((s) => s.copyPreviousDay);
  const allTasks = usePlannerStore((s) => s.tasks);
  const notes = usePlannerStore((s) => s.notes);

  const selectedTasks = useMemo(() => allTasks.filter((task) => task.date === selectedDate), [allTasks, selectedDate]);
  const selectedNotes = useMemo(() => notes.filter((note) => note.date === selectedDate), [notes, selectedDate]);
  const todayTasks = useMemo(() => allTasks.filter((task) => task.date === today), [allTasks, today]);
  const todayDone = todayTasks.filter((task) => task.status === 'completed').length;
  const selectedDone = selectedTasks.filter((task) => task.status === 'completed').length;
  const selectedPending = selectedTasks.filter((task) => task.status === 'pending').length;
  const progress = selectedTasks.length > 0 ? Math.round((selectedDone / selectedTasks.length) * 100) : 0;

  const dateObj = parseISO(selectedDate);
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const displayDate = format(dateObj, 'd MMMM yyyy, EEEE', { locale: tr });
  const shortDisplayDate = format(dateObj, 'd MMMM, EEEE', { locale: tr });

  const goPrev = () => setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'));
  const goNext = () => setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  const openTab = (nextTab: Tab) => {
    setTab(nextTab);
    setMoreOpen(false);
  };

  const handleCopyYesterday = () => {
    if (selectedTasks.length > 0) {
      const confirmed = confirm('Bu günde zaten görevler var. Yine de dünü kopyalamak ister misin?');
      if (!confirmed) return;
    }
    const prev = format(subDays(dateObj, 1), 'yyyy-MM-dd');
    copyPreviousDay(prev, selectedDate);
  };

  if (showIntro) {
    return <AppIntro />;
  }

  return (
    <div className="app-ambient min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl gap-5 px-3 py-3 pb-24 sm:px-5 lg:px-6 lg:py-6 lg:pb-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-56 shrink-0 flex-col rounded-lg border border-border bg-card p-3 lg:flex">
          <div className="mb-5 px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              GP
            </div>
            <p className="mt-3 text-sm font-semibold">Günlük Plan</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Sade günlük akış.</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => openTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <item.icon className={`h-4 w-4 ${tab === item.id ? 'text-primary' : ''}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bugün</span>
              <span>{todayDone}/{todayTasks.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${todayTasks.length ? (todayDone / todayTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === 'dashboard' ? (
            <div className="space-y-4">
              <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Planlama alanı</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Haftalık planı oluştur, günlük alanda hızlı eklemeler yap.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                  <button
                    onClick={() => setPlanMode('weekly')}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      planMode === 'weekly' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Haftalık Plan
                  </button>
                  <button
                    onClick={() => setPlanMode('daily')}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      planMode === 'daily' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Günlük Plan
                  </button>
                </div>
              </section>

              {planMode === 'weekly' ? (
                <WeeklyPlannerView
                  selectedDate={selectedDate}
                  today={today}
                  onSelectDate={setSelectedDate}
                  onOpenDaily={() => setPlanMode('daily')}
                  onOpenAnalytics={() => openTab('analytics')}
                />
              ) : (
                <>
              <section className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Günlük hızlı plan</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {shortDisplayDate}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedTasks.length} görev · {selectedDone} tamamlandı · {selectedNotes.length} not
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={goPrev}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Önceki gün"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {!isToday && (
                      <button
                        onClick={() => setSelectedDate(today)}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Bugün
                      </button>
                    )}
                    <button
                      onClick={goNext}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Sonraki gün"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCalendarOpen((value) => !value)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Takvim
                    </button>
                    {!isPast && <TaskForm date={selectedDate} compact />}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Günün ilerlemesi</span>
                    <span>%{progress}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </section>

              {calendarOpen && (
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                />
              )}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Günün akışı</h2>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">{displayDate}</p>
                    </div>
                    <button
                      onClick={handleCopyYesterday}
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Dünü kopyala
                    </button>
                  </div>

                  {isPast && (
                    <p className="rounded-lg border border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
                      Geçmiş günler için yeni görev eklenemez.
                    </p>
                  )}

                  <TaskTimeline
                    date={selectedDate}
                    emptyTitle="Bugün için görev yok"
                    emptyDescription="İlk görevini ekleyerek günü hafifçe planla."
                  />
                </section>

                <aside className="space-y-4">
                  <section className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">Kısa özet</h2>
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">%{progress}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/55 p-2">
                        <p className="text-lg font-semibold">{selectedTasks.length}</p>
                        <p className="text-[10px] text-muted-foreground">Toplam</p>
                      </div>
                      <div className="rounded-lg bg-muted/55 p-2">
                        <p className="text-lg font-semibold">{selectedDone}</p>
                        <p className="text-[10px] text-muted-foreground">Biten</p>
                      </div>
                      <div className="rounded-lg bg-muted/55 p-2">
                        <p className="text-lg font-semibold">{selectedPending}</p>
                        <p className="text-[10px] text-muted-foreground">Kalan</p>
                      </div>
                    </div>
                  </section>

                  <DailyNotesSummary date={selectedDate} onOpenNotes={() => openTab('notes')} />

                  <section className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-semibold">Odak</h2>
                    </div>
                    <button
                      onClick={() => openTab('focus')}
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      25 dk başlat
                    </button>
                  </section>
                </aside>
              </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Header title={tabTitles[tab]} />
              {tab === 'analytics' && <Analytics />}
              {tab === 'calendar' && <MonthlyCalendarOverview />}
              {tab === 'focus' && <FocusMode />}
              {tab === 'notes' && <QuickNotes />}
              {tab === 'journal' && <Journal date={today} />}
              {tab === 'settings' && <SettingsPanel />}
            </>
          )}
        </main>
      </div>

      {moreOpen && (
        <div className="fixed bottom-20 right-3 z-30 w-48 rounded-lg border border-border bg-card p-2 shadow-elevated lg:hidden">
          {mobileMoreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => openTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === item.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/98 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-1">
          {mobilePrimaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => openTab(item.id)}
              className={`py-3 text-center transition-colors ${tab === item.id ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <item.icon className="mx-auto h-5 w-5" />
              <span className="mt-1 block text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <div className="flex items-center justify-center py-2">
            <TaskForm date={selectedDate} triggerLabel="" compact />
          </div>
          <button
            onClick={() => setMoreOpen((value) => !value)}
            className={`py-3 text-center transition-colors ${
              moreOpen || mobileMoreItems.some((item) => item.id === tab) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className="mx-auto h-5 w-5" />
            <span className="mt-1 block text-[10px] font-medium">Daha</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
