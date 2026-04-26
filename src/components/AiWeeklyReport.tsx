import { useMemo, useState } from 'react';
import { endOfWeek, format, startOfWeek } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { usePlannerStore } from '@/store/usePlannerStore';

export default function AiWeeklyReport() {
  const tasks = usePlannerStore((s) => s.tasks);
  const notes = usePlannerStore((s) => s.notes);
  const journals = usePlannerStore((s) => s.journals);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const payload = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const startKey = format(start, 'yyyy-MM-dd');
    const endKey = format(end, 'yyyy-MM-dd');
    return {
      range: { start: startKey, end: endKey },
      tasks: tasks.filter((task) => task.date >= startKey && task.date <= endKey),
      notes: notes.filter((note) => note.date && note.date >= startKey && note.date <= endKey),
      journals: Object.values(journals).filter((entry) => entry.date >= startKey && entry.date <= endKey),
    };
  }, [journals, notes, tasks]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/weekly-report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setReport(data.report || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass rounded-2xl p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">AI Haftalık Rapor</h3>
            <p className="text-xs text-muted-foreground">Görev, not ve günlük kayıtlarından kısa performans özeti.</p>
          </div>
        </div>
        <button onClick={generateReport} disabled={loading} className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50">
          {loading ? 'Hazırlanıyor' : 'Rapor üret'}
        </button>
      </div>
      {report && <div className="mt-4 whitespace-pre-wrap rounded-xl bg-background/60 p-4 text-sm leading-6 text-foreground">{report}</div>}
    </section>
  );
}
