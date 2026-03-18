'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const CONSULTATION_EMAIL = 'consultation@weirheresolutions.com';

interface ConsultationFormProps {
  solutionName: string;
}

export default function ConsultationForm({ solutionName }: ConsultationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Consultation Request: ${solutionName}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
    );
    const mailto = `mailto:${CONSULTATION_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <Paper elevation={2} sx={{ p: 4, mt: 8 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Request a Consultation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Interested in our {solutionName} services? Fill out the form below and we&apos;ll
        get back to you shortly.
      </Typography>

      {submitted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Your email client will open with a pre-filled message. Please send the email to
          complete your consultation request.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
          <Button type="submit" variant="contained" endIcon={<SendIcon />} sx={{ alignSelf: 'flex-start' }}>
            Send Consultation Request
          </Button>
        </Box>
      )}
    </Paper>
  );
}
