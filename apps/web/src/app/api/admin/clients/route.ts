import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Client, { buildClientAddressPayload, normalizeClientPayload, type AddressDetails } from '@/models/Client';
import { formatAddress } from '@weir-here/shared';
import { requireAdministrator } from '@/lib/adminAuth';

function hasAddress(input: {
  address?: string;
  addressDetails?: Parameters<typeof buildClientAddressPayload>[0]['addressDetails'];
}) {
  const formatted = formatAddress(input.addressDetails, input.address);
  return formatted.trim().length > 0;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  await connectDB();
  const clients = await Client.find({}).sort({ name: 1 }).lean();

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { name, email, address, addressDetails, phoneNumbers } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!hasAddress({ address, addressDetails })) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  await connectDB();
  const addressPayload = buildClientAddressPayload({ address, addressDetails });
  const { rate, services, patientName } = normalizeClientPayload(body);
  const client = await Client.create({
    name: name.trim(),
    email: email?.trim().toLowerCase() ?? '',
    phoneNumbers: phoneNumbers || [],
    rate,
    services,
    patientName,
    ...addressPayload,
  });
  return NextResponse.json(client, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { id, name, email, address, addressDetails, phoneNumbers } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.trim().toLowerCase();
  if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
  if ('rate' in body || 'services' in body || 'patientName' in body) {
    const normalized = normalizeClientPayload(body);
    if ('rate' in body) updateData.rate = normalized.rate;
    if ('services' in body) updateData.services = normalized.services;
    if ('patientName' in body) updateData.patientName = normalized.patientName;
  }
  if (address !== undefined || addressDetails !== undefined) {
    const existingClient = await Client.findById(id).lean<{
      address?: string;
      addressDetails?: AddressDetails;
    }>();
    const addressPayload = buildClientAddressPayload({
      address: address ?? existingClient?.address,
      addressDetails: addressDetails ?? existingClient?.addressDetails,
    });
    if (!hasAddress(addressPayload)) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    Object.assign(updateData, addressPayload);
  }

  const client = await Client.findByIdAndUpdate(id, updateData, { new: true });
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(client);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  await Client.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
