'use client';

import { Box, Typography } from '@mui/material';

const HERO_VIDEO = '/Aerial_view_tropical_202603280014.mp4';
/** Optional: add a small poster frame (WebP) and pass poster="/hero-aerial-poster.jpg" on the video for faster first paint. */
const GOLD = '#cfaf5b';

export default function HomeVideoHero() {
  return (
    <Box
      component="section"
      className="snap-section"
      aria-label="Hero"
      sx={{
        position: 'relative',
        width: '100%',
        /* Taller on small screens so contain-fit video has room to show the full (wide) aerial frame */
        minHeight: { xs: 'min(380px, 52vh)', sm: 'min(420px, 50vh)', md: '100vh' },
        bgcolor: { xs: '#0a1620', md: 'transparent' },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        sx={{
          position: 'absolute',
          zIndex: 0,
          pointerEvents: 'none',
          /* md+: full-bleed cover | xs–sm: contain so the whole country / frame is visible (letterboxed) */
          top: { xs: 0, md: '50%' },
          left: { xs: 0, md: '50%' },
          right: { xs: 0, md: 'auto' },
          bottom: { xs: 0, md: 'auto' },
          width: { xs: '100%', md: 'auto' },
          height: { xs: '100%', md: 'auto' },
          transform: { xs: 'none', md: 'translate(-50%, -50%)' },
          minWidth: { xs: 'unset', md: '100%' },
          minHeight: { xs: 'unset', md: '100%' },
          objectFit: { xs: 'contain', sm: 'contain', md: 'cover' },
        }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          px: 3,
          py: 4,
          textAlign: 'center',
          maxWidth: 720,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: GOLD, fontWeight: 700, letterSpacing: '0.2em', display: 'block', mb: 1 }}
        >
          Weir Here Staffing
        </Typography>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={800}
          sx={{
            color: '#fff',
            textShadow: '0 2px 24px rgba(0,0,0,0.45)',
            lineHeight: 1.2,
            fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem' },
          }}
        >
          Healthcare &amp; care staffing—grounded in trust, reach, and reliability.
        </Typography>
      </Box>
    </Box>
  );
}
