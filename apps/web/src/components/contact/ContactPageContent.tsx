'use client';

import {
  Container,
  Typography,
  Paper,
  Box,
  Link,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const ADDRESS_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=RoseDale+Drive%2C+Kingston%2C+Jamaica';

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
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <LocationOnIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Address
              </Typography>
            </Box>
            <Typography
              component={Link}
              href={ADDRESS_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="body1"
              underline="hover"
            >
              RoseDale Drive
              <br />
              Kingston, Jamaica
            </Typography>
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
