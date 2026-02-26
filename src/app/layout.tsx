import type { Metadata } from 'next';
import StoreProvider from '@/store/StoreProvider';
import ThemeRegistry from '@/theme/ThemeRegistry';
import AppShell from '@/components/layout/AppShell';
import { getAppUser } from '@/lib/auth';
import { getMenuForUser } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';

export const metadata: Metadata = {
  title: 'Weir Here - Staffing Solutions',
  description: 'Find talent or find your next career with Weir Here staffing agency.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getAppUser();
  let hasCompanies = false;
  if (user) {
    await connectDB();
    const count = await Company.countDocuments({ ownerId: user._id });
    hasCompanies = count > 0;
  }
  const menuItems = getMenuForUser(user, hasCompanies);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeRegistry>
            <AppShell user={user} menuItems={menuItems}>
              {children}
            </AppShell>
          </ThemeRegistry>
        </StoreProvider>
      </body>
    </html>
  );
}
