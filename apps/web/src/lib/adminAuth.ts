import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import type { UserDocument } from '@/models/User';

type AdminResult =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof auth0.getSession>>>; admin: UserDocument }
  | { ok: false; status: 401 | 403 };

/**
 * Ensures the requester is logged in and has the administrator persona in the database.
 */
export async function requireAdministrator(): Promise<AdminResult> {
  const session = await auth0.getSession();
  if (!session) return { ok: false, status: 401 };

  await connectDB();
  const admin = await User.findOne({ auth0Id: session.user.sub });
  if (!admin?.personas.includes('administrator')) {
    return { ok: false, status: 403 };
  }

  return { ok: true, session, admin };
}

export async function countAdministrators(): Promise<number> {
  return User.countDocuments({ personas: 'administrator' });
}
