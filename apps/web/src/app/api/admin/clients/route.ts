import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Client, { buildClientAddressPayload, type AddressDetails } from '@/models/Client';
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
  const { name, email, address, addressDetails, phoneNumbers, rateServices, patientName } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!hasAddress({ address, addressDetails })) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  await connectDB();
  const addressPayload = buildClientAddressPayload({ address, addressDetails });
  const client = await Client.create({
    name: name.trim(),
    email: email?.trim().toLowerCase() ?? '',
    phoneNumbers: phoneNumbers || [],
    rateServices: rateServices?.trim() ?? '',
    patientName: patientName?.trim() ?? '',
    ...addressPayload,
  });
  return NextResponse.json(client, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { id, name, email, address, addressDetails, phoneNumbers, rateServices, patientName } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.trim().toLowerCase();
  if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
  if (rateServices !== undefined) updateData.rateServices = rateServices.trim();
  if (patientName !== undefined) updateData.patientName = patientName.trim();
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
