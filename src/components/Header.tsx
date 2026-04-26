import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, BellOff, BellRing, Moon, Sun, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { requestNotificationPermission, scheduleEveningReminder, scheduleMorningReminder } from '@/lib/notifications';
import { getDailyQuote, usePlannerStore } from '@/store/usePlannerStore';

type PermState = 'default' | 'granted' | 'denied' | 'unsupported';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = 'Günlük Plan', subtitle }: HeaderProps) {
  const { darkMode, toggleDarkMode } = usePlannerStore();
  const notificationSoundEnabled = usePlannerStore((s) => s.notificationSoundEnabled);
  const notificationVolume = usePlannerStore((s) => s.notificationVolume);
  const notificationSoundId = usePlannerStore((s) => s.notificationSoundId);
  const today = format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr });
  const quote = getDailyQuote();

  const [perm, setPerm] = useState<PermState>('default');
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setPerm('Notification' in window ? (Notification.permission as PermState) : 'unsupported');
    setOnline(navigator.onLine);
    scheduleMorningReminder({ soundEnabled: notificationSoundEnabled, soundVolume: notificationVolume, soundId: notificationSoundId });
    scheduleEveningReminder({ soundEnabled: notificationSoundEnabled, soundVolume: notificationVolume, soundId: notificationSoundId });
  }, [notificationSoundEnabled, notificationVolume, notificationSoundId]);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleNotification = async () => {
    if (perm === 'unsupported') {
      toast.error('Tarayıcı bildirimleri desteklemiyor');
      return;
    }
    if (perm === 'denied') {
      toast.info('Bildirimler engellendi', {
        description: 'Tarayıcı adres çubuğundaki site ayarlarından bildirim iznini açabilirsin.',
        duration: 8000,
      });
      return;
    }

    const granted = await requestNotificationPermission();
    setPerm(granted ? 'granted' : (Notification.permission as PermState));

    if (granted) {
      toast.success('Bildirimler aktif');
      new Notification('Bildirimler aktif', { body: 'Görev hatırlatmaları açıldı.' });
    } else {
      toast.error('Bildirim izni reddedildi');
    }
  };

  const status = (() => {
    if (!online) {
      return {
        Icon: WifiOff,
        label: 'Çevrimdışı',
        title: 'Çevrimdışısın. Uygulama yeniden bağlandığında senkronizasyon devam eder.',
        className: 'bg-warning/12 text-warning border-warning/25',
      };
    }
    if (perm === 'denied' || perm === 'unsupported') {
      return {
        Icon: BellOff,
        label: perm === 'denied' ? 'Kapalı' : 'Destek yok',
        title: perm === 'denied' ? 'Bildirim izni reddedildi.' : 'Bu tarayıcı bildirimleri desteklemiyor.',
        className: 'bg-destructive/10 text-destructive border-destructive/25',
      };
    }
    if (perm === 'granted') {
      return {
        Icon: BellRing,
        label: 'Aktif',
        title: 'Bildirimler aktif.',
        className: 'bg-success/12 text-success border-success/25',
      };
    }
    return {
      Icon: Bell,
      label: 'Bildirim',
      title: 'Bildirimleri aç',
      className: 'bg-muted text-muted-foreground border-border',
    };
  })();

  const StatusIcon = status.Icon;

  return (
    <header className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-primary/85">Kişisel çalışma alanı</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{title}</h1>
        <p className="mt-2 text-sm capitalize text-muted-foreground">{subtitle || today}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{quote}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleNotification}
          title={status.title}
          className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-accent ${status.className}`}
        >
          <StatusIcon className="h-4 w-4" />
          <span>{status.label}</span>
        </button>
        <button
          onClick={toggleDarkMode}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Tema değiştir"
        >
          {darkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
