import { NextRequest, NextResponse } from 'next/server';
import type { PushSubscription } from 'web-push';
import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';
import { getWebPush, isWebPushConfigured } from '@/lib/webPush';

export const runtime = 'nodejs';

interface ReminderTask {
  _id: unknown;
  id: string;
  ownerId: string;
  title: string;
  date: string;
  time: string;
  notificationMinutes?: number;
}

interface StoredPushSubscription extends PushSubscription {
  _id: unknown;
  ownerId: string;
}

function taskReminderDate(task: ReminderTask) {
  const [hours, minutes] = task.time.split(':').map(Number);
  const date = new Date(`${task.date}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() - (task.notificationMinutes || 0));
  return date;
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!isMongoConfigured() || !isWebPushConfigured()) {
    return NextResponse.json({ configured: false, sent: 0 });
  }

  const db = await getMongoDb();
  const webpush = getWebPush();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const candidates = await db.collection<ReminderTask>('tasks').find({
    notificationEnabled: true,
    notifiedAt: { $exists: false },
    date: { $gte: today, $lte: tomorrow.toISOString().slice(0, 10) },
  }).toArray();

  let sent = 0;

  for (const task of candidates) {
    const remindAt = taskReminderDate(task);
    if (remindAt > now) continue;

    const subscriptions = await db.collection<StoredPushSubscription>('pushSubscriptions').find({ ownerId: task.ownerId }).toArray();
    const payload = JSON.stringify({
      title: 'Görev Hatırlatma',
      body: task.notificationMinutes > 0
        ? `${task.title} - ${task.notificationMinutes} dakika sonra başlıyor`
        : `${task.title} - şimdi başlama zamanı`,
      tag: `task-${task.id}`,
    });

    await Promise.allSettled(subscriptions.map((subscription) => (
      webpush.sendNotification(subscription, payload).catch(async (error) => {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await db.collection('pushSubscriptions').deleteOne({ _id: subscription._id });
        }
      })
    )));

    await db.collection('tasks').updateOne({ _id: task._id }, { $set: { notifiedAt: now } });
    sent += subscriptions.length;
  }

  return NextResponse.json({ ok: true, sent, checked: candidates.length });
}
