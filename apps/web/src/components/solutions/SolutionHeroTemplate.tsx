import { Box, Typography, Container } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import ConsultationForm from './ConsultationForm';

const GOLD = '#cfaf5b';

interface SolutionHeroTemplateProps {
  title: string;
  description: string;
  benefits: string[];
  imageSrc: string;
  /** Accessible label for the hero image (defaults from title). */
  imageAlt?: string;
  solutionName: string;
  IconComponent: React.ComponentType<{ sx?: object }>;
  children?: React.ReactNode;
}

export default function SolutionHeroTemplate({
  title,
  description,
  benefits,
  imageSrc,
  imageAlt,
  solutionName,
  IconComponent,
  children,
}: SolutionHeroTemplateProps) {
  const heroAlt = imageAlt ?? `${title} — Weir Here Staffing`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hero section - same as homepage page 1 */}
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
          {/* Decorative gold circles */}
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

          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', alignSelf: 'flex-start' }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a1a', letterSpacing: 0.5, mb: 3 }}>
              WEIR HERE
            </Typography>
          </Link>
          <Typography variant="overline" sx={{ color: GOLD, fontWeight: 600, letterSpacing: 1.5 }}>
            Solutions
          </Typography>

          {/* Headline with icon */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1, mb: 2 }}>
            <IconComponent sx={{ color: GOLD, fontSize: 28, mt: 0.3 }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a', lineHeight: 1.2 }}>
              {title}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: '#444', mt: 2, mb: 3 }}>
            {description}
          </Typography>

          <Typography variant="body1" fontWeight={600} sx={{ color: '#333', mb: 1 }}>
            We offer:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#444' }}>
            {benefits.map((item) => (
              <Typography component="li" key={item} variant="body2" sx={{ mb: 0.75 }}>
                {item}
              </Typography>
            ))}
          </Box>
          {children}
        </Box>

        {/* Right: circular hero image */}
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
                src={imageSrc}
                alt={heroAlt}
                fill
                sizes="(max-width: 599px) 300px, (max-width: 899px) 370px, 430px"
                priority
                unoptimized={imageSrc.endsWith('.gif')}
                style={{ objectFit: 'cover' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Consultation form section */}
      <Container maxWidth="md" className="snap-section" sx={{ py: 8, minHeight: { md: '100vh' }, display: 'flex', alignItems: 'center' }}>
        <ConsultationForm solutionName={solutionName} />
      </Container>
    </Box>
  );
}
