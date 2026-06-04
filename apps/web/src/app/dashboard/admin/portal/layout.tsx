import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import AdminPortalLayout from '@/components/admin/AdminPortalLayout';

export default async function AdminPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login?returnTo=/dashboard/admin/portal');

  await connectDB();
  const user = await User.findOne({ auth0Id: session.user.sub });
  if (!user?.personas.includes('administrator')) {
    redirect('/dashboard');
  }

  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}
