import type { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

/**
 * Auth routes run here (Node.js) instead of Edge so Netlify serverless
 * timeout applies instead of the shorter edge timeout.
 */
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return auth0.middleware(request);
}

export async function POST(request: NextRequest) {
  return auth0.middleware(request);
}
