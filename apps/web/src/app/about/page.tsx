import { Box, Typography, Container } from '@mui/material';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/about'),
  title: 'About Weir Here Staffing Solutions | Kingston, Jamaica',
  description:
    'Learn about Weir Here Staffing Solutions — a Kingston, Jamaica staffing agency dedicated to connecting qualified healthcare professionals and domestic workers with employers and families. Meet our leadership.',
};

const BG_LIGHT = '#f8f7f4';
const BG_STRIP = '#e8e6e0';
const TEXT_DARK = '#1a1a1a';

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: BG_LIGHT, minHeight: '100vh', display: 'flex' }}>
      {/* Beige-gray vertical strip on left */}
      <Box
        sx={{
          width: 24,
          flexShrink: 0,
          bgcolor: BG_STRIP,
        }}
      />

      <Box sx={{ flex: 1, py: { xs: 4, md: 8 }, px: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg" disableGutters>
          {/* Top section: About Us */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr 1fr' },
              gap: 4,
              mb: { xs: 6, md: 10 },
              alignItems: 'center',
            }}
          >
            {/* Left: About Us heading + description */}
            <Box>
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{
                  color: TEXT_DARK,
                  letterSpacing: 3,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                ABOUT US
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: TEXT_DARK, mb: 2 }}>
                Healthcare Staffing Solutions
              </Typography>
              <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.7 }}>
                At Weir Here Staffing, we believe that exceptional care begins with exceptional people. We are committed to strengthening communities by connecting qualified, compassionate healthcare professionals with the facilities, families, and organizations that need them most. We are more than a staffing agency, we are a dedicated partner built on integrity and personalized service. Whether supporting a hospital, long-term care facility, private home, or childcare environment, Weir Here Staffing ensures every placement contributes to safer care, smoother operations, and better outcomes. *When you need us, Weir Here.*
              </Typography>
            </Box>

            {/* Center: Large image */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                maxHeight: 360,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image
                src="/realistic-scene-with-elderly-care-senior-people.png"
                alt="Healthcare staffing"
                fill
                sizes="(max-width: 900px) 92vw, 520px"
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />
            </Box>

            {/* Right: Our Philosophy card */}
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ color: TEXT_DARK, mb: 2 }}>
                Our Philosophy
              </Typography>
              <Typography variant="body1" sx={{ color: '#444', mb: 2, lineHeight: 1.7 }}>
                At Weir Here Staffing, we believe in creating trusted, personalized partnerships that reflect our clients&apos; needs and our commitment to exceptional care. When you need us, Weir Here.
              </Typography>
              <Box sx={{ position: 'relative', width: '100%', height: 140, borderRadius: 1, overflow: 'hidden' }}>
                <Image
                  src="/Black_nurse_babysitting_child_4e246048c5.jpeg"
                  alt="Care"
                  fill
                  sizes="(max-width: 1200px) 90vw, 360px"
                  loading="lazy"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Box>
          </Box>

          {/* Bottom section: Meet the Principals */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              p: { xs: 4, md: 6 },
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: TEXT_DARK,
                letterSpacing: 2,
                textAlign: 'center',
                mb: 3,
              }}
            >
              MEET THE PRINCIPALS
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 80,
                mx: 'auto',
                mb: 4,
                borderRadius: 2,
                bgcolor: BG_STRIP,
              }}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr 1fr' },
                gap: 4,
                alignItems: 'center',
              }}
            >
              {/* Left principal: Carla - card style (clickable) */}
              <Link href="/about/carla" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: BG_STRIP,
                    borderRadius: 2,
                    p: 2,
                    overflow: 'hidden',
                    maxWidth: 280,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src="/carla.jpg"
                    alt="Carla Brannon"
                    sx={{
                      width: '100%',
                      maxWidth: 240,
                      height: 280,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight={700} sx={{ color: TEXT_DARK, mt: 2 }}>
                    Carla Brannon
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Chief Executive Officer
                  </Typography>
                </Box>
              </Link>

              {/* Center: Description */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.7, textAlign: 'center' }}>
                </Typography>
              </Box>

              {/* Right principal: Patsy - card style (clickable) */}
              <Link href="/about/patsy" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: BG_STRIP,
                    borderRadius: 2,
                    p: 2,
                    overflow: 'hidden',
                    maxWidth: 280,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 240, height: 280, borderRadius: 1, overflow: 'hidden', mx: 'auto' }}>
                    <Image
                      src="/patsy.jpg"
                      alt="Patsy Weir"
                      fill
                      sizes="240px"
                      loading="lazy"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: TEXT_DARK, mt: 2 }}>
                    Patsy Weir
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Chief Financial Officer
                  </Typography>
                </Box>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
