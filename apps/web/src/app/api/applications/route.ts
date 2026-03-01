import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const jobId = request.nextUrl.searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'jobId query param is required' }, { status: 400 });

    await connectDB();
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const isPoster = job.postedBy === session.user.sub;
    const isReviewer = job.reviewerEmails.includes(session.user.email);
    if (!isPoster && !isReviewer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const applications = await Application.find({ jobId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ applications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (!session.user.email_verified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const { jobId, answers, resumePath } = body;

    if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });

    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const existing = await Application.findOne({ jobId, applicantId: session.user.sub });
    if (existing) return NextResponse.json({ error: 'You have already applied to this job' }, { status: 409 });

    const application = await Application.create({
      jobId,
      applicantId: session.user.sub,
      applicantName: session.user.name,
      applicantEmail: session.user.email,
      answers: answers || [],
      resumePath: resumePath || '',
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
