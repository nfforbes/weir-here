'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import { ELECTRIC_BLUE, DEEP_NAVY } from '@/theme/theme';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Back to Site', icon: <HomeIcon />, href: '/', external: false },
  { label: 'Assignments', icon: <WorkIcon />, href: '/dashboard/provider/portal/assignments', external: false },
  { label: 'Logout', icon: <LogoutIcon />, href: '/auth/logout', external: true },
];

interface ProviderPortalLayoutProps {
  children: React.ReactNode;
}

export default function ProviderPortalLayout({ children }: ProviderPortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
      }}
    >
      {/* Logo/Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <MedicalServicesIcon sx={{ color: ELECTRIC_BLUE, fontSize: 30 }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }}>
            Provider Portal
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Weir Here Providers
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              onClick={() => {
                if (item.external) {
                  window.location.href = item.href;
                } else {
                  router.push(item.href);
                }
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 2,
                py: 1,
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                backgroundColor: isActive ? `${ELECTRIC_BLUE}30` : 'transparent',
                borderLeft: isActive ? `3px solid ${ELECTRIC_BLUE}` : '3px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: `${ELECTRIC_BLUE}20`,
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? ELECTRIC_BLUE : 'rgba(255,255,255,0.45)', minWidth: 38 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
              />
              {isActive && <ChevronRightIcon sx={{ fontSize: 16, color: ELECTRIC_BLUE }} />}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Weir Here
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, background: DEEP_NAVY }}>
          <Toolbar>
            <Tooltip title="Open menu">
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" fontWeight={700}>
              Provider Portal
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop permanent drawer — right-hand side */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              background: `linear-gradient(180deg, ${DEEP_NAVY} 0%, #0d2137 100%)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile temporary drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { 
              width: DRAWER_WIDTH,
              background: `linear-gradient(180deg, ${DEEP_NAVY} 0%, #0d2137 100%)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: isMobile ? 8 : 0,
          minHeight: '100vh',
          background: '#f5f7fa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
