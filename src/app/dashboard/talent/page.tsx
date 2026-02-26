import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import TalentDashboard from '@/components/dashboard/TalentDashboard';

export default async function TalentPage() {
  const user = await getAppUser();
  if (!user) redirect('/auth/login?returnTo=/dashboard/talent');
  if (!user.emailVerified) redirect('/dashboard');

  await connectDB();
  const companies = await Company.find({ ownerId: user._id }).lean();

  if (companies.length === 0) {
    redirect('/dashboard/talent/register-company');
  }

  const serialized = companies.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
    industry: c.industry,
  }));

  return <TalentDashboard companies={serialized} />;
}
