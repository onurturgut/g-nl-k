import { useMemo } from 'react';
import { AlertCircle, CheckCircle2, Clock, Target } from 'lucide-react';
import { usePlannerStore } from '@/store/usePlannerStore';

interface Props {
  date: string;
}

export default function QuickStats({ date }: Props) {
  const allTasks = usePlannerStore((s) => s.tasks);
  const tasks = useMemo(() => allTasks.filter((task) => task.date === date), [allTasks, date]);
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pending = tasks.filter((task) => task.status === 'pending').length;
  const missed = tasks.filter((task) => task.status === 'missed' || task.status === 'postponed').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { icon: Target, label: 'Toplam', value: total, color: 'text-primary' },
    { icon: CheckCircle2, label: 'Tamamlanan', value: completed, color: 'text-success' },
    { icon: Clock, label: 'Bekleyen', value: pending, color: 'text-warning' },
    { icon: AlertCircle, label: 'Ertelenen', value: missed, color: 'text-destructive' },
  ];

  return (
    <section className="surface-panel rounded-xl p-5 animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Günlük özet</h3>
          <p className="mt-1 text-xs text-muted-foreground">Seçili günün görev durumu</p>
        </div>
        <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">%{pct}</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-muted/55 p-3">
            <stat.icon className={`mb-2 h-4 w-4 ${stat.color}`} />
            <p className="text-xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
