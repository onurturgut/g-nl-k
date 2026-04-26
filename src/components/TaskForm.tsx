import { useState } from 'react';
import { Bell, BellOff, Plus, X } from 'lucide-react';
import { scheduleTaskNotification } from '@/lib/notifications';
import { type TaskCategory, type TaskPriority, usePlannerStore } from '@/store/usePlannerStore';

interface Props {
  date: string;
  triggerLabel?: string;
  title?: string;
}

const categories: { value: TaskCategory; label: string }[] = [
  { value: 'work', label: 'İş' },
  { value: 'personal', label: 'Kişisel' },
  { value: 'sport', label: 'Spor' },
  { value: 'health', label: 'Sağlık' },
  { value: 'education', label: 'Eğitim' },
  { value: 'other', label: 'Diğer' },
];

export default function TaskForm({ date, triggerLabel = 'Yeni Görev Ekle', title: formTitle = 'Yeni Görev' }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [note, setNote] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifMinutes, setNotifMinutes] = useState(5);
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly'>('none');

  const addTask = usePlannerStore((s) => s.addTask);
  const notificationSoundEnabled = usePlannerStore((s) => s.notificationSoundEnabled);
  const notificationVolume = usePlannerStore((s) => s.notificationVolume);
  const notificationSoundId = usePlannerStore((s) => s.notificationSoundId);

  const handleSubmit = () => {
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      time,
      category,
      priority,
      note,
      date,
      status: 'pending',
      notificationEnabled: notifEnabled,
      notificationMinutes: notifMinutes,
      recurring,
    });

    if (notifEnabled) {
      scheduleTaskNotification(title, date, time, notifMinutes, {
        soundEnabled: notificationSoundEnabled,
        soundVolume: notificationVolume,
        soundId: notificationSoundId,
      });
    }

    setTitle('');
    setNote('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/35 bg-primary/5 p-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="surface-panel space-y-4 rounded-xl p-5 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{formTitle}</h3>
        <button onClick={() => setOpen(false)} className="rounded-lg p-1 transition-colors hover:bg-accent">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Görev başlığı..."
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30"
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Saat</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Öncelik</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs text-muted-foreground">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                category === c.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs text-muted-foreground">Tekrar</label>
        <div className="flex gap-2">
          {([['none', 'Yok'], ['daily', 'Günlük'], ['weekly', 'Haftalık']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setRecurring(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                recurring === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setNotifEnabled(!notifEnabled)}
          className={`rounded-lg p-2 transition-colors ${notifEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          aria-label="Bildirim durumunu değiştir"
        >
          {notifEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </button>
        {notifEnabled && (
          <select
            value={notifMinutes}
            onChange={(e) => setNotifMinutes(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none"
          >
            <option value={0}>Tam saatinde</option>
            <option value={5}>5 dk önce</option>
            <option value={15}>15 dk önce</option>
            <option value={30}>30 dk önce</option>
          </select>
        )}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Not ekle (opsiyonel)..."
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30"
      />

      <button
        onClick={handleSubmit}
        disabled={!title.trim()}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
      >
        Görevi Ekle
      </button>
    </div>
  );
}
