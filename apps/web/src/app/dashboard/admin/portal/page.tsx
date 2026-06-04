'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { ELECTRIC_BLUE, DEEP_NAVY } from '@/theme/theme';

const TILES = [
  { label: 'Providers', icon: <PersonIcon sx={{ fontSize: 48 }} />, href: '/dashboard/admin/portal/providers', desc: 'Create and manage care providers' },
  { label: 'Clients', icon: <GroupIcon sx={{ fontSize: 48 }} />, href: '/dashboard/admin/portal/clients', desc: 'Manage clients and qualifications' },
  { label: 'Assignments', icon: <AssignmentIcon sx={{ fontSize: 48 }} />, href: '/dashboard/admin/portal/assignments', desc: 'Assign providers to clients with charges' },
  { label: 'Reports', icon: <BarChartIcon sx={{ fontSize: 48 }} />, href: '/dashboard/admin/portal/reports', desc: 'Monthly billing reports & Excel export' },
  { label: 'Configuration', icon: <SettingsIcon sx={{ fontSize: 48 }} />, href: '/dashboard/admin/portal/configuration', desc: 'Google Drive and system settings' },
];

export default function AdminPortalPage() {
  const router = useRouter();

  return (
    <Box>
      {/* Hero header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${DEEP_NAVY} 0%, #1a3a5c 100%)`,
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin Portal
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Welcome back. Manage providers, clients, billing, and system configuration from here.
        </Typography>
      </Box>

      {/* Tiles */}
      <Grid container spacing={3}>
        {TILES.map((tile) => (
          <Grid item xs={12} sm={6} md={4} key={tile.label}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
            >
              <CardActionArea
                onClick={() => router.push(tile.href)}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ color: ELECTRIC_BLUE, mb: 2 }}>{tile.icon}</Box>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {tile.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tile.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
