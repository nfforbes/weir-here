'use client';

import Image from 'next/image';
import {
  Container,
  Typography,
  Paper,
  Box,
  Link,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RateReviewIcon from '@mui/icons-material/RateReview';
import {
  BUSINESS_ADDRESS_LINE,
  BUSINESS_CITY,
  BUSINESS_COUNTRY,
  GOOGLE_BUSINESS_MAP_EMBED_URL,
  GOOGLE_BUSINESS_MAPS_URL,
  GOOGLE_REVIEW_QR_IMAGE,
  GOOGLE_REVIEW_URL,
} from '@/lib/businessAddress';

export default function ContactPageContent() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        We&apos;d love to hear from you. Reach out through any of the channels below.
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, overflow: 'hidden' }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight={700} color="primary">
                {BUSINESS_CITY} (Registered Office)
              </Typography>
              <Typography
                component={Link}
                href={GOOGLE_BUSINESS_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="body1"
                underline="hover"
                sx={{ display: 'inline-block', mt: 0.5 }}
              >
                {BUSINESS_ADDRESS_LINE}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Button
                component="a"
                href={GOOGLE_BUSINESS_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                startIcon={<OpenInNewIcon />}
              >
                Open in Maps
              </Button>
            </Box>

            <Box
              component="iframe"
              src={GOOGLE_BUSINESS_MAP_EMBED_URL}
              title="Weir Here Staffing Solutions on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              sx={{
                width: '100%',
                height: { xs: 260, sm: 320 },
                border: 0,
                borderRadius: 1,
                display: 'block',
              }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <RateReviewIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Leave a Google Review
              </Typography>
            </Box>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 'auto' }}>
                <Link
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Leave a Google review for Weir Here Staffing Solutions"
                  sx={{ display: 'inline-block' }}
                >
                  <Image
                    src={GOOGLE_REVIEW_QR_IMAGE}
                    alt="Scan to leave a Google review for Weir Here Staffing Solutions"
                    width={180}
                    height={180}
                    style={{ width: 180, height: 180, borderRadius: 8 }}
                  />
                </Link>
              </Grid>
              <Grid size={{ xs: 12, sm: 'grow' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your feedback helps families and employers find trusted staffing support. Scan the QR code or use the link below to share your experience on Google.
                </Typography>
                <Button
                  component="a"
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<RateReviewIcon />}
                >
                  Write a Google Review
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <WhatsAppIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Phone / WhatsApp
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="tel:+18765619970" underline="hover">
                (876) 561-9970
              </Link>
              <Link href="tel:+18765619856" underline="hover">
                (876) 561-9856
              </Link>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <EmailIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Email
              </Typography>
            </Box>
            <Link href="mailto:info@weirheresolutions.com" underline="hover">
              info@weirheresolutions.com
            </Link>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <FacebookIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Facebook
              </Typography>
            </Box>
            <Link
              href="https://facebook.com/weirherestaffing"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              facebook.com/weirherestaffing
            </Link>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <InstagramIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Instagram
              </Typography>
            </Box>
            <Link
              href="https://instagram.com/weirherestaffing"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              @weirherestaffing
            </Link>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
