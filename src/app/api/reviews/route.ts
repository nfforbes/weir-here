import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { Application } from '@/models/Application';
import { Job } from '@/models/Job';
import { getAppUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { applicationId, rating, eliminated, notes } = await req.json();

  if (rating === undefined || rating < 0 || rating > 10) {
    return NextResponse.json({ error: 'Rating must be between 0 and 10' }, { status: 400 });
  }

  const application = await Application.findById(applicationId);
  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  const job = await Job.findById(application.jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const isOwner = job.createdBy.toString() === user._id;
  const isReviewer = job.reviewerEmails.includes(user.email);
  if (!isOwner && !isReviewer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const review = await Review.findOneAndUpdate(
    { applicationId, reviewerId: user._id },
    { applicationId, reviewerId: user._id, rating, eliminated: eliminated ?? false, notes },
    { upsert: true, returnDocument: 'after' }
  );

  if (eliminated) {
    application.status = 'eliminated';
    await application.save();
  }

  return NextResponse.json({
    review: { ...review.toObject(), _id: review._id.toString() },
  });
}
