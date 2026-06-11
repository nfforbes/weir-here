'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import GoogleIcon from '@mui/icons-material/Google';
import FolderIcon from '@mui/icons-material/Folder';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { ELECTRIC_BLUE } from '@/theme/theme';

interface ConfigValues {
  gdrive_client_id: string;
  gdrive_client_secret: string;
  gdrive_refresh_token: string;
  gdrive_folder_id: string;
}

export default function GoogleDriveSettingsForm() {
  const [values, setValues] = useState<ConfigValues>({
    gdrive_client_id: '',
    gdrive_client_secret: '',
    gdrive_refresh_token: '',
    gdrive_folder_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetch('/api/admin/configuration')
      .then((r) => r.json())
      .then((data) => setValues((v) => ({ ...v, ...data })))
      .catch(() => setError('Failed to load configuration'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Configuration saved successfully');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <GoogleIcon sx={{ color: '#4285f4' }} />
        <Typography variant="h5" fontWeight={700}>Google Drive Integration</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure OAuth2 credentials to enable qualification document uploads. You will need a Google Cloud project
        with the Drive API enabled, and an OAuth refresh token.{' '}
        <a href="https://developers.google.com/identity/protocols/oauth2" target="_blank" rel="noreferrer" style={{ color: ELECTRIC_BLUE }}>
          Learn more →
        </a>
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          fullWidth
          label="OAuth Client ID"
          value={values.gdrive_client_id}
          onChange={(e) => setValues((v) => ({ ...v, gdrive_client_id: e.target.value }))}
          placeholder="xxxx.apps.googleusercontent.com"
          helperText="From Google Cloud Console → Credentials"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          label="OAuth Client Secret"
          type={showSecret ? 'text' : 'password'}
          value={values.gdrive_client_secret}
          onChange={(e) => setValues((v) => ({ ...v, gdrive_client_secret: e.target.value }))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowSecret(!showSecret)} edge="end">
                  {showSecret ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText="Leave as '••••••••' to keep the existing value"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          label="OAuth Refresh Token"
          type={showToken ? 'text' : 'password'}
          value={values.gdrive_refresh_token}
          onChange={(e) => setValues((v) => ({ ...v, gdrive_refresh_token: e.target.value }))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowToken(!showToken)} edge="end">
                  {showToken ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText="Generated via OAuth consent flow. Leave as '••••••••' to keep the existing value"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          label="Target Folder ID (optional)"
          value={values.gdrive_folder_id}
          onChange={(e) => setValues((v) => ({ ...v, gdrive_folder_id: e.target.value }))}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
          InputProps={{
            startAdornment: <InputAdornment position="start"><FolderIcon sx={{ color: 'text.disabled' }} /></InputAdornment>,
          }}
          helperText="Google Drive folder ID where files will be uploaded. Leave blank to upload to root."
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 2, minWidth: 160, alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save Configuration'}
        </Button>
      </Box>
    </Paper>
  );
}
