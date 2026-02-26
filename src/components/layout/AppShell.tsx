'use client';

import { Box } from '@mui/material';
import Banner from './Banner';
import Footer from './Footer';
import SnackbarNotification from './SnackbarNotification';
import DashboardDrawer, { DRAWER_WIDTH } from './DashboardDrawer';
import type { AppUser } from '@/lib/auth';
import type { MenuItem } from '@/lib/permissions';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { useEffect } from 'react';

interface Props {
  user: AppUser | null;
  menuItems: MenuItem[];
  children: React.ReactNode;
}

export default function AppShell({ user, menuItems, children }: Props) {
  const dispatch = useAppDispatch();
  const sidebarItems = menuItems.filter((item) => item.sidebarItem);
  const bannerItems = menuItems.filter((item) => !item.sidebarItem);

  useEffect(() => {
    dispatch(setUser(user));
  }, [dispatch, user]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Banner user={user} menuItems={bannerItems} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        {user && sidebarItems.length > 0 && (
          <DashboardDrawer items={sidebarItems} />
        )}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            width: user && sidebarItems.length > 0 ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          }}
        >
          {children}
        </Box>
      </Box>
      <Footer />
      <SnackbarNotification />
    </Box>
  );
}
