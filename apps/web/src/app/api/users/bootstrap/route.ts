import { NextResponse, type NextRequest } from 'next/server';
import { getApiAuthUser } from '@/lib/apiAuth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import type { Persona } from '@weir-here/shared';
import PlatformInvite from '@/models/PlatformInvite';

function parseAdminBootstrapEmails(): string[] {
  const raw = process.env.ADMIN_BOOTSTRAP_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function shouldGrantEnvAdmin(sessionEmail: string | undefined): boolean {
  if (!sessionEmail) return false;
  const lower = sessionEmail.trim().toLowerCase();
  return parseAdminBootstrapEmails().includes(lower);
}

function serializeUser(u: {
  auth0Id: string;
  email: string;
  name: string;
  personas: Persona[];
  emailVerified: boolean;
  updatedAt?: Date;
}) {
  return {
    auth0Id: u.auth0Id,
    email: u.email,
    name: u.name,
    personas: [...u.personas],
    emailVerified: u.emailVerified,
    updatedAt: u.updatedAt ? u.updatedAt.toISOString() : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getApiAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const sub = authUser.sub;
    const email = authUser.email;
    const name = authUser.name?.trim() || email?.trim() || sub;
    const email_verified = authUser.emailVerified;

    if (!email) {
      return NextResponse.json(
        {
          error:
            'Your account email is not available on this token. Ensure openid/email scopes and a valid Bearer token (often the ID token for bootstrap).',
        },
        { status: 400 },
      );
    }

    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      let personas: Persona[] = ['user'];
      
      const invite = await PlatformInvite.findOne({ email: email.trim().toLowerCase(), accepted: false });
      if (invite && invite.roles && invite.roles.length > 0) {
        personas = invite.roles as Persona[];
        invite.accepted = true;
        await invite.save();
      }
      
      if (shouldGrantEnvAdmin(email) && !personas.includes('administrator')) {
        personas.push('administrator');
      }
      user = await User.create({
        auth0Id: sub,
        email,
        name,
        personas,
        emailVerified: email_verified,
      });
    } else {
      user.emailVerified = email_verified;
      if (shouldGrantEnvAdmin(email) && !user.personas.includes('administrator')) {
        user.personas = [...user.personas, 'administrator'];
      }
      await user.save();
    }

    return NextResponse.json({
      user: serializeUser({
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
        personas: user.personas as Persona[],
        emailVerified: user.emailVerified,
        updatedAt: user.updatedAt,
      }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
