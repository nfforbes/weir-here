import { NextRequest, NextResponse } from 'next/server';
import { getApiAuthUser } from '@/lib/apiAuth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Job from '@/models/Job';
import User from '@/models/User';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id: identifier } = await context.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    
    const job = await Job.findOne(query).lean();
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const authUser = await getApiAuthUser(request);
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { id: identifier } = await context.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    const job = await Job.findOne(query);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const dbUser = await User.findOne({ auth0Id: authUser.sub });
    const isAdmin = dbUser?.personas.includes('administrator');
    if (job.postedBy !== authUser.sub && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const raw = (await request.json()) as Record<string, unknown>;
    const allowed = [
      'title',
      'location',
      'employmentType',
      'description',
      'responsibilities',
      'requirements',
      'howToApply',
      'salaryRange',
      'categories',
      'tags',
      'expiresAt',
      'screeningQuestions',
      'skills',
      'benefits',
      'reviewerEmails',
      'attachmentPaths',
    ] as const;
    const body: Record<string, unknown> = {};
    for (const key of allowed) {
      if (!(key in raw)) continue;
      if (key === 'expiresAt') {
        body.expiresAt = raw.expiresAt === '' || raw.expiresAt === null ? null : raw.expiresAt;
        continue;
      }
      if (raw[key] !== undefined) body[key] = raw[key];
    }

    Object.assign(job, body);
    const updated = await job.save();
    return NextResponse.json({ job: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authUser = await getApiAuthUser(request);
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { id: identifier } = await context.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    const job = await Job.findOne(query);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const dbUser = await User.findOne({ auth0Id: authUser.sub });
    const isAdmin = dbUser?.personas.includes('administrator');
    if (job.postedBy !== authUser.sub && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await job.deleteOne();
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
