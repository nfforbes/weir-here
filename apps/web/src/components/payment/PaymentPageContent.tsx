'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Image from 'next/image';

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PaymentPageContent() {
  const renderPaypalButton = () => {
    if (window.paypal && typeof window.paypal.HostedButtons === 'function') {
      window.paypal.HostedButtons({
        hostedButtonId: "FWLSGF84XBN66",
      }).render("#paypal-container-FWLSGF84XBN66");
    }
  };

  useEffect(() => {
    // If paypal is already loaded, render immediately
    if (window.paypal) {
      renderPaypalButton();
    }
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 8 } }}>
      <Script
        src="https://www.paypal.com/sdk/js?client-id=BAAEUEPRE3Xz9G8BgtSiMz_TQXU9WTEnUmpgAY6xms1tnCAnD7X097b0J9-_QmVjaodNSsQbSVslniwtiw&components=hosted-buttons&disable-funding=venmo&currency=USD"
        onLoad={renderPaypalButton}
        strategy="afterInteractive"
      />

      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(10px)',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Banner Image */}
          <Box sx={{ position: 'relative', height: { xs: 200, md: 350 }, width: '100%' }}>
            <Image
              src="/secure-payment-portal.png"
              alt="Secure Payment Portal"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                p: { xs: 2, md: 4 },
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', md: '3rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Secure Payment Portal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 3, md: 6 }, position: 'relative' }}>
            {/* Temporarily Unavailable Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 16px 16px',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: 'error.main',
                  fontWeight: 900,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  transform: 'rotate(-5deg)',
                  border: '8px solid',
                  borderColor: 'error.main',
                  p: 4,
                  borderRadius: 4,
                  letterSpacing: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  bgcolor: 'white',
                  maxWidth: '90%',
                }}
              >
                Temporarily Unavailable
              </Typography>
            </Box>

            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: 'text.secondary', lineHeight: 1.8 }}>
              Welcome to the Weir-Here Staffing Solutions secure payment gateway. We are committed to providing a seamless and professional experience, ensuring that managing your account is as efficient as the staffing services we provide.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: 'text.secondary', lineHeight: 1.8 }}>
              This portal allows our clients to settle invoices quickly and securely. Whether you are funding a new staffing contract, paying for specialized caregiving services, or settling recurring administrative fees, your transaction is protected by industry-standard encryption.
            </Typography>

            <Box sx={{ my: 6 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                How to Complete Your Payment
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <List sx={{ '& .MuiListItem-root': { px: 0, py: 1.5 } }}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="1. Enter Invoice Details" 
                    secondary="Please provide your Invoice Number and Client ID to ensure funds are credited to the correct account."
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="2. Verify Amount" 
                    secondary="Enter the total amount as specified on your billing statement."
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="3. Choose Payment Method" 
                    secondary="We accept all major credit and debit cards, as well as verified electronic bank transfers."
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="4. Confirmation" 
                    secondary="Once your transaction is processed, a digital receipt will be sent immediately to your registered email address."
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              </List>
            </Box>

            <Box 
              sx={{ 
                p: 3, 
                bgcolor: 'primary.lighter', 
                borderRadius: 2, 
                borderLeft: '4px solid', 
                borderColor: 'primary.main',
                mb: 6,
                display: 'flex',
                gap: 2
              }}
            >
              <InfoOutlinedIcon color="primary" />
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                <strong>Note:</strong> For international transactions or custom billing inquiries, please contact our accounts department directly at <a href="mailto:accounts@weirheresolutions.com" style={{ color: 'inherit' }}>accounts@weirheresolutions.com</a>.
              </Typography>
            </Box>

            <Typography variant="body1" align="center" sx={{ mb: 6, fontWeight: 500, color: 'text.secondary' }}>
              Your trust is our priority. Thank you for choosing Weir-Here Staffing Solutions for your professional staffing needs.
            </Typography>

            <Divider sx={{ mb: 6 }} />

            {/* PayPal Container */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box id="paypal-container-FWLSGF84XBN66" sx={{ width: '100%', maxWidth: 400 }}></Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
