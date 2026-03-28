import { Box, Typography, Container, Button, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import type { Metadata } from 'next';
import LinkNext from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Carla Brannon — CEO | Weir Here Staffing',
  description:
    'Meet Carla Brannon, Chief Executive Officer of Weir Here Staffing Solutions. 20+ years of healthcare operations and workforce leadership experience.',
};

const BG_LIGHT = '#f8f7f4';
const BG_STRIP = '#e8e6e0';
const TEXT_DARK = '#1a1a1a';

const LINKEDIN_URL = 'https://linkedin.com/in/carla-brannon';
const INSTAGRAM_URL = 'https://instagram.com/carlabrannon';

export default function CarlaProfilePage() {
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
                sx={{
                  position: 'relative',
                  width: 280,
                  height: 280,
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/carla.jpg"
                  alt="Carla Brannon"
                  fill
                  sizes="280px"
                  loading="lazy"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: TEXT_DARK, mt: 2, textAlign: 'center' }}>
                Carla Brannon
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', textAlign: 'center', mb: 2 }}>
                Chief Executive Officer
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
                Carla Brannon is the Chief Executive Officer of Weir Here Staffing Solutions, bringing more than two decades of leadership experience in healthcare operations, workforce management, and organizational transformation. Known for her strategic clarity, operational discipline, and people‑first leadership style, Carla has built her career on strengthening systems, elevating service delivery, and creating environments where teams thrive and clients receive exceptional value.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                Before stepping into the CEO role, Carla spent 20+ years driving performance across multi‑site healthcare operations. Her expertise includes physician relations, government‑aligned programs, workforce deployment, compliance oversight, and the transformation of underperforming processes into scalable, high‑functioning systems. Throughout her career, she has been widely recognized for the ability to balance operational excellence with compassionate, relationship‑centered leadership.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                As CEO of Weir Here Staffing Solutions, Carla leads the company&apos;s vision of becoming the most trusted partner for healthcare organizations seeking high‑quality, reliable, and people‑centered staffing support. She is committed to designing a modern workforce model—one that improves patient care, elevates provider experience, strengthens compliance, and delivers measurable operational results to clients.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                Under her leadership, Weir Here Staffing Solutions focuses on:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: '#444', mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Delivering highly qualified clinical and non‑clinical talent
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Building long‑term partnerships with hospitals, practices, and community health organizations
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Creating efficient, compliant, and scalable staffing systems
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Improving workforce stability and operational continuity
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                  Empowering clinicians and support staff through training, support, and career development
                </Typography>
              </Box>
              <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                Carla&apos;s educational foundation includes a Bachelor of Arts in Law and Society from Penn State University and ongoing graduate studies toward a Master&apos;s Degree in Law and Business Management, further strengthening her leadership approach at the intersection of operations, business strategy, and regulatory structure.
              </Typography>
              <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                Driven by integrity, innovation, and a deep commitment to service, Carla Brannon leads Weir Here Staffing Solutions with a clear mission: to redefine healthcare staffing by putting people, quality, and trust at the center of every partnership.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
