import { MongoClient, type Db } from 'mongodb';
import { ensureMongoIndexes } from '@/lib/mongoIndexes';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'gunluk-plan';

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured() {
  return Boolean(uri);
}

export async function getMongoDb(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!global.mongoClientPromise) {
    const client = new MongoClient(uri);
    global.mongoClientPromise = client.connect();
  }

  const client = await global.mongoClientPromise;
  const db = client.db(dbName);
  await ensureMongoIndexes(db);
  return db;
}
