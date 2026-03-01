import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const job = await Job.findById(id).lean();
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const dbUser = await User.findOne({ auth0Id: session.user.sub });
    const isAdmin = dbUser?.personas.includes('administrator');
    if (job.postedBy !== session.user.sub && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Job.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json({ job: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const dbUser = await User.findOne({ auth0Id: session.user.sub });
    const isAdmin = dbUser?.personas.includes('administrator');
    if (job.postedBy !== session.user.sub && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Job.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
