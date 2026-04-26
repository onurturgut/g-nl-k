import { useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarPlus } from 'lucide-react';
import TaskForm from '@/components/TaskForm';
import TaskTimeline from '@/components/TaskTimeline';
import { usePlannerStore } from '@/store/usePlannerStore';

interface Props {
  selectedDate: string;
  today: string;
}

export default function WeeklyTasks({ selectedDate, today }: Props) {
  const [activeDate, setActiveDate] = useState(selectedDate);
  const allTasks = usePlannerStore((s) => s.tasks);

  useEffect(() => {
    setActiveDate(selectedDate);
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const key = format(date, 'yyyy-MM-dd');
      const tasks = allTasks.filter((task) => task.date === key);

      return {
        date,
        key,
        total: tasks.length,
        done: tasks.filter((task) => task.status === 'completed').length,
      };
    });
  }, [allTasks, selectedDate]);

  const activeDay = weekDays.some((day) => day.key === activeDate) ? activeDate : weekDays[0]?.key || selectedDate;
  const activeDayObj = parseISO(activeDay);
  const activeIsPast = activeDay < today;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Haftalık görevler</h2>
          <p className="text-[11px] capitalize text-muted-foreground">
            {format(weekDays[0].date, 'd MMM', { locale: tr })} - {format(weekDays[6].date, 'd MMM yyyy', { locale: tr })}
          </p>
        </div>
        <CalendarPlus className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="surface-panel rounded-xl p-3">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isActive = day.key === activeDay;
            const isToday = day.key === today;
            const doneText = day.total > 0 ? `${day.done}/${day.total}` : '-';

            return (
              <button
                key={day.key}
                onClick={() => setActiveDate(day.key)}
                className={`min-h-16 rounded-lg px-1 py-2 text-center transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : isToday
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="block text-[10px] font-medium capitalize">{format(day.date, 'EEE', { locale: tr })}</span>
                <span className="block text-sm font-semibold">{format(day.date, 'd')}</span>
                <span
                  className={`mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[9px] ${
                    isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {doneText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold capitalize text-muted-foreground">
          {format(activeDayObj, 'd MMMM EEEE', { locale: tr })}
        </h3>
        {!isSameDay(activeDayObj, parseISO(selectedDate)) && (
          <button
            onClick={() => setActiveDate(selectedDate)}
            className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
          >
            Seçili güne dön
          </button>
        )}
      </div>

      {!activeIsPast ? (
        <TaskForm date={activeDay} triggerLabel="Bu güne haftalık görev ekle" title="Haftalık görev" />
      ) : (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
          Geçmiş günler için haftalık görev eklenemez.
        </p>
      )}

      <TaskTimeline
        date={activeDay}
        emptyTitle="Bu gün için haftalık görev yok"
        emptyDescription="Bu güne görev eklediğinde burada görünecek."
      />
    </section>
  );
}
