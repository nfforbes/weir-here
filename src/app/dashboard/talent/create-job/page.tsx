import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import CreateJobClient from '@/components/dashboard/CreateJobClient';

export default async function CreateJobPage() {
  const user = await getAppUser();
  if (!user) redirect('/auth/login?returnTo=/dashboard/talent/create-job');
  if (!user.emailVerified) redirect('/dashboard');

  await connectDB();
  const companies = await Company.find({ ownerId: user._id }).select('name').lean();

  if (companies.length === 0) redirect('/dashboard/talent/register-company');

  const serialized = companies.map((c) => ({ _id: c._id.toString(), name: c.name }));
  return <CreateJobClient companies={serialized} />;
}
