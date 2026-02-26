import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import { getAppUser } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const job = await Job.findById(id).lean();
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const company = await Company.findById(job.companyId)
    .select('name website industry contactPerson locations')
    .lean();

  return NextResponse.json({
    job: {
      ...job,
      _id: job._id.toString(),
      companyId: job.companyId.toString(),
      createdBy: job.createdBy.toString(),
      company: company
        ? {
            name: company.name,
            website: company.website,
            industry: company.industry,
            locations: company.locations,
            contactPerson: company.contactPerson?.hiddenFromPublic
              ? undefined
              : company.contactPerson,
          }
        : null,
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const job = await Job.findById(id);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (job.createdBy.toString() !== user._id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  Object.assign(job, body);
  await job.save();

  return NextResponse.json({ job });
}
