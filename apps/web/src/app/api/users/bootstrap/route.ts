import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import type { Persona } from '@weir-here/shared';

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
}) {
  return {
    auth0Id: u.auth0Id,
    email: u.email,
    name: u.name,
    personas: [...u.personas],
    emailVerified: u.emailVerified,
  };
}

export async function POST() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const { sub, email, name, email_verified } = session.user;

    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      const personas: Persona[] = ['user'];
      if (shouldGrantEnvAdmin(email)) {
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
      }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
