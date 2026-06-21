import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import '@/models/Client';
import '@/models/Provider';
import { requireAdministrator } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const providerId = searchParams.get('providerId');

  const filter: Record<string, unknown> = {};
  if (clientId) filter.clientId = clientId;
  if (providerId) filter.providerId = providerId;

  await connectDB();
  const assignments = await Assignment.find(filter)
    .populate('clientId', 'name address')
    .populate('providerId', 'name')
    .sort({ serviceDate: -1 })
    .lean();

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const { clientId, providerId, clientChargeCents, providerHourlyRateCents, providerPayCents, description, serviceDate } = body;

  if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  if (!providerId) return NextResponse.json({ error: 'providerId is required' }, { status: 400 });
  if (clientChargeCents == null || clientChargeCents < 0)
    return NextResponse.json({ error: 'clientChargeCents must be >= 0' }, { status: 400 });
  if (providerHourlyRateCents == null || providerHourlyRateCents < 0)
    return NextResponse.json({ error: 'providerHourlyRateCents must be >= 0' }, { status: 400 });
  if (providerPayCents != null && providerPayCents < 0)
    return NextResponse.json({ error: 'providerPayCents must be >= 0' }, { status: 400 });

  await connectDB();
  const assignment = await Assignment.create({
    clientId,
    providerId,
    clientChargeCents,
    providerHourlyRateCents,
    providerPayCents: providerPayCents || 0,
    description: description ?? '',
    serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
  });

  const populated = await Assignment.findById(assignment._id)
    .populate('clientId', 'name address')
    .populate('providerId', 'name')
    .lean();

  return NextResponse.json(populated, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const body = await req.json();
  const {
    id,
    clientId,
    providerId,
    clientChargeCents,
    providerHourlyRateCents,
    providerPayCents,
    description,
    serviceDate,
    status,
  } = body;

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  if (!providerId) return NextResponse.json({ error: 'providerId is required' }, { status: 400 });
  if (clientChargeCents == null || clientChargeCents < 0)
    return NextResponse.json({ error: 'clientChargeCents must be >= 0' }, { status: 400 });
  if (providerHourlyRateCents == null || providerHourlyRateCents < 0)
    return NextResponse.json({ error: 'providerHourlyRateCents must be >= 0' }, { status: 400 });
  if (providerPayCents != null && providerPayCents < 0)
    return NextResponse.json({ error: 'providerPayCents must be >= 0' }, { status: 400 });

  const allowedStatuses = ['assigned', 'arrived', 'completed'];
  if (status != null && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectDB();
  const update: Record<string, unknown> = {
    clientId,
    providerId,
    clientChargeCents,
    providerHourlyRateCents,
    providerPayCents: providerPayCents ?? 0,
    description: description ?? '',
    serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
  };
  if (status != null) update.status = status;

  const assignment = await Assignment.findByIdAndUpdate(id, update, { new: true });
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const populated = await Assignment.findById(assignment._id)
    .populate('clientId', 'name address')
    .populate('providerId', 'name')
    .lean();

  return NextResponse.json(populated);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdministrator(req);
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await connectDB();
  await Assignment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

