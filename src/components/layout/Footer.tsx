'use client';

import { Box, Container, Typography, Link as MuiLink, Divider } from '@mui/material';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Divider sx={{ borderColor: 'grey.700', mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">&copy; {year} Weir Here. All rights reserved.</Typography>
          <MuiLink href="/terms" color="inherit" underline="hover" variant="body2">
            Terms of Use
          </MuiLink>
          <MuiLink href="/privacy" color="inherit" underline="hover" variant="body2">
            Privacy and Security
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}
