import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import { getAppUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  const user = await getAppUser();
  if (!user || !user.personas.includes('administrator')) {
    redirect('/');
  }
  return <AdminSettingsClient />;
}
