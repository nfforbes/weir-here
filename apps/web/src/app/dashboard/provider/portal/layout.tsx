import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import ProviderPortalLayout from '@/components/provider/ProviderPortalLayout';

export default async function ProviderPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login?returnTo=/dashboard/provider/portal');

  await connectDB();
  const user = await User.findOne({ auth0Id: session.user.sub });
  if (!user?.personas.includes('provider') && !user?.personas.includes('administrator')) {
    redirect('/dashboard');
  }

  return <ProviderPortalLayout>{children}</ProviderPortalLayout>;
}
