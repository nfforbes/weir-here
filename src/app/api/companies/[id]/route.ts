import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { getAppUser } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const company = await Company.findOne({ _id: id, ownerId: user._id }).lean();
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    company: { ...company, _id: company._id.toString(), ownerId: company.ownerId.toString() },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const company = await Company.findOne({ _id: id, ownerId: user._id });
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  Object.assign(company, body);
  await company.save();

  return NextResponse.json({
    company: { ...company.toObject(), _id: company._id.toString(), ownerId: company.ownerId.toString() },
  });
}
