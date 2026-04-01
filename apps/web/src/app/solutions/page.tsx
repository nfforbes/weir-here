import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import BusinessIcon from '@mui/icons-material/Business';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Link from 'next/link';

export const metadata: Metadata = {
  ...withCanonical('/solutions'),
  title: 'Staffing Solutions in Jamaica | Weir Here Staffing',
  description:
    'Explore healthcare and domestic staffing solutions in Jamaica — for employers looking to hire and job seekers building their careers. Weir Here Staffing Solutions, Kingston.',
};

const GOLD = '#cfaf5b';

const solutions = [
  {
    title: 'For Employers',
    description:
      'Streamline your hiring process with our full-service staffing solutions. From temporary placements to executive search, we find the right people fast.',
    href: '/solutions/employers',
    icon: BusinessIcon,
  },
  {
    title: 'For Job Seekers',
    description:
      'Discover your next career opportunity. We connect skilled professionals with leading companies across a range of industries.',
    href: '/solutions/job-seekers',
    icon: PersonSearchIcon,
  },
];

export default function SolutionsPage() {
  return (
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
        {/* Decorative gold circles - bottom left */}
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
          Solutions
        </Typography>

        {/* Headline */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1, mb: 2 }}>
          <BoltIcon sx={{ color: GOLD, fontSize: 28, mt: 0.3 }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a', lineHeight: 1.2 }}>
            Our Solutions
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: '#444', mt: 2, mb: 3 }}>
          Whether you&apos;re looking to build your workforce or advance your career,
          Weir Here Staffing has a tailored solution for you.
        </Typography>

        {/* Solution links */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {solutions.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: GOLD,
                    boxShadow: 2,
                  },
                }}
              >
                <s.icon sx={{ color: GOLD, fontSize: 32, flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                    {s.description}
                  </Typography>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
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
        {/* Two concentric rings (gold outer) then circular image */}
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
            <Image
              src="/Black_nurse_babysitting_child_4e246048c5.jpeg"
              alt="Healthcare staffing"
              fill
              sizes="(max-width: 599px) 300px, (max-width: 899px) 370px, 430px"
              priority
              style={{ objectFit: 'cover' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
