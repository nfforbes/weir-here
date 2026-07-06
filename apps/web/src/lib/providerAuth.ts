import type { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Provider from '@/models/Provider';
import type { UserDocument } from '@/models/User';
import type { ProviderDocument } from '@/models/Provider';
import { getApiAuthUser } from '@/lib/apiAuth';
import { escapeRegex } from '@/lib/escapeRegex';

type ProviderAuthResult =
  | { ok: true; user: UserDocument; provider: ProviderDocument }
  | { ok: false; status: 401 | 403 | 404; error: string };

async function findUserByEmail(email: string) {
  const trimmed = email.trim();
  const normalized = trimmed.toLowerCase();
  let user = await User.findOne({ email: normalized });
  if (!user) {
    user = await User.findOne({ email: trimmed });
  }
  if (!user && trimmed) {
    user = await User.findOne({
      email: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
    });
  }
  return user;
}

/**
 * Resolves the logged-in user (by auth0Id, like bootstrap) and their Provider record
 * (by canonical user.email, lowercase). Accepts cookie sessions and Bearer JWT.
 */
export async function resolveProviderForRequest(
  request?: NextRequest,
): Promise<ProviderAuthResult> {
  await connectDB();

  const session = await auth0.getSession();
  if (session?.user?.sub) {
    let user = await User.findOne({ auth0Id: session.user.sub });
    if (!user && session.user.email) {
      user = await findUserByEmail(session.user.email);
    }
    if (!user) {
      return { ok: false, status: 401, error: 'Unauthorized' };
    }
    if (!user.personas.includes('provider') && !user.personas.includes('administrator')) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }
    const provider = await Provider.findOne({ email: user.email.trim().toLowerCase() });
    if (!provider) {
      return { ok: false, status: 404, error: 'Provider record not found' };
    }
    return { ok: true, user, provider };
  }

  if (request) {
    const apiUser = await getApiAuthUser(request);
    if (!apiUser?.sub) {
      return { ok: false, status: 401, error: 'Unauthorized' };
    }
    let user = await User.findOne({ auth0Id: apiUser.sub });
    if (!user && apiUser.email) {
      user = await findUserByEmail(apiUser.email);
    }
    if (!user) {
      return { ok: false, status: 401, error: 'Unauthorized' };
    }
    if (!user.personas.includes('provider') && !user.personas.includes('administrator')) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }
    const provider = await Provider.findOne({ email: user.email.trim().toLowerCase() });
    if (!provider) {
      return { ok: false, status: 404, error: 'Provider record not found' };
    }
    return { ok: true, user, provider };
  }

  return { ok: false, status: 401, error: 'Unauthorized' };
}
