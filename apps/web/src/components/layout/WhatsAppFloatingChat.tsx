'use client';

import { Fab, Zoom, useScrollTrigger } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function WhatsAppFloatingChat() {
  const phone = '18765619970'; // Jamaican number from layout.tsx
  const message = 'Hello, I would like to inquire about your staffing services.';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <Zoom in={true}>
      <Fab
        color="success"
        aria-label="whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#25D366',
          '&:hover': {
            backgroundColor: '#128C7E',
          },
          zIndex: 1000,
        }}
      >
        <WhatsAppIcon />
      </Fab>
    </Zoom>
  );
}
