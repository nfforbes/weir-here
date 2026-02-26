import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ApplicationsReviewClient from '@/components/dashboard/ApplicationsReviewClient';

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ companyId: string; jobId: string }>;
}) {
  const user = await getAppUser();
  if (!user) redirect('/auth/login');
  const { jobId } = await params;
  return <ApplicationsReviewClient jobId={jobId} currentUserId={user._id} />;
}
