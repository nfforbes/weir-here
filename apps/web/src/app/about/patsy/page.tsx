import { Box, Typography, Container, Button, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import type { Metadata } from 'next';
import LinkNext from 'next/link';

export const metadata: Metadata = {
  title: 'Patsy Weir | Weir Here Staffing',
};

const BG_LIGHT = '#f8f7f4';
const BG_STRIP = '#e8e6e0';
const TEXT_DARK = '#1a1a1a';

const LINKEDIN_URL = 'https://linkedin.com/in/patsy';
const INSTAGRAM_URL = 'https://instagram.com/patsy';

export default function PatsyProfilePage() {
  return (
    <Box sx={{ bgcolor: BG_LIGHT, minHeight: '100vh', display: 'flex' }}>
      <Box
        sx={{
          width: 24,
          flexShrink: 0,
          bgcolor: BG_STRIP,
        }}
      />
      <Box sx={{ flex: 1, py: { xs: 4, md: 8 }, px: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg" disableGutters>
          <Button
            component={LinkNext}
            href="/about"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 4, color: TEXT_DARK }}
          >
            Back
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            {/* Left: Circular image */}
            <Box sx={{ flexShrink: 0 }}>
              <Box
                component="img"
                src="/patsy.jpg"
                alt="Patsy"
                sx={{
                  width: 280,
                  height: 280,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <Typography variant="h5" fontWeight={700} sx={{ color: TEXT_DARK, mt: 2, textAlign: 'center' }}>
                Patsy Weir
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', textAlign: 'center', mb: 2 }}>
                Chief Financial Officer
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Link
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', color: '#0a66c2' }}
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon sx={{ fontSize: 32 }} />
                </Link>
                <Link
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', color: '#e4405f' }}
                  aria-label="Instagram"
                >
                  <InstagramIcon sx={{ fontSize: 32 }} />
                </Link>
              </Box>
            </Box>

            {/* Right: Bio */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                Our CFO brings extensive experience in finance, business management, and operational oversight, supporting organizations through major growth cycles, regulatory environments, and complex financial landscapes. With years of financial leadership across multiple industries and entrepreneurial ventures, the CFO ensures Weir Here Staffing Solutions operates on a foundation of fiscal discipline, transparency, and long‑term sustainability.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                Their expertise includes:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: '#444', mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Financial planning & forecasting
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Multi‑company financial management
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Compliance & regulatory alignment
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Payroll and workforce cost structures
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Strategic investment & scaling models
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                With this strong financial leadership, Weir Here Staffing Solutions is positioned for responsible growth, competitive pricing, and a service model that supports both clients and clinicians without compromising stability.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
