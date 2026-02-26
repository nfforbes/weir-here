import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { getAppUser } from '@/lib/auth';

export async function GET() {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const companies = await Company.find({ ownerId: user._id }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    companies: companies.map((c) => ({
      ...c,
      _id: c._id.toString(),
      ownerId: c.ownerId.toString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.emailVerified) {
    return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const company = await Company.create({
    name: body.name,
    website: body.website,
    industry: body.industry,
    size: body.size,
    logoUrl: body.logoUrl,
    brandInfo: body.brandInfo,
    locations: body.locations || [],
    remotePolicy: body.remotePolicy,
    contactPerson: body.contactPerson,
    ownerId: user._id,
  });

  return NextResponse.json(
    {
      company: {
        ...company.toObject(),
        _id: company._id.toString(),
        ownerId: company.ownerId.toString(),
      },
    },
    { status: 201 }
  );
}
