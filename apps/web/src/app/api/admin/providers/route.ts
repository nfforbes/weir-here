import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import { requireAdministrator } from '@/lib/adminAuth';

export async function GET() {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  await connectDB();
  const providers = await Provider.find({}).sort({ name: 1 }).lean();
  return NextResponse.json(providers);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { name, info } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  await connectDB();
  const provider = await Provider.create({ name: name.trim(), info: info ?? '' });
  return NextResponse.json(provider, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { id, name, info } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  const provider = await Provider.findByIdAndUpdate(
    id,
    { name: name?.trim(), info },
    { new: true }
  );
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(provider);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  await Provider.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
