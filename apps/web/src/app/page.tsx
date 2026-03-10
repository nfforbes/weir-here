'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GOLD = '#cfaf5b';

const CAROUSEL_INTERVAL_MS = 15000;

const SERVICES = [
  'Staffing solutions for healthcare & beyond',
  'Skilled nursing and home care placements',
  'Personal care and support staffing',
  'Temporary and permanent placements',
  'Nationwide opportunities',
];

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselImages = [
    '/weir-here-logo.jpeg',
    '/Black_nurse_babysitting_child_4e246048c5.jpeg',
    '/realistic-scene-with-elderly-care-senior-people.png',
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselImages.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const handleTalent = () => {
    if (user) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/auth/login?returnTo=/dashboard/post-job');
    }
  };

  const handleCareer = () => {
    router.push('/jobs');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: 'calc(100vh - 180px)',
        overflow: 'hidden',
      }}
    >
      {/* Left: white content */}
      <Box
        sx={{
          flex: { md: '1 1 48%' },
          maxWidth: { md: 560 },
          bgcolor: '#fff',
          py: { xs: 4, md: 6 },
          px: { xs: 3, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Decorative gold curve - bottom left */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: GOLD,
            opacity: 0.12,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: -60,
            width: 140,
            height: 140,
            borderRadius: '50%',
            bgcolor: GOLD,
            opacity: 0.08,
          }}
        />

        {/* Logo / brand */}
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', alignSelf: 'flex-start' }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a1a', letterSpacing: 0.5, mb: 3 }}>
            WEIR HERE
          </Typography>
        </Link>
        <Typography variant="overline" sx={{ color: GOLD, fontWeight: 600, letterSpacing: 1.5 }}>
          Staffing
        </Typography>

        {/* Headline */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1, mb: 2 }}>
          <BoltIcon sx={{ color: GOLD, fontSize: 28, mt: 0.3 }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a', lineHeight: 1.2 }}>
            Providing comprehensive services
          </Typography>
        </Box>

        {/* We provide list */}
        <Typography variant="body1" fontWeight={600} sx={{ color: '#333', mt: 3, mb: 1 }}>
          We provide:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#444' }}>
          {SERVICES.map((item) => (
            <Typography component="li" key={item} variant="body2" sx={{ mb: 0.75 }}>
              {item}
            </Typography>
          ))}
        </Box>

        {/* CTAs */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleTalent}
            sx={{
              bgcolor: '#000',
              color: GOLD,
              px: 3,
              py: 1.5,
              '&:hover': { bgcolor: '#222', color: GOLD },
            }}
          >
            I need talent
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleCareer}
            sx={{
              borderColor: GOLD,
              color: GOLD,
              px: 3,
              py: 1.5,
              '&:hover': { borderColor: GOLD, bgcolor: 'rgba(207,175,91,0.08)' },
            }}
          >
            I need a career
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
          Nationwide staffing solutions available.
        </Typography>
      </Box>

      {/* Right: circular hero image on white */}
      <Box
        sx={{
          flex: { md: '1 1 52%' },
          minHeight: { xs: 320, md: 'auto' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fff',
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Two concentric rings (gold outer, teal inner) then circular image */}
        <Box
          sx={{
            width: { xs: 310, sm: 390, md: 450 },
            height: { xs: 310, sm: 390, md: 450 },
            borderRadius: '50%',
            border: '5px solid',
            borderColor: GOLD,
            padding: '10px',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: '#1a1a1a',
            }}
          >
            {carouselImages.map((src, i) => (
              <Box
                key={src}
                component="img"
                src={src}
                alt=""
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: i === carouselIndex ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
