import { playNotificationSound, type NotificationSoundId } from './notificationSound';

interface NotificationSoundOptions {
  soundEnabled?: boolean;
  soundVolume?: number;
  soundId?: NotificationSoundId;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleTaskNotification(
  title: string,
  date: string,
  time: string,
  minutesBefore: number,
  options: NotificationSoundOptions = {},
) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const taskTime = new Date(`${date}T00:00:00`);
  taskTime.setHours(hours, minutes, 0, 0);

  const notifyTime = new Date(taskTime.getTime() - minutesBefore * 60 * 1000);
  const delay = notifyTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      new Notification('Görev Hatırlatma', {
        body: minutesBefore > 0
          ? `${title} - ${minutesBefore} dakika sonra başlıyor`
          : `${title} - şimdi başlama zamanı!`,
        icon: '/icon-192.png',
        tag: title,
      });

      if (options.soundEnabled) {
        void playNotificationSound(options.soundVolume, options.soundId);
      }
    }, delay);
  }
}

export function scheduleMorningReminder(options: NotificationSoundOptions = {}) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const morning = new Date();
  morning.setHours(8, 0, 0, 0);
  const delay = morning.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      new Notification('Günaydın!', {
        body: 'Bugünkü planını oluşturmayı unutma!',
        icon: '/icon-192.png',
      });

      if (options.soundEnabled) {
        void playNotificationSound(options.soundVolume, options.soundId);
      }
    }, delay);
  }
}

export function scheduleEveningReminder(options: NotificationSoundOptions = {}) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const evening = new Date();
  evening.setHours(21, 0, 0, 0);
  const delay = evening.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      new Notification('Gün Sonu', {
        body: 'Günlük değerlendirmeni yazmayı unutma!',
        icon: '/icon-192.png',
      });

      if (options.soundEnabled) {
        void playNotificationSound(options.soundVolume, options.soundId);
      }
    }, delay);
  }
}
