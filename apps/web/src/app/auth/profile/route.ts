import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

/**
 * @auth0/nextjs-auth0 useUser() fetches this route by default (or NEXT_PUBLIC_PROFILE_ROUTE).
 * When AUTH0_SECRET is unset, middleware skips Auth0 and does not serve /auth/profile — that
 * produced 404s in the dev terminal. This handler matches the SDK contract: JSON user or 204.
 */
export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(session.user);
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
