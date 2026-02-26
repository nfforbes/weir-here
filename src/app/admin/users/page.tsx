import AdminUsersClient from '@/components/admin/AdminUsersClient';
import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const user = await getAppUser();
  if (!user || !user.personas.includes('administrator')) {
    redirect('/');
  }
  return <AdminUsersClient currentUserId={user._id} />;
}
