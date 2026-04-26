'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePlannerStore } from '@/store/usePlannerStore';
import type { CloudSnapshot } from '@/lib/syncTypes';

const ownerId = process.env.NEXT_PUBLIC_APP_USER_ID || 'local-user';

function getStamp(item: { updatedAt?: string; createdAt?: string }) {
  return Date.parse(item.updatedAt || item.createdAt || '') || 0;
}

function mergeById<T extends { id: string; updatedAt?: string; createdAt?: string }>(localItems: T[], cloudItems: T[] = []) {
  const map = new Map<string, T>();
  for (const item of cloudItems) map.set(item.id, item);
  for (const item of localItems) {
    const current = map.get(item.id);
    if (!current || getStamp(item) >= getStamp(current)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

function mergeJournals(
  localJournals: CloudSnapshot['journals'],
  cloudJournals: CloudSnapshot['journals'] = {},
) {
  const merged = { ...cloudJournals };

  for (const [date, entry] of Object.entries(localJournals)) {
    const current = merged[date];
    if (!current || getStamp(entry) >= getStamp(current)) {
      merged[date] = entry;
    }
  }

  return merged;
}

function createSnapshot(): CloudSnapshot {
  const state = usePlannerStore.getState();

  return {
    tasks: state.tasks,
    notes: state.notes,
    journals: state.journals,
    settings: {
      darkMode: state.darkMode,
      notificationSoundEnabled: state.notificationSoundEnabled,
      notificationVolume: state.notificationVolume,
      notificationSoundId: state.notificationSoundId,
    },
  };
}

export default function CloudSync() {
  const hydratedRef = useRef(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromCloud() {
      try {
        const response = await fetch('/api/sync', {
          headers: { 'x-owner-id': ownerId },
        });
        const data = await response.json();

        if (cancelled || !data.configured || !data.snapshot) return;

        const snapshot = data.snapshot as Partial<CloudSnapshot>;
        const local = usePlannerStore.getState();
        usePlannerStore.setState({
          tasks: mergeById(local.tasks, snapshot.tasks || []),
          notes: mergeById(local.notes, snapshot.notes || []),
          journals: mergeJournals(local.journals, snapshot.journals),
          ...(snapshot.settings || {}),
        });
      } catch {
        toast.warning('Bulut senkronizasyonu başlatılamadı');
      } finally {
        hydratedRef.current = true;
      }
    }

    void hydrateFromCloud();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = usePlannerStore.subscribe(() => {
      if (!hydratedRef.current || syncingRef.current || typeof navigator !== 'undefined' && !navigator.onLine) return;

      syncingRef.current = true;
      window.setTimeout(async () => {
        try {
          await fetch('/api/sync', {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              'x-owner-id': ownerId,
            },
            body: JSON.stringify(createSnapshot()),
          });
        } finally {
          syncingRef.current = false;
        }
      }, 750);
    });

    return unsubscribe;
  }, []);

  return null;
}
