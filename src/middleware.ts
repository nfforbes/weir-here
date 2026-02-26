import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * No Auth0 logic at the Edge (avoids Netlify Edge timeouts/AbortError).
 * Auth is handled entirely by app/auth/[[...auth0]]/route.ts (Node runtime).
 * Session is read in layout/API via getAppUser() in Node.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
