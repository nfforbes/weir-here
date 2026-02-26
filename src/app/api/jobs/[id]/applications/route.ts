import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { Job } from '@/models/Job';
import { Review } from '@/models/Review';
import { User } from '@/models/User';
import { getAppUser } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id: jobId } = await params;

  const job = await Job.findById(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const isOwner = job.createdBy.toString() === user._id;
  const isReviewer = job.reviewerEmails.includes(user.email);
  if (!isOwner && !isReviewer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const applications = await Application.find({ jobId }).sort({ createdAt: -1 }).lean();
  const userIds = applications.map((a) => a.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), { name: u.name, email: u.email }]));

  const appIds = applications.map((a) => a._id);
  const reviews = await Review.find({ applicationId: { $in: appIds } }).lean();
  const reviewMap: Record<string, { rating: number; eliminated: boolean; reviewerId: string }[]> = {};
  for (const r of reviews) {
    const key = r.applicationId.toString();
    if (!reviewMap[key]) reviewMap[key] = [];
    reviewMap[key].push({
      rating: r.rating,
      eliminated: r.eliminated,
      reviewerId: r.reviewerId.toString(),
    });
  }

  const result = applications.map((a) => ({
    _id: a._id.toString(),
    jobId: a.jobId.toString(),
    userId: a.userId.toString(),
    applicantName: userMap[a.userId.toString()]?.name || 'Unknown',
    applicantEmail: userMap[a.userId.toString()]?.email || '',
    resumeUrl: a.resumeUrl,
    screeningAnswers: a.screeningAnswers,
    status: a.status,
    reviews: reviewMap[a._id.toString()] || [],
    createdAt: a.createdAt.toISOString(),
  }));

  return NextResponse.json({ applications: result, jobTitle: job.title });
}
