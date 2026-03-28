'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { hasPermission, PERMISSIONS } from '@weir-here/shared';
import { useAppSelector } from '@/store';
import { Box, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import Link from 'next/link';
import Image from 'next/image';
import HomeVideoHero from '@/components/home/HomeVideoHero';

const GOLD = '#cfaf5b';
const TEAL = '#00838f';

const CAROUSEL_INTERVAL_MS = 15000;

const SERVICES = [
  'Staffing solutions for healthcare & beyond',
  'Skilled nursing and home care placements',
  'Personal care and support staffing',
  'Temporary and permanent placements',
  'Nationwide opportunities',
];

export default function HomePageClient() {
  const router = useRouter();
  const { user } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const canPostJob =
    authUser != null && hasPermission(authUser.personas, PERMISSIONS.POST_JOB);
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

  // Enable snap scrolling on desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    if (mq.matches) {
      document.body.classList.add('home-snap-scroll');
    }
    return () => {
      document.body.classList.remove('home-snap-scroll');
    };
  }, []);

  const handleTalent = () => {
    if (!user) {
      router.push('/auth/login?returnTo=/dashboard/post-job');
      return;
    }
    if (canPostJob) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/contact');
    }
  };

  const handleCareer = () => {
    router.push('/jobs');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <HomeVideoHero />
    <Box
      className="snap-section"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: { xs: 'auto', md: '100vh' },
        overflow: 'hidden',
      }}
    >
      {/* Left: white content */}
      <Box
        sx={{
          flex: { md: '1 1 48%' },
          maxWidth: { md: 465 },
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
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: i === carouselIndex ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out',
                  pointerEvents: 'none',
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 599px) 300px, (max-width: 899px) 380px, 440px"
                  priority={i === 0}
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>

      {/* Second section: Teal with triangle of images */}
      <Box
        className="snap-section"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: TEAL,
          py: { xs: 6, md: 8 },
          px: { xs: 3, md: 6 },
          gap: { xs: 4, md: 6 },
          minHeight: { xs: 'auto', md: '100vh' },
        }}
      >
        {/* Left: Triangle of circular images with connecting lines */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 336, md: 432 },
            height: { xs: 312, md: 408 },
            flexShrink: 0,
          }}
        >
          {/* SVG lines connecting the circles (triangle) */}
          <svg
            viewBox="0 0 432 408"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <line x1="216" y1="78" x2="78" y2="330" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <line x1="216" y1="78" x2="354" y2="330" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <line x1="78" y1="330" x2="354" y2="330" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </svg>
          {/* Top circle */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 120, md: 156 },
              height: { xs: 120, md: 156 },
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.6)',
            }}
          >
            <Image
              src="/Black_doctor_seeing_patient_ee388b378f.jpeg"
              alt="Doctor with patient"
              fill
              sizes="(max-width: 899px) 120px, 156px"
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          </Box>
          {/* Bottom left circle */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: { xs: 120, md: 156 },
              height: { xs: 120, md: 156 },
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.6)',
            }}
          >
            <Image
              src="/Black_nurse_babysitting_child_4e246048c5.jpeg"
              alt="Nurse with child"
              fill
              sizes="(max-width: 899px) 120px, 156px"
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          </Box>
          {/* Bottom right circle */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: { xs: 120, md: 156 },
              height: { xs: 120, md: 156 },
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.6)',
            }}
          >
            <Image
              src="/Black_orderly_pushing_gurney_12839cff65.jpeg"
              alt="Orderly with gurney"
              fill
              sizes="(max-width: 899px) 120px, 156px"
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          </Box>
        </Box>

        {/* Right: Title and text */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 520,
            color: '#cfaf5b',
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2, letterSpacing: 0.5 }}>
            Weir Heir is About
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            A Company Built on Vision, Integrity & Innovation
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            With leadership grounded in real‑world experience across Jamaica and the U.S., and supported by strong financial and operational systems, Weir Here Staffing Solutions is designed to meet the evolving needs of the healthcare industry.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            We&apos;re not just filling roles — we&apos;re elevating the standard of workforce partnerships.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
