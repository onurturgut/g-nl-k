import { beforeEach, describe, expect, it } from 'vitest';
import { usePlannerStore } from './usePlannerStore';

const baseTask = {
  title: 'Planlama',
  time: '09:00',
  category: 'work' as const,
  status: 'pending' as const,
  priority: 'medium' as const,
  note: '',
  date: '2026-04-26',
  notificationEnabled: false,
  notificationMinutes: 5,
  recurring: 'none' as const,
};

describe('planner store', () => {
  beforeEach(() => {
    usePlannerStore.setState({
      tasks: [],
      journals: {},
      notes: [],
      darkMode: false,
      notificationSoundEnabled: true,
      notificationVolume: 0.45,
      notificationSoundId: 'classic-bell',
    });
  });

  it('creates daily recurring tasks for the next 30 days', () => {
    usePlannerStore.getState().addTask({ ...baseTask, recurring: 'daily' });

    const tasks = usePlannerStore.getState().tasks;

    expect(tasks).toHaveLength(30);
    expect(tasks[0].date).toBe('2026-04-26');
    expect(tasks[29].date).toBe('2026-05-25');
  });

  it('creates weekly recurring tasks on the same weekday for the next 12 weeks', () => {
    usePlannerStore.getState().addTask({ ...baseTask, recurring: 'weekly' });

    const tasks = usePlannerStore.getState().tasks;

    expect(tasks).toHaveLength(12);
    expect(tasks.map((task) => task.date).slice(0, 4)).toEqual([
      '2026-04-26',
      '2026-05-03',
      '2026-05-10',
      '2026-05-17',
    ]);
  });

  it('creates weekly recurring tasks for selected weekdays and week count', () => {
    usePlannerStore.getState().addTask({
      ...baseTask,
      recurring: 'weekly',
      recurringWeeks: 2,
      recurringWeekdays: [0, 2],
    });

    const tasks = usePlannerStore.getState().tasks;

    expect(tasks.map((task) => task.date)).toEqual([
      '2026-04-27',
      '2026-04-29',
      '2026-05-04',
      '2026-05-06',
    ]);
  });

  it('stores titled quick notes', () => {
    usePlannerStore.getState().addNote({
      title: 'Toplantı notu',
      text: 'Kararları özetle.',
      date: '2026-04-26',
      time: '14:30',
    });

    expect(usePlannerStore.getState().notes[0]).toMatchObject({
      title: 'Toplantı notu',
      text: 'Kararları özetle.',
      date: '2026-04-26',
      time: '14:30',
    });
  });
});
