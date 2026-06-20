import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import Qualification from '@/models/Qualification';
import { requireAdministrator } from '@/lib/adminAuth';

export async function GET() {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  await connectDB();
  const clients = await Client.find({}).sort({ name: 1 }).lean();

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { name, address, phoneNumbers } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!address?.trim()) return NextResponse.json({ error: 'Address is required' }, { status: 400 });

  await connectDB();
  const client = await Client.create({ 
    name: name.trim(), 
    address: address.trim(),
    phoneNumbers: phoneNumbers || []
  });
  return NextResponse.json(client, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { id, name, address, phoneNumbers } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (address !== undefined) updateData.address = address.trim();
  if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;

  const client = await Client.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(client);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdministrator();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  await Client.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
