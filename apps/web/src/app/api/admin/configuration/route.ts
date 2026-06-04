import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Config from '@/models/Config';
import { requireAdministrator } from '@/lib/adminAuth';

const ALLOWED_KEYS = [
  'gdrive_client_id',
  'gdrive_client_secret',
  'gdrive_refresh_token',
  'gdrive_folder_id',
];

export async function GET() {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  await connectDB();
  const configs = await Config.find({ key: { $in: ALLOWED_KEYS } }).lean();

  // Never return secrets directly – return masked values
  const result: Record<string, string> = {};
  for (const c of configs) {
    if (c.key === 'gdrive_client_secret' || c.key === 'gdrive_refresh_token') {
      result[c.key] = c.value ? '••••••••' : '';
    } else {
      result[c.key] = c.value;
    }
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  await connectDB();

  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined && body[key] !== '••••••••') {
      await Config.findOneAndUpdate(
        { key },
        { value: body[key] },
        { upsert: true, new: true }
      );
    }
  }

  return NextResponse.json({ success: true });
}
