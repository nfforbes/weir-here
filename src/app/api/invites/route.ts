import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { Invite } from '@/models/Invite';
import { User } from '@/models/User';
import { getAppUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { emails, jobId }: { emails: string[]; jobId?: string } = await req.json();

  const results: { email: string; status: string }[] = [];

  for (const email of emails) {
    const existing = await User.findOne({ email });
    if (existing) {
      results.push({ email, status: 'already_registered' });
      continue;
    }

    const existingInvite = await Invite.findOne({ email, accepted: false });
    if (existingInvite) {
      results.push({ email, status: 'invite_pending' });
      continue;
    }

    await Invite.create({
      email,
      jobId: jobId || undefined,
      invitedBy: user._id,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    results.push({ email, status: 'invited' });
  }

  return NextResponse.json({ results });
}
