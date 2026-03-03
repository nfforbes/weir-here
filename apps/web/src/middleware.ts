import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

function hasValidAuth0Secret(): boolean {
  const secret = process.env.AUTH0_SECRET;
  return typeof secret === 'string' && secret.length >= 32;
}

export async function middleware(request: NextRequest) {
  if (!hasValidAuth0Secret()) {
    return NextResponse.next();
  }
  try {
    return await auth0.middleware(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid URL';
    if (message.includes('Invalid URL') || message.includes('URL')) {
      console.error('[Auth0 middleware]', message);
      return NextResponse.next();
    }
    throw err;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
