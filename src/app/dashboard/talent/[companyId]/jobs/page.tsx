import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import CompanyJobsClient from '@/components/dashboard/CompanyJobsClient';

export default async function CompanyJobsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const user = await getAppUser();
  if (!user) redirect('/auth/login');

  const { companyId } = await params;
  await connectDB();

  const company = await Company.findOne({ _id: companyId, ownerId: user._id }).lean();
  if (!company) redirect('/dashboard/talent');

  const jobs = await Job.find({ companyId }).sort({ createdAt: -1 }).lean();

  const serializedJobs = jobs.map((j) => ({
    _id: j._id.toString(),
    title: j.title,
    location: j.location,
    status: j.status,
    employmentType: j.employmentType,
    createdAt: j.createdAt.toISOString(),
  }));

  return (
    <CompanyJobsClient
      companyName={company.name}
      companyId={companyId}
      jobs={serializedJobs}
    />
  );
}
