import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '@/store/usePlannerStore';

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  maxDate?: string;
}

export default function MiniCalendar({ selectedDate, onSelect, maxDate }: Props) {
  const [viewMonth, setViewMonth] = useState(() => parseISO(selectedDate));
  const allTasks = usePlannerStore((s) => s.tasks);

  const dayStats = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const task of allTasks) {
      const current = map.get(task.date) || { total: 0, done: 0 };
      current.total += 1;
      if (task.status === 'completed') current.done += 1;
      map.set(task.date, current);
    }
    return map;
  }, [allTasks]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const selectedObj = parseISO(selectedDate);
  const today = new Date();

  return (
    <div className="surface-panel rounded-xl p-4 animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setViewMonth((month) => subMonths(month, 1))}
          className="rounded-lg p-1.5 transition-colors hover:bg-muted"
          aria-label="Önceki ay"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="text-sm font-semibold capitalize">{format(viewMonth, 'LLLL yyyy', { locale: tr })}</p>
        <button
          onClick={() => setViewMonth((month) => addMonths(month, 1))}
          className="rounded-lg p-1.5 transition-colors hover:bg-muted"
          aria-label="Sonraki ay"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="py-1 text-center text-[10px] font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, viewMonth);
          const isSelected = isSameDay(day, selectedObj);
          const isCurrentDay = isSameDay(day, today);
          const stats = dayStats.get(key);
          const pct = stats && stats.total > 0 ? stats.done / stats.total : 0;
          const disabled = maxDate ? key > maxDate : false;

          return (
            <button
              key={key}
              onClick={() => !disabled && onSelect(key)}
              disabled={disabled}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-all ${
                isSelected
                  ? 'scale-105 bg-primary font-semibold text-primary-foreground'
                  : isCurrentDay
                    ? 'bg-primary/10 font-semibold text-primary'
                    : inMonth
                      ? 'text-foreground hover:bg-muted'
                      : 'text-muted-foreground/40'
              } ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
            >
              <span>{format(day, 'd')}</span>
              {stats && inMonth && (
                <div className="absolute bottom-1 flex gap-0.5">
                  <span
                    className={`h-1 w-1 rounded-full ${
                      isSelected
                        ? 'bg-primary-foreground'
                        : pct === 1
                          ? 'bg-success'
                          : pct >= 0.5
                            ? 'bg-warning'
                            : 'bg-destructive'
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 border-t border-border/60 pt-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[10px] text-muted-foreground">Tamamlandı</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          <span className="text-[10px] text-muted-foreground">Yarım</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
          <span className="text-[10px] text-muted-foreground">Eksik</span>
        </div>
      </div>
    </div>
  );
}
