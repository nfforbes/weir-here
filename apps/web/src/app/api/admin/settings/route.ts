import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import SystemSetting from '@/models/SystemSetting';

const MASKED_KEYS = ['MS365_CLIENT_SECRET', 'SMTP_PASS'];
const MASK_VALUE = '********';

async function requireAdmin(sub: string) {
  const user = await User.findOne({ auth0Id: sub });
  if (!user || !user.personas.includes('administrator')) return null;
  return user;
}

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const admin = await requireAdmin(session.user.sub);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const docs = await SystemSetting.find().lean();
    const settings: Record<string, string> = {};
    for (const doc of docs) {
      settings[doc.key] = MASKED_KEYS.includes(doc.key) ? MASK_VALUE : doc.value;
    }
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const admin = await requireAdmin(session.user.sub);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { settings } = (await request.json()) as { settings: Record<string, string> };
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object is required' }, { status: 400 });
    }

    const ops = Object.entries(settings)
      .filter(([key, value]) => !(MASKED_KEYS.includes(key) && value === MASK_VALUE))
      .map(([key, value]) =>
        SystemSetting.findOneAndUpdate(
          { key },
          { key, value, updatedBy: session.user.sub },
          { upsert: true, new: true }
        )
      );

    await Promise.all(ops);
    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
