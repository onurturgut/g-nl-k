import { useEffect, useState } from 'react';
import { Bell, BellRing, BellOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { requestNotificationPermission } from '@/lib/notifications';
import { subscribeToPush } from '@/lib/pushClient';
import {
  notificationSoundLibrary,
  playNotificationSound,
  unlockNotificationSound,
  type NotificationSoundId,
} from '@/lib/notificationSound';
import { usePlannerStore } from '@/store/usePlannerStore';

type PermState = 'default' | 'granted' | 'denied' | 'unsupported';
const ownerId = process.env.NEXT_PUBLIC_APP_USER_ID || 'local-user';

export default function NotificationSettings() {
  const [perm, setPerm] = useState<PermState>('default');
  const soundEnabled = usePlannerStore((s) => s.notificationSoundEnabled);
  const volume = usePlannerStore((s) => s.notificationVolume);
  const soundId = usePlannerStore((s) => s.notificationSoundId);
  const setSoundEnabled = usePlannerStore((s) => s.setNotificationSoundEnabled);
  const setVolume = usePlannerStore((s) => s.setNotificationVolume);
  const setSoundId = usePlannerStore((s) => s.setNotificationSoundId);

  useEffect(() => {
    setPerm('Notification' in window ? (Notification.permission as PermState) : 'unsupported');
  }, []);

  const requestPermission = async () => {
    const soundReady = await unlockNotificationSound();
    const granted = await requestNotificationPermission();
    setPerm(granted ? 'granted' : ('Notification' in window ? (Notification.permission as PermState) : 'unsupported'));

    if (granted) {
      const push = await subscribeToPush(ownerId);
      toast.success('Bildirimler hazır', {
        description: push.ok
          ? 'Web Push aboneliği de kaydedildi.'
          : soundReady
            ? 'Görev zil sesi aktif. Push için VAPID/Mongo yapılandırması gerekir.'
            : 'Bildirim izni alındı, ses bu tarayıcıda desteklenmiyor.',
      });
      if (soundEnabled) {
        void playNotificationSound(volume, soundId);
      }
      return;
    }

    toast.error('Bildirim izni alınamadı');
  };

  const testSound = async () => {
    const ready = await unlockNotificationSound();
    if (!ready) {
      toast.error('Ses bu tarayıcıda desteklenmiyor');
      return;
    }

    await playNotificationSound(volume, soundId);
    toast.success('Görev zil sesi çalındı');
  };

  const selectSound = async (nextSoundId: NotificationSoundId) => {
    setSoundId(nextSoundId);
    if (!soundEnabled) return;

    const ready = await unlockNotificationSound();
    if (ready) {
      void playNotificationSound(volume, nextSoundId);
    }
  };

  const status = (() => {
    if (perm === 'granted') return { Icon: BellRing, label: 'Bildirim açık', cls: 'text-success' };
    if (perm === 'denied') return { Icon: BellOff, label: 'Bildirim engelli', cls: 'text-destructive' };
    if (perm === 'unsupported') return { Icon: BellOff, label: 'Desteklenmiyor', cls: 'text-muted-foreground' };
    return { Icon: Bell, label: 'İzin bekliyor', cls: 'text-warning' };
  })();

  const StatusIcon = status.Icon;

  return (
    <section className="glass rounded-2xl shadow-soft p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">Bildirim Ayarları</h2>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <StatusIcon className={`h-3.5 w-3.5 ${status.cls}`} />
            <span>{status.label}</span>
          </div>
        </div>
        <button
          onClick={requestPermission}
          disabled={perm === 'unsupported'}
          className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
        >
          Bildirimi Aç
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
            soundEnabled ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {soundEnabled ? 'Zil sesi açık' : 'Zil sesi kapalı'}
        </button>

        <button
          onClick={testSound}
          disabled={!soundEnabled}
          className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Zili Test Et
        </button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Ses seviyesi</label>
          <span className="text-[10px] text-muted-foreground">%{Math.round(volume * 100)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground">Zil Kitaplığı</h3>
          <span className="text-[10px] text-muted-foreground">{notificationSoundLibrary.length} ton</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {notificationSoundLibrary.map((sound) => {
            const selected = sound.id === soundId;

            return (
              <button
                key={sound.id}
                onClick={() => selectSound(sound.id)}
                className={`rounded-xl border px-3 py-2 text-left transition-all ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-accent/30 text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{sound.name}</span>
                  {selected && <BellRing className="h-3.5 w-3.5" />}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">{sound.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
