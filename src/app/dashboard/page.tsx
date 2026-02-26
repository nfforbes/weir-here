import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardHome from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  const user = await getAppUser();
  if (!user) redirect('/auth/login?returnTo=/dashboard');
  return <DashboardHome user={user} />;
}
