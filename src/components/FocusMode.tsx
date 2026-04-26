import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';

type FocusPreset = 25 | 45 | 60;

export default function FocusMode() {
  const [preset, setPreset] = useState<FocusPreset>(25);
  const [secondsLeft, setSecondsLeft] = useState(preset * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(preset * 60);
    setRunning(false);
  }, [preset]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const formatted = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="glass-strong rounded-2xl p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Odak Modu</h2>
            <p className="text-xs text-muted-foreground">Pomodoro tabanlı sakin çalışma alanı</p>
          </div>
        </div>
      </section>
      <section className="glass rounded-2xl p-6 text-center shadow-soft">
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-border bg-background">
          <span className="font-mono text-5xl font-semibold tabular-nums">{formatted}</span>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {([25, 45, 60] as FocusPreset[]).map((value) => (
            <button key={value} onClick={() => setPreset(value)} className={`rounded-xl px-3 py-2 text-xs font-medium ${preset === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{value} dk</button>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => setRunning((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? 'Duraklat' : 'Başlat'}
          </button>
          <button onClick={() => { setRunning(false); setSecondsLeft(preset * 60); }} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
            <RotateCcw className="h-4 w-4" />
            Sıfırla
          </button>
        </div>
      </section>
    </div>
  );
}
