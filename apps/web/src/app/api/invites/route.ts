import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import Invite from '@/models/Invite';

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const invites = await Invite.find({ email: session.user.email }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ invites });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 });

    const invite = await Invite.findOne({ token });
    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    if (invite.accepted) return NextResponse.json({ error: 'Invite already accepted' }, { status: 409 });

    invite.accepted = true;
    await invite.save();
    return NextResponse.json({ invite });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
