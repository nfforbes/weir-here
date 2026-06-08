import type { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import type { UserDocument } from '@/models/User';
import { getApiAuthUser } from '@/lib/apiAuth';

type AdminResult =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof auth0.getSession>>>; admin: UserDocument }
  | { ok: false; status: 401 | 403 };

/**
 * Ensures the requester is logged in and has the administrator persona in the database.
 * Accepts both cookie sessions (web) and Bearer JWT tokens (mobile).
 */
export async function requireAdministrator(request?: NextRequest): Promise<AdminResult> {
  await connectDB();

  // Try cookie session first (web browser)
  const session = await auth0.getSession();
  if (session?.user?.sub) {
    const admin = await User.findOne({ auth0Id: session.user.sub });
    if (!admin?.personas.includes('administrator')) {
      return { ok: false, status: 403 };
    }
    return { ok: true, session, admin };
  }

  // Fall back to Bearer token (mobile app)
  if (request) {
    const apiUser = await getApiAuthUser(request);
    if (!apiUser) return { ok: false, status: 401 };
    const admin = await User.findOne({ auth0Id: apiUser.sub });
    if (!admin?.personas.includes('administrator')) {
      return { ok: false, status: 403 };
    }
    // Build a minimal session-like object so callers that check session.user.sub still work
    const fakeSession = { user: { sub: apiUser.sub, email: apiUser.email } } as NonNullable<Awaited<ReturnType<typeof auth0.getSession>>>;
    return { ok: true, session: fakeSession, admin };
  }

  return { ok: false, status: 401 };
}

export async function countAdministrators(): Promise<number> {
  return User.countDocuments({ personas: 'administrator' });
}
