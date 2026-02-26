import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

/**
 * Auth routes (/auth/*) are handled by the Route Handler in app/auth/[[...auth0]]/route.ts
 * so they run in Node.js serverless (longer timeout) instead of Edge.
 */
export async function middleware(request: NextRequest) {
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    // Exclude auth routes — handled by app/auth/[[...auth0]] (Node runtime)
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth).*)',
  ],
};
