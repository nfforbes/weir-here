import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getAppUser } from '@/lib/auth';

function isAdmin(personas: string[]) {
  return personas.includes('administrator');
}

export async function PATCH(req: NextRequest) {
  const user = await getAppUser();
  if (!user || !isAdmin(user.personas)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, action } = body as { userId?: string; action?: 'promote' | 'demote' };
  if (!userId || !action || !['promote', 'demote'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request: userId and action (promote|demote) required' }, { status: 400 });
  }

  if (userId === user._id && action === 'demote') {
    return NextResponse.json({ error: 'You cannot remove your own admin status' }, { status: 400 });
  }

  await connectDB();
  const target = await User.findById(userId);
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const personas = target.personas || [];
  if (action === 'promote') {
    if (personas.includes('administrator')) {
      return NextResponse.json({ error: 'User is already an administrator' }, { status: 400 });
    }
    await User.findByIdAndUpdate(userId, { $addToSet: { personas: 'administrator' } });
  } else {
    await User.findByIdAndUpdate(userId, { $pull: { personas: 'administrator' } });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getAppUser();
  if (!user || !isAdmin(user.personas)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const users = await User.find({})
    .select('email name emailVerified personas createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const list = users.map((u) => ({
    _id: u._id.toString(),
    email: u.email,
    name: u.name,
    emailVerified: u.emailVerified,
    personas: u.personas,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({ users: list });
}
