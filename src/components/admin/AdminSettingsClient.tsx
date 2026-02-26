'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';

const MS365_FIELDS = [
  { key: 'MS365_CLIENT_ID', label: 'MS365 Client ID', secret: false },
  { key: 'MS365_CLIENT_SECRET', label: 'MS365 Client Secret', secret: true },
  { key: 'MS365_TENANT_ID', label: 'MS365 Tenant ID', secret: false },
  { key: 'MS365_SHAREPOINT_SITE_ID', label: 'SharePoint Site ID', secret: false },
  { key: 'MS365_RESUME_FOLDER_PATH', label: 'Resume Folder Path', secret: false },
  { key: 'MS365_LOGO_FOLDER_PATH', label: 'Logo Folder Path', secret: false },
  { key: 'MS365_JOB_ATTACHMENT_PATH', label: 'Job Attachment Path', secret: false },
];

export default function AdminSettingsClient() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setValues(data.settings || {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage({ text: 'Settings saved successfully', severity: 'success' });
    } catch {
      setMessage({ text: 'Failed to save settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Admin Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure Microsoft 365 / SharePoint integration credentials. These are stored securely
        in the database and used server-side only.
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {MS365_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              type={field.secret ? 'password' : 'text'}
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              fullWidth
            />
          ))}

          {message && <Alert severity={message.severity}>{message.text}</Alert>}

          <Button variant="contained" onClick={handleSave} disabled={saving} size="large">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
