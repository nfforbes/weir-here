import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RegisterCompanyClient from '@/components/dashboard/RegisterCompanyClient';

export default async function RegisterCompanyPage() {
  const user = await getAppUser();
  if (!user) redirect('/auth/login?returnTo=/dashboard/talent/register-company');
  return <RegisterCompanyClient />;
}
