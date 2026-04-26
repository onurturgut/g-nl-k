import { NextRequest, NextResponse } from 'next/server';
import { getOwnerId } from '@/lib/authOwner';
import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';
import { isWebPushConfigured } from '@/lib/webPush';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isMongoConfigured() || !isWebPushConfigured()) {
    return NextResponse.json({ configured: false }, { status: 202 });
  }

  const ownerId = await getOwnerId(request);
  const subscription = await request.json();

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const db = await getMongoDb();
  await db.collection('pushSubscriptions').replaceOne(
    { ownerId, endpoint: subscription.endpoint },
    { ...subscription, ownerId, updatedAt: new Date() },
    { upsert: true },
  );

  return NextResponse.json({ ok: true });
}
