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
      {/* NAP — consistent name/address/phone for local SEO */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
          Weir Here Staffing Solutions
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          RoseDale Drive, Kingston, Jamaica
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          <Box sx={{ color: 'rgba(207,175,91,0.75)', display: 'inline-flex', gap: 0.5 }}>
            Call or WhatsApp: 
            <Box component="a" href="tel:+18765619970" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#cfaf5b' } }}>(876) 561-9970</Box>
            {' / '}
            <Box component="a" href="tel:+18765619856" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#cfaf5b' } }}>(876) 561-9856</Box>
          </Box>
          {' · '}
          <Box
            component="a"
            href="mailto:info@weirheresolutions.com"
            sx={{ color: 'rgba(207,175,91,0.75)', textDecoration: 'none', '&:hover': { color: '#cfaf5b' } }}
          >
            info@weirheresolutions.com
          </Box>
        </Typography>
      </Box>

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
