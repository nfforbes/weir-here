'use client';

import { Box } from '@mui/material';
import TopBanner from '@/components/layout/TopBanner';
import Footer from '@/components/layout/Footer';
import WhatsAppFloatingChat from '@/components/layout/WhatsAppFloatingChat';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBanner />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
      <WhatsAppFloatingChat />
    </Box>
  );
}
