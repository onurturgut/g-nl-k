import { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '@/store/usePlannerStore';

export default function MonthlyCalendarOverview() {
  const [month, setMonth] = useState(() => new Date());
  const tasks = usePlannerStore((s) => s.tasks);
  const notes = usePlannerStore((s) => s.notes);
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  }), [month]);

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="glass-strong rounded-2xl p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold">Takvim</h2>
              <p className="text-xs text-muted-foreground">Aylık görev ve not yoğunluğu</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonth((value) => subMonths(value, 1))} className="rounded-xl p-2 hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setMonth((value) => addMonths(value, 1))} className="rounded-xl p-2 hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <h3 className="mt-4 text-center text-sm font-semibold capitalize">{format(month, 'LLLL yyyy', { locale: tr })}</h3>
      </section>

      <section className="glass rounded-2xl p-4 shadow-soft">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
            <div key={day} className="py-1 text-center text-[10px] font-medium text-muted-foreground">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasks.filter((task) => task.date === key);
            const dayNotes = notes.filter((note) => note.date === key);
            const completed = dayTasks.filter((task) => task.status === 'completed').length;
            return (
              <div key={key} className={`min-h-20 rounded-xl border px-2 py-2 ${isSameMonth(day, month) ? 'border-border bg-background/45' : 'border-transparent bg-muted/30 opacity-50'}`}>
                <p className="text-xs font-semibold">{format(day, 'd')}</p>
                <div className="mt-2 space-y-1">
                  {dayTasks.length > 0 && <div className="rounded-md bg-primary/10 px-1.5 py-1 text-[9px] font-medium text-primary">{completed}/{dayTasks.length} görev</div>}
                  {dayNotes.length > 0 && <div className="rounded-md bg-warning/15 px-1.5 py-1 text-[9px] font-medium text-warning">{dayNotes.length} not</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
