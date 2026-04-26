import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';
import type { CloudSnapshot } from '@/lib/syncTypes';
import { getOwnerId } from '@/lib/authOwner';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const ownerId = await getOwnerId(request);
  const db = await getMongoDb();
  const [tasks, notes, journalRows, settings] = await Promise.all([
    db.collection('tasks').find({ ownerId }).project({ _id: 0, ownerId: 0, syncedAt: 0 }).toArray(),
    db.collection('notes').find({ ownerId }).project({ _id: 0, ownerId: 0, syncedAt: 0 }).toArray(),
    db.collection('journals').find({ ownerId }).project({ _id: 0, ownerId: 0, syncedAt: 0 }).toArray(),
    db.collection('settings').findOne({ ownerId }, { projection: { _id: 0, ownerId: 0 } }),
  ]);

  const journals = Object.fromEntries(journalRows.map((entry) => [entry.date, entry]));

  return NextResponse.json({
    configured: true,
    snapshot: {
      tasks,
      notes,
      journals,
      settings,
    },
  });
}

export async function PUT(request: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const ownerId = await getOwnerId(request);
  const snapshot = (await request.json()) as CloudSnapshot;
  const db = await getMongoDb();

  const tasks = snapshot.tasks || [];
  const notes = snapshot.notes || [];
  const journalEntries = Object.values(snapshot.journals || {});
  const now = new Date();

  await Promise.all([
    tasks.length
      ? db.collection('tasks').bulkWrite(tasks.map((task) => ({
          replaceOne: {
            filter: { ownerId, id: task.id },
            replacement: { ...task, ownerId, syncedAt: now },
            upsert: true,
          },
        })))
      : Promise.resolve(),
    notes.length
      ? db.collection('notes').bulkWrite(notes.map((note) => ({
          replaceOne: {
            filter: { ownerId, id: note.id },
            replacement: { ...note, ownerId, syncedAt: now },
            upsert: true,
          },
        })))
      : Promise.resolve(),
    journalEntries.length
      ? db.collection('journals').bulkWrite(journalEntries.map((journal) => ({
          replaceOne: {
            filter: { ownerId, date: journal.date },
            replacement: { ...journal, ownerId, syncedAt: now },
            upsert: true,
          },
        })))
      : Promise.resolve(),
    db.collection('settings').replaceOne(
      { ownerId },
      { ...(snapshot.settings || {}), ownerId, syncedAt: now },
      { upsert: true },
    ),
  ]);

  await Promise.all([
    db.collection('tasks').deleteMany({ ownerId, id: { $nin: tasks.map((task) => task.id) } }),
    db.collection('notes').deleteMany({ ownerId, id: { $nin: notes.map((note) => note.id) } }),
    db.collection('journals').deleteMany({ ownerId, date: { $nin: journalEntries.map((journal) => journal.date) } }),
  ]);

  return NextResponse.json({ configured: true, ok: true });
}
