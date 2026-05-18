import { useMemo } from 'react';
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart3, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import TaskForm from '@/components/TaskForm';
import { categoryLabels, type TaskCategory, usePlannerStore } from '@/store/usePlannerStore';

const categoryStyles: Record<TaskCategory, string> = {
  work: 'border-category-work/30 bg-category-work/10 text-category-work',
  personal: 'border-category-personal/30 bg-category-personal/10 text-category-personal',
  sport: 'border-category-sport/30 bg-category-sport/10 text-category-sport',
  health: 'border-category-health/30 bg-category-health/10 text-category-health',
  education: 'border-category-education/30 bg-category-education/12 text-category-education',
  other: 'border-category-other/30 bg-category-other/10 text-category-other',
};

interface WeeklyPlannerViewProps {
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
  onOpenDaily: () => void;
  onOpenAnalytics: () => void;
}

export default function WeeklyPlannerView({
  selectedDate,
  today,
  onSelectDate,
  onOpenDaily,
  onOpenAnalytics,
}: WeeklyPlannerViewProps) {
  const tasks = usePlannerStore((state) => state.tasks);
  const { deleteTask, toggleTaskStatus } = usePlannerStore();

  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekEnd, weekStart]);
  const weekStartKey = format(weekStart, 'yyyy-MM-dd');
  const weekEndKey = format(weekEnd, 'yyyy-MM-dd');
  const todayObj = parseISO(today);

  const weekTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.date >= weekStartKey && task.date <= weekEndKey)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [tasks, weekEndKey, weekStartKey],
  );

  const completed = weekTasks.filter((task) => task.status === 'completed').length;
  const progress = weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0;
  const plannedDays = days.filter((day) => {
    const key = format(day, 'yyyy-MM-dd');
    return weekTasks.some((task) => task.date === key);
  }).length;

  const goPrevWeek = () => onSelectDate(format(subWeeks(weekStart, 1), 'yyyy-MM-dd'));
  const goNextWeek = () => onSelectDate(format(addWeeks(weekStart, 1), 'yyyy-MM-dd'));
  const goThisWeek = () => onSelectDate(today);

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Haftalık planlama</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {format(weekStart, 'd MMMM', { locale: tr })} - {format(weekEnd, 'd MMMM yyyy', { locale: tr })}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {weekTasks.length} görev · {completed} tamamlandı · {plannedDays} gün planlandı
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goPrevWeek}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Önceki hafta"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goThisWeek}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Bu hafta
            </button>
            <button
              onClick={goNextWeek}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Sonraki hafta"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <TaskForm
              date={weekStartKey}
              triggerLabel="Haftalık plan oluştur"
              title="Haftalık görev"
              compact
              initialRecurring="weekly"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Hafta ilerlemesi</span>
            <span>%{progress}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-3">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Haftanın görünümü</h2>
            <p className="mt-1 text-xs text-muted-foreground">Planlı görevler ve gün içi eklemeler aynı haftada birleşir.</p>
          </div>
          <button
            onClick={onOpenAnalytics}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Haftalık analiz
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = weekTasks.filter((task) => task.date === key);
            const dayDone = dayTasks.filter((task) => task.status === 'completed').length;
            const active = key === selectedDate;
            const isToday = isSameDay(day, todayObj);

            return (
              <article
                key={key}
                className={`min-h-48 rounded-lg border p-2 transition-colors ${
                  active ? 'border-primary/55 bg-primary/5' : 'border-border bg-background'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectDate(key);
                    onOpenDaily();
                  }}
                  className="mb-2 flex w-full items-start justify-between gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted"
                >
                  <div>
                    <p className="text-xs font-semibold capitalize">{format(day, 'EEE', { locale: tr })}</p>
                    <p className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>{format(day, 'd')}</p>
                  </div>
                  <span className="rounded-md bg-muted px-1.5 py-1 text-[10px] text-muted-foreground">
                    {dayDone}/{dayTasks.length}
                  </span>
                </button>

                {dayTasks.length === 0 ? (
                  <button
                    onClick={() => {
                      onSelectDate(key);
                      onOpenDaily();
                    }}
                    className="w-full rounded-lg border border-dashed border-border px-2 py-4 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/60"
                  >
                    Günlük ekle
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`group rounded-lg border px-2 py-2 text-xs ${categoryStyles[task.category]}`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              task.status === 'completed' ? 'border-success bg-success' : 'border-current bg-background/80'
                            }`}
                            aria-label="Görev durumunu değiştir"
                          >
                            {task.status === 'completed' && <Check className="h-3 w-3 text-success-foreground" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground/90">{task.time}</p>
                            <p className={`mt-0.5 leading-4 ${task.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                              {task.title}
                            </p>
                            <p className="mt-1 text-[10px] opacity-75">{categoryLabels[task.category]}</p>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="rounded p-1 text-muted-foreground opacity-100 transition-colors hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                            title="Sil"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
