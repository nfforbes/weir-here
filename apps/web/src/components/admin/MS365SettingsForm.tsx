'use client';

import { useEffect, useState, useCallback, type FormEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchSettings,
  saveSettings,
} from '@/store/slices/settingsSlice';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'password';
}

const FIELDS: FieldConfig[] = [
  { key: 'MS365_CLIENT_ID', label: 'Client ID', type: 'text' },
  { key: 'MS365_CLIENT_SECRET', label: 'Client Secret', type: 'password' },
  { key: 'MS365_TENANT_ID', label: 'Tenant ID', type: 'text' },
  { key: 'MS365_SHAREPOINT_SITE_ID', label: 'SharePoint Site ID', type: 'text' },
  { key: 'MS365_RESUME_FOLDER_PATH', label: 'Resume Folder Path', type: 'text' },
  { key: 'MS365_LOGO_FOLDER_PATH', label: 'Logo Folder Path', type: 'text' },
  { key: 'MS365_JOB_ATTACHMENT_PATH', label: 'Job Attachment Path', type: 'text' },
];

export default function MS365SettingsForm() {
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((state) => state.settings);

  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = useCallback((key: string, value: string) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const payload: Record<string, string> = {};
      for (const field of FIELDS) {
        const val = form[field.key] ?? '';
        if (val && val !== '********') {
          payload[field.key] = val;
        }
      }

      dispatch(saveSettings(payload));
      setSaved(true);
    },
    [dispatch, form],
  );

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Microsoft 365 Settings
      </Typography>

      {saved && !error && !loading && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && Object.keys(form).length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {FIELDS.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                type={field.type}
                fullWidth
                value={form[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.type === 'password' ? '••••••••' : ''}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            ))}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ mt: 4, minWidth: 160 }}
          >
            {loading ? 'Saving…' : 'Save Settings'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
