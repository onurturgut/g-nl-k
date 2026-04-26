import type { JournalEntry, QuickNote, Task } from '@/store/usePlannerStore';
import type { NotificationSoundId } from '@/lib/notificationSound';

export interface CloudSettings {
  darkMode: boolean;
  notificationSoundEnabled: boolean;
  notificationVolume: number;
  notificationSoundId: NotificationSoundId;
}

export interface CloudSnapshot {
  tasks: Task[];
  notes: QuickNote[];
  journals: Record<string, JournalEntry>;
  settings: CloudSettings;
}
