import type { Db } from 'mongodb';

let ensured = false;

export async function ensureMongoIndexes(db: Db) {
  if (ensured) return;

  await Promise.all([
    db.collection('tasks').createIndex({ ownerId: 1, date: 1 }),
    db.collection('tasks').createIndex({ ownerId: 1, status: 1 }),
    db.collection('tasks').createIndex({ ownerId: 1, createdAt: -1 }),
    db.collection('tasks').createIndex({ ownerId: 1, notificationEnabled: 1, notifiedAt: 1, date: 1, time: 1 }),
    db.collection('notes').createIndex({ ownerId: 1, date: 1 }),
    db.collection('notes').createIndex({ ownerId: 1, createdAt: -1 }),
    db.collection('journals').createIndex({ ownerId: 1, date: 1 }, { unique: true }),
    db.collection('pushSubscriptions').createIndex({ ownerId: 1, endpoint: 1 }, { unique: true }),
    db.collection('settings').createIndex({ ownerId: 1 }, { unique: true }),
  ]);

  ensured = true;
}
