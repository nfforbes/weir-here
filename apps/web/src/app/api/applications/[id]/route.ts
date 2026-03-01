import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const application = await Application.findById(id).lean();
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    return NextResponse.json({ application });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const job = await Job.findById(application.jobId);
    if (!job) return NextResponse.json({ error: 'Associated job not found' }, { status: 404 });

    const isPoster = job.postedBy === session.user.sub;
    const isReviewer = job.reviewerEmails.includes(session.user.email);
    if (!isPoster && !isReviewer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { status } = await request.json();
    if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 });

    application.status = status;
    await application.save();
    return NextResponse.json({ application });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
