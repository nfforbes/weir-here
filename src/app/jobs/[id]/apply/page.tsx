import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ApplyClient from '@/components/jobs/ApplyClient';

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAppUser();
  const { id } = await params;
  if (!user) redirect(`/auth/login?returnTo=/jobs/${id}/apply`);
  if (!user.emailVerified) redirect('/dashboard');
  return <ApplyClient jobId={id} />;
}
