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
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import { ELECTRIC_BLUE, DEEP_NAVY } from '@/theme/theme';

const TILES = [
  { label: 'Assignments', icon: <WorkIcon sx={{ fontSize: 48 }} />, href: '/dashboard/provider/portal/assignments', desc: 'View and manage your assignments' },
  { label: 'My Profile', icon: <PersonIcon sx={{ fontSize: 48 }} />, href: '/dashboard/provider/portal/profile', desc: 'Update your address, parishes, and contact details' },
];

export default function ProviderPortalPage() {
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
          Provider Portal
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Welcome to the Provider Portal. View your assignments and manage your jobs from here.
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
