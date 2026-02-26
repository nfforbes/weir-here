import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { Job } from '@/models/Job';
import { getAppUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.emailVerified) {
    return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const job = await Job.findById(body.jobId);
  if (!job || job.status !== 'published') {
    return NextResponse.json({ error: 'Job not found or not accepting applications' }, { status: 404 });
  }

  const existing = await Application.findOne({ jobId: body.jobId, userId: user._id });
  if (existing) {
    return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
  }

  const application = await Application.create({
    jobId: body.jobId,
    userId: user._id,
    resumeUrl: body.resumeUrl,
    screeningAnswers: body.screeningAnswers || [],
    status: 'submitted',
  });

  return NextResponse.json(
    { application: { ...application.toObject(), _id: application._id.toString() } },
    { status: 201 }
  );
}
