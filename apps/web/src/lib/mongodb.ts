import mongoose from 'mongoose';
import dns from 'dns';
import Application from '@/models/Application';

// Workaround for querySrv ECONNREFUSED lookup issues on Windows/local network resolvers
dns.setServers(['8.8.8.8', '1.1.1.1']);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

let applicationIndexesSynced = false;

const CONNECT_OPTS: mongoose.ConnectOptions = {
  bufferCommands: false,
  // Netlify/AWS Lambda: fail fast so SSR returns before the platform 10s limit → avoids 502 Bad Gateway
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 8_000,
  socketTimeoutMS: 15_000,
  maxPoolSize: 5,
};

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, CONNECT_OPTS);
  }

  try {
    cached.conn = await cached.promise;
    if (!applicationIndexesSynced) {
      applicationIndexesSynced = true;
      try {
        await Application.syncIndexes();
      } catch (syncErr) {
        console.error('[mongodb] Application.syncIndexes failed:', syncErr);
        applicationIndexesSynced = false;
        throw syncErr;
      }
    }
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
}
