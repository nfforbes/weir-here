import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import { getAppUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const tag = searchParams.get('tag') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = 12;

  const filter: Record<string, unknown> = { status: 'published' };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (category) filter.categories = category;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (tag) filter.tags = tag;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  const companyIds = [...new Set(jobs.map((j) => j.companyId.toString()))];
  const companies = await Company.find({ _id: { $in: companyIds } })
    .select('name')
    .lean();
  const companyMap = Object.fromEntries(companies.map((c) => [c._id.toString(), c.name]));

  const items = jobs.map((j) => ({
    _id: j._id.toString(),
    title: j.title,
    location: j.location,
    employmentType: j.employmentType,
    description: j.description.substring(0, 200),
    companyName: companyMap[j.companyId.toString()] || 'Unknown',
    categories: j.categories,
    tags: j.tags,
    salaryRange: j.salaryRange,
    createdAt: j.createdAt.toISOString(),
  }));

  return NextResponse.json({
    items,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAppUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const company = await Company.findOne({ _id: body.companyId, ownerId: user._id });
    if (!company) {
      return NextResponse.json({ error: 'Company not found or not owned by you' }, { status: 404 });
    }

    const job = await Job.create({
      ...body,
      createdBy: user._id,
      companyId: company._id,
      status: body.status || 'draft',
    });

    return NextResponse.json(
      { job: { ...job.toObject(), _id: job._id.toString(), companyId: job.companyId.toString(), createdBy: job.createdBy.toString() } },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
