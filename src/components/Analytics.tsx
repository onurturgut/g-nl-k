import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePlannerStore, categoryLabels, type TaskCategory } from '@/store/usePlannerStore';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import AiWeeklyReport from '@/components/AiWeeklyReport';

export default function Analytics() {
  const tasks = usePlannerStore((s) => s.tasks);

  const weekData = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed').length;
      const total = dayTasks.length;
      return {
        day: format(day, 'EEE', { locale: tr }),
        tamamlanan: completed,
        toplam: total,
        oran: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [tasks]);

  const monthData = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });

    const totalTasks = tasks.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const completedTasks = totalTasks.filter((t) => t.status === 'completed');

    const categoryStats: Record<string, { total: number; completed: number }> = {};
    totalTasks.forEach((t) => {
      if (!categoryStats[t.category]) categoryStats[t.category] = { total: 0, completed: 0 };
      categoryStats[t.category].total++;
      if (t.status === 'completed') categoryStats[t.category].completed++;
    });

    const heatmap = days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed').length;
      const total = dayTasks.length;
      return {
        date: dateStr,
        day: format(day, 'd'),
        level: total === 0 ? 0 : Math.ceil((completed / total) * 4),
      };
    });

    return {
      total: totalTasks.length,
      completed: completedTasks.length,
      pct: totalTasks.length > 0 ? Math.round((completedTasks.length / totalTasks.length) * 100) : 0,
      categories: Object.entries(categoryStats).map(([cat, stats]) => ({
        category: categoryLabels[cat as TaskCategory] || cat,
        toplam: stats.total,
        tamamlanan: stats.completed,
      })),
      heatmap,
    };
  }, [tasks]);

  const bestDay = weekData.reduce((best, d) => (d.oran > best.oran ? d : best), weekData[0]);
  const worstDay = weekData.reduce((worst, d) => (d.oran < worst.oran ? d : worst), weekData[0]);

  const heatColors = ['bg-accent', 'bg-success/20', 'bg-success/40', 'bg-success/60', 'bg-success/80'];

  return (
    <div className="space-y-4 animate-fade-in">
      <AiWeeklyReport />

      {/* Weekly */}
      <div className="glass rounded-2xl shadow-soft p-5">
        <h3 className="font-semibold text-sm mb-4">Haftalık Performans</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="tamamlanan" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="toplam" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5 text-success">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>En iyi: {bestDay?.day} (%{bestDay?.oran})</span>
          </div>
          <div className="flex items-center gap-1.5 text-destructive">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>En düşük: {worstDay?.day} (%{worstDay?.oran})</span>
          </div>
        </div>
      </div>

      {/* Monthly */}
      <div className="glass rounded-2xl shadow-soft p-5">
        <h3 className="font-semibold text-sm mb-1">Aylık Özet</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {monthData.total} görev · {monthData.completed} tamamlandı · %{monthData.pct} başarı
        </p>

        {monthData.categories.length > 0 && (
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="tamamlanan" stroke="hsl(var(--success))" strokeWidth={2} />
                <Line type="monotone" dataKey="toplam" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Heatmap */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Aktivite Haritası</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {monthData.heatmap.map((d) => (
              <div
                key={d.date}
                className={`w-5 h-5 rounded-sm ${heatColors[d.level]} transition-colors`}
                title={`${d.date}: Seviye ${d.level}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <span>Az</span>
            {heatColors.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>Çok</span>
          </div>
        </div>
      </div>
    </div>
  );
}
