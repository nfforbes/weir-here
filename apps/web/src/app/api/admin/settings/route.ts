import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemSetting from '@/models/SystemSetting';
import { requireAdministrator } from '@/lib/adminAuth';

const MASKED_KEYS = ['MS365_CLIENT_SECRET'];
const MASK_VALUE = '********';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAdministrator(req);
    if (!gate.ok) {
      return NextResponse.json(
        { error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' },
        { status: gate.status },
      );
    }

    await connectDB();

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
    const gate = await requireAdministrator(request);
    if (!gate.ok) {
      return NextResponse.json(
        { error: gate.status === 401 ? 'Not authenticated' : 'Forbidden' },
        { status: gate.status },
      );
    }

    await connectDB();

    const { settings } = (await request.json()) as { settings: Record<string, string> };
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object is required' }, { status: 400 });
    }

    const updatedBy = gate.admin.auth0Id;

    const ops = Object.entries(settings)
      .filter(([key, value]) => !(MASKED_KEYS.includes(key) && value === MASK_VALUE))
      .map(([key, value]) =>
        SystemSetting.findOneAndUpdate(
          { key },
          { key, value, updatedBy },
          { upsert: true, new: true },
        ),
      );

    await Promise.all(ops);
    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
