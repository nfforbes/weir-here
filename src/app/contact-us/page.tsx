import { Container, Typography, Box, Paper, Link as MuiLink } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function ContactUsPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Contact Us
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        We would love to hear from you. Reach out through any of the channels below.
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocationOnIcon color="primary" />
            <Box>
              <Typography variant="subtitle2">Address</Typography>
              <Typography variant="body2" color="text.secondary">
                123 Staffing Avenue, Suite 100, Johannesburg, South Africa
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmailIcon color="primary" />
            <Box>
              <Typography variant="subtitle2">Email</Typography>
              <MuiLink href="mailto:info@weirhere.com" variant="body2">
                info@weirhere.com
              </MuiLink>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FacebookIcon color="primary" />
            <Box>
              <Typography variant="subtitle2">Facebook</Typography>
              <MuiLink href="https://facebook.com/weirhere" target="_blank" rel="noopener" variant="body2">
                facebook.com/weirhere
              </MuiLink>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InstagramIcon color="primary" />
            <Box>
              <Typography variant="subtitle2">Instagram</Typography>
              <MuiLink href="https://instagram.com/weirhere" target="_blank" rel="noopener" variant="body2">
                @weirhere
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
