'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export default function Footer() {
  const linkSx = {
    color: 'rgba(207,175,91,0.85)',
    textDecoration: 'none',
    '&:hover': { color: '#cfaf5b', textDecoration: 'underline' },
  } as const;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#000',
        color: '#cfaf5b',
        py: 3,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
        &copy; 2026 Weir Here Staffing. All rights reserved.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          component={Link}
          href="/terms"
          variant="body2"
          sx={linkSx}
        >
          Terms of Use
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>|</Typography>
        <Typography
          component={Link}
          href="/privacy"
          variant="body2"
          sx={linkSx}
        >
          Privacy
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>|</Typography>
        <Typography
          component={Link}
          href="/security"
          variant="body2"
          sx={linkSx}
        >
          Security
        </Typography>
      </Box>
    </Box>
  );
}
