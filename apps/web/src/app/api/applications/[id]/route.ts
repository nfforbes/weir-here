import { NextRequest, NextResponse } from 'next/server';
import type { Types } from 'mongoose';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { canAccessJobApplications } from '@/lib/jobApplicationAccess';
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

    const jobId = (application as unknown as { jobId: Types.ObjectId }).jobId;
    const job = await Job.findById(jobId)
      .select('postedBy reviewerEmails')
      .lean<{ postedBy: string; reviewerEmails?: string[] | null } | null>();
    if (!job) return NextResponse.json({ error: 'Associated job not found' }, { status: 404 });
    const allowed = await canAccessJobApplications(session.user, job);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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

    const job = await Job.findById(application.jobId)
      .select('postedBy reviewerEmails')
      .lean<{ postedBy: string; reviewerEmails?: string[] | null } | null>();
    if (!job) return NextResponse.json({ error: 'Associated job not found' }, { status: 404 });

    const allowed = await canAccessJobApplications(session.user, job);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
