import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';
import Invite from '@/models/Invite';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const tags = searchParams.get('tags');
    const mine = searchParams.get('mine');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const filter: Record<string, unknown> = {};

    if (mine === 'true') {
      const session = await auth0.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      filter.postedBy = session.user.sub;
    } else {
      filter.expiresAt = { $gt: new Date() };
    }

    if (q) filter.$text = { $search: q };
    if (category) filter.categories = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    return NextResponse.json({ jobs, total, page, limit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!session.user.email_verified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    body.postedBy = session.user.sub;

    const reviewerEmails: string[] = body.reviewerEmails || [];
    const job = await Job.create(body);

    for (const email of reviewerEmails) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await Invite.findOneAndUpdate(
          { email, jobId: job._id },
          { email, jobId: job._id, invitedBy: session.user.sub, token: crypto.randomUUID(), accepted: false },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
