import { useEffect, useState } from 'react';
import { parseISO } from 'date-fns';
import { Bell, BellOff, ChevronDown, Plus } from 'lucide-react';
import { scheduleTaskNotification } from '@/lib/notifications';
import { type TaskCategory, type TaskPriority, usePlannerStore } from '@/store/usePlannerStore';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Props {
  date: string;
  triggerLabel?: string;
  title?: string;
  compact?: boolean;
  initialRecurring?: 'none' | 'daily' | 'weekly';
}

const categories: { value: TaskCategory; label: string }[] = [
  { value: 'work', label: 'İş' },
  { value: 'personal', label: 'Kişisel' },
  { value: 'sport', label: 'Spor' },
  { value: 'health', label: 'Sağlık' },
  { value: 'education', label: 'Eğitim' },
  { value: 'other', label: 'Diğer' },
];

const recurringHelp: Record<'none' | 'daily' | 'weekly', string> = {
  none: 'Sadece seçili güne eklenir.',
  daily: 'Bugünden başlayarak 30 güne eklenir.',
  weekly: 'Seçtiğin hafta sayısı boyunca seçili günlere eklenir.',
};

const weekdays = [
  { value: 0, label: 'Pzt' },
  { value: 1, label: 'Sal' },
  { value: 2, label: 'Çar' },
  { value: 3, label: 'Per' },
  { value: 4, label: 'Cum' },
  { value: 5, label: 'Cmt' },
  { value: 6, label: 'Paz' },
];

function getWeekdayIndex(date: string) {
  return (parseISO(date).getDay() + 6) % 7;
}

export default function TaskForm({
  date,
  triggerLabel = 'Görev Ekle',
  title: formTitle = 'Yeni görev',
  compact = false,
  initialRecurring = 'none',
}: Props) {
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [note, setNote] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifMinutes, setNotifMinutes] = useState(5);
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly'>('none');
  const [recurringWeeks, setRecurringWeeks] = useState(12);
  const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>(() => [getWeekdayIndex(date)]);

  const addTask = usePlannerStore((s) => s.addTask);
  const notificationSoundEnabled = usePlannerStore((s) => s.notificationSoundEnabled);
  const notificationVolume = usePlannerStore((s) => s.notificationVolume);
  const notificationSoundId = usePlannerStore((s) => s.notificationSoundId);

  useEffect(() => {
    if (!open) {
      setRecurringWeekdays([getWeekdayIndex(date)]);
      return;
    }

    if (initialRecurring !== 'none') {
      setRecurring(initialRecurring);
      setAdvancedOpen(true);
      setRecurringWeekdays([getWeekdayIndex(date)]);
    }
  }, [date, initialRecurring, open]);

  const resetForm = () => {
    setTitle('');
    setNote('');
    setPriority('medium');
    setRecurring('none');
    setRecurringWeeks(12);
    setRecurringWeekdays([getWeekdayIndex(date)]);
    setNotifEnabled(false);
    setAdvancedOpen(false);
  };

  const toggleWeekday = (weekday: number) => {
    setRecurringWeekdays((current) => {
      if (current.includes(weekday)) {
        const next = current.filter((item) => item !== weekday);
        return next.length > 0 ? next : current;
      }

      return [...current, weekday].sort((a, b) => a - b);
    });
  };

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
      recurringWeeks: recurring === 'weekly' ? recurringWeeks : undefined,
      recurringWeekdays: recurring === 'weekly' ? recurringWeekdays : undefined,
    });

    if (notifEnabled) {
      scheduleTaskNotification(title, date, time, notifMinutes, {
        soundEnabled: notificationSoundEnabled,
        soundVolume: notificationVolume,
        soundId: notificationSoundId,
      });
    }

    resetForm();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={
            compact
              ? 'inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
              : 'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/35 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10'
          }
        >
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full max-w-md flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{formTitle}</SheetTitle>
          <SheetDescription>Önce sadece gerekli alanları doldur. Detaylar isteğe bağlı.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Görev adı</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ne yapılacak?"
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/25"
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Saat</span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Kategori</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TaskCategory)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Daha fazla seçenek
            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          </button>

          {advancedOpen && (
            <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-3 animate-fade-in">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Öncelik</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TaskPriority)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                >
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Tekrar</span>
                <select
                  value={recurring}
                  onChange={(event) => setRecurring(event.target.value as 'none' | 'daily' | 'weekly')}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                >
                  <option value="none">Yok</option>
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                </select>
                <span className="text-[11px] leading-4 text-muted-foreground">{recurringHelp[recurring]}</span>
              </label>

              {recurring === 'weekly' && (
                <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Kaç hafta tekrarlansın?</span>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={recurringWeeks}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setRecurringWeeks(Math.min(52, Math.max(1, Number.isFinite(value) ? value : 1)));
                      }}
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </label>

                  <div className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Haftanın günleri</span>
                    <div className="grid grid-cols-7 gap-1">
                      {weekdays.map((weekday) => {
                        const active = recurringWeekdays.includes(weekday.value);
                        return (
                          <button
                            key={weekday.value}
                            type="button"
                            onClick={() => toggleWeekday(weekday.value)}
                            className={`h-9 rounded-lg text-xs font-medium transition-colors ${
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {weekday.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNotifEnabled((value) => !value)}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                    notifEnabled ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'
                  }`}
                >
                  {notifEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  Bildirim
                </button>
                {notifEnabled && (
                  <select
                    value={notifMinutes}
                    onChange={(event) => setNotifMinutes(Number(event.target.value))}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none"
                  >
                    <option value={0}>Tam saatinde</option>
                    <option value={5}>5 dk önce</option>
                    <option value={15}>15 dk önce</option>
                    <option value={30}>30 dk önce</option>
                  </select>
                )}
              </div>

              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Not</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Opsiyonel kısa not..."
                  rows={3}
                  className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/25"
                />
              </label>
            </div>
          )}
        </div>

        <SheetFooter className="mt-auto gap-2 sm:space-x-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Kaydet
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
