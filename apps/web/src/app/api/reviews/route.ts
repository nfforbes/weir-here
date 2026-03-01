import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const applicationId = request.nextUrl.searchParams.get('applicationId');
    if (!applicationId) return NextResponse.json({ error: 'applicationId query param is required' }, { status: 400 });

    await connectDB();
    const reviews = await Review.find({ applicationId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();
    const { applicationId, rating, eliminated, notes } = await request.json();
    if (!applicationId) return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });

    const review = await Review.findOneAndUpdate(
      { applicationId, reviewerId: session.user.sub },
      { applicationId, reviewerId: session.user.sub, rating: rating ?? 0, eliminated: eliminated ?? false, notes: notes ?? '' },
      { upsert: true, new: true }
    );

    return NextResponse.json({ review });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
