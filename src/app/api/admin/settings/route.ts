import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Settings, MS365_KEYS } from '@/models/Settings';
import { getAppUser } from '@/lib/auth';

function isAdmin(personas: string[]) {
  return personas.includes('administrator');
}

export async function GET() {
  const user = await getAppUser();
  if (!user || !isAdmin(user.personas)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const settings = await Settings.find({ key: { $in: MS365_KEYS } }).lean();

  const result: Record<string, string> = {};
  for (const key of MS365_KEYS) {
    const found = settings.find((s) => s.key === key);
    result[key] = found ? found.value : '';
  }

  return NextResponse.json({ settings: result });
}

export async function PUT(req: NextRequest) {
  const user = await getAppUser();
  if (!user || !isAdmin(user.personas)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const updates: Promise<unknown>[] = [];
  for (const key of MS365_KEYS) {
    if (body[key] !== undefined) {
      updates.push(
        Settings.findOneAndUpdate(
          { key },
          { key, value: body[key] },
          { upsert: true, returnDocument: 'after' }
        )
      );
    }
  }

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
