import { NextResponse, type NextRequest } from 'next/server';
import { getApiAuthUser } from '@/lib/apiAuth';
import {
  getAuth0User,
  hasDatabasePasswordIdentity,
  updateAuth0Password,
  verifyAuth0DatabasePassword,
} from '@/lib/auth0Management';

function readPassword(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getApiAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = (await req.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    const currentPassword = readPassword(body.currentPassword);
    const newPassword = readPassword(body.newPassword);

    if (currentPassword.length < 1) {
      return NextResponse.json({ error: 'Enter your current password.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'The new password must be at least 8 characters.' },
        { status: 400 },
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'The new password must be different from the current password.' },
        { status: 400 },
      );
    }

    const auth0User = await getAuth0User(authUser.sub);
    if (!hasDatabasePasswordIdentity(auth0User?.identities, authUser.sub)) {
      return NextResponse.json(
        {
          error:
            'This account signed in with a partner such as Google or Apple. Change the password with that provider.',
        },
        { status: 400 },
      );
    }

    const email = (auth0User?.email || authUser.email || '').trim();
    if (!email) {
      return NextResponse.json({ error: 'Your account email is not available.' }, { status: 400 });
    }

    const currentMatches = await verifyAuth0DatabasePassword(email, currentPassword);
    if (!currentMatches) {
      return NextResponse.json({ error: 'The current password is incorrect.' }, { status: 400 });
    }

    await updateAuth0Password(authUser.sub, newPassword);
    return NextResponse.json({ ok: true, message: 'Password updated' });
  } catch (err: unknown) {
    console.error('[change password]', err);
    const message = err instanceof Error ? err.message : 'Could not change password';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
