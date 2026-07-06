import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

function hasValidAuth0Secret(): boolean {
  const secret = process.env.AUTH0_SECRET;
  return typeof secret === 'string' && secret.length >= 32;
}

export async function middleware(request: NextRequest) {
  if (!hasValidAuth0Secret()) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Authentication service unavailable', {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return new NextResponse(
        'Auth0 is not configured: AUTH0_SECRET must be set (32+ characters) and available to middleware. Restart `next dev` after env or next.config changes.',
        { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      );
    }
    return NextResponse.next();
  }
  try {
    return await auth0.middleware(request);
  } catch (err) {
    console.error('[Auth0 middleware]', err);
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Authentication service unavailable', {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    // Fail open for public pages in development so a middleware bug/misconfig does not 500 SEO routes.
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return new NextResponse('Authentication service error', {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)',
  ],
};
