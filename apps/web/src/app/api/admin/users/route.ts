import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { requireAdministrator } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdministrator(request);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' }, { status: gate.status });
    }

    const docs = await User.find().sort({ name: 1 }).lean();
    const users = docs.map((u) => ({
      id: String(u._id),
      auth0Id: u.auth0Id,
      email: u.email,
      name: u.name,
      personas: u.personas,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return NextResponse.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

