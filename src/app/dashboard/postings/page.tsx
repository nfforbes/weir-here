import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import PostingsClient from '@/components/dashboard/PostingsClient';

export default async function PostingsPage() {
  const user = await getAppUser();
  if (!user) redirect('/auth/login');

  await connectDB();

  const [createdJobs, reviewerJobs] = await Promise.all([
    Job.find({ createdBy: user._id }).sort({ createdAt: -1 }).lean(),
    Job.find({ reviewerEmails: user.email }).sort({ createdAt: -1 }).lean(),
  ]);

  const createdIds = new Set(createdJobs.map((j) => j._id.toString()));
  const reviewerOnly = reviewerJobs.filter((j) => !createdIds.has(j._id.toString()));

  const allJobs = [...createdJobs, ...reviewerOnly];
  const companyIds = [...new Set(allJobs.map((j) => j.companyId.toString()))];
  const companies = await Company.find({ _id: { $in: companyIds } })
    .select('name')
    .lean();
  const companyMap = Object.fromEntries(companies.map((c) => [c._id.toString(), c.name]));

  const serialized = allJobs.map((j) => ({
    _id: j._id.toString(),
    companyId: j.companyId.toString(),
    title: j.title,
    location: j.location,
    status: j.status,
    employmentType: j.employmentType,
    createdAt: j.createdAt.toISOString(),
    companyName: companyMap[j.companyId.toString()] || 'Unknown',
    isCreator: createdIds.has(j._id.toString()),
  }));

  return <PostingsClient jobs={serialized} />;
}
