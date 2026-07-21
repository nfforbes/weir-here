import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';
import Application from '@/models/Application';

// Force public DNS before any SRV lookups (Windows Node often fails querySrv via OS resolver).
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

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

/**
 * Expand mongodb+srv:// to mongodb:// using public DNS, avoiding Node's broken
 * querySrv path on some Windows setups (ECONNREFUSED to loopback:53).
 */
async function expandMongoSrvUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

  const parsed = new URL(uri.replace(/^mongodb\+srv:/i, 'http:'));
  const hostname = parsed.hostname;
  if (!hostname) {
    throw new Error('Invalid mongodb+srv URI: missing hostname');
  }

  const auth =
    parsed.username || parsed.password
      ? `${encodeURIComponent(decodeURIComponent(parsed.username))}:${encodeURIComponent(decodeURIComponent(parsed.password))}@`
      : '';

  const srvRecords = await resolveSrv(`_mongodb._tcp.${hostname}`);
  if (!srvRecords.length) {
    throw new Error(`No SRV records found for _mongodb._tcp.${hostname}`);
  }

  const hosts = srvRecords
    .map((r) => `${r.name.replace(/\.$/, '')}:${r.port}`)
    .join(',');

  const params = new URLSearchParams(parsed.search);
  params.set('tls', 'true');
  params.delete('ssl');

  try {
    const txtRecords = await resolveTxt(hostname);
    const txt = txtRecords.flat().join('');
    for (const part of txt.split('&')) {
      const eq = part.indexOf('=');
      if (eq <= 0) continue;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (key && !params.has(key)) params.set(key, value);
    }
  } catch {
    // TXT is optional; Atlas usually provides replicaSet/authSource there.
  }

  const pathname = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/';
  return `mongodb://${auth}${hosts}${pathname}?${params.toString()}`;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const connectUri = await expandMongoSrvUri(uri);
      return mongoose.connect(connectUri, CONNECT_OPTS);
    })();
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
