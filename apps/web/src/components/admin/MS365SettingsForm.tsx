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
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchSettings,
  saveSettings,
} from '@/store/slices/settingsSlice';
import { toUserErrorMessage } from '@/lib/errorMessage';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'password';
  helperText?: string;
}

const APP_REGISTRATION_FIELDS: FieldConfig[] = [
  {
    key: 'MS365_CLIENT_ID',
    label: 'Application (client) ID',
    type: 'text',
    helperText: 'From your Azure AD app registration Overview page.',
  },
  {
    key: 'MS365_TENANT_ID',
    label: 'Directory (tenant) ID',
    type: 'text',
    helperText: 'Your Microsoft Entra tenant ID.',
  },
  {
    key: 'MS365_CLIENT_SECRET',
    label: 'Client secret value',
    type: 'password',
    helperText: 'Create a client secret under Certificates & secrets (stored encrypted in the database).',
  },
];

const MAIL_FIELDS: FieldConfig[] = [
  {
    key: 'MS365_MAIL_FROM',
    label: 'Send mail as (email)',
    type: 'text',
    helperText:
      'UPN of the mailbox that sends email. The app registration needs Mail.Send (application) permission with admin consent.',
  },
  {
    key: 'MS365_MAIL_TO',
    label: 'Consultation inbox (optional)',
    type: 'text',
    helperText:
      'Where consultation form submissions are delivered. Leave blank to use the send-as mailbox.',
  },
  {
    key: 'MS365_APPLICATIONS_MAIL_TO',
    label: 'Job applications inbox (optional)',
    type: 'text',
    helperText:
      'Where job application notifications (with resume PDF) are sent. Leave blank to use the consultation inbox or send-as mailbox.',
  },
];

const SHAREPOINT_FIELDS: FieldConfig[] = [
  { key: 'MS365_SHAREPOINT_SITE_ID', label: 'SharePoint site ID', type: 'text' },
  { key: 'MS365_RESUME_FOLDER_PATH', label: 'Resume folder path', type: 'text' },
  { key: 'MS365_LOGO_FOLDER_PATH', label: 'Logo folder path', type: 'text' },
  { key: 'MS365_JOB_ATTACHMENT_PATH', label: 'Job attachment path', type: 'text' },
];

const ALL_FIELDS = [
  ...APP_REGISTRATION_FIELDS,
  ...MAIL_FIELDS,
  ...SHAREPOINT_FIELDS,
];

const MASK_SKIP = '********';

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
      for (const field of ALL_FIELDS) {
        const val = form[field.key] ?? '';
        if (field.type === 'password' && val === MASK_SKIP) continue;
        payload[field.key] = val;
      }

      dispatch(saveSettings(payload));
      setSaved(true);
    },
    [dispatch, form],
  );

  const renderFields = (fields: FieldConfig[]) =>
    fields.map((field) => (
      <TextField
        key={field.key}
        label={field.label}
        type={field.type}
        fullWidth
        value={form[field.key] ?? ''}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.type === 'password' ? '••••••••' : ''}
        helperText={field.helperText}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />
    ));

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Microsoft 365
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        App registration credentials are used for Microsoft Graph (email and SharePoint uploads).
      </Typography>

      {saved && !error && !loading && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {toUserErrorMessage(error, 'Settings error')}
        </Alert>
      )}

      {loading && Object.keys(form).length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            App registration
          </Typography>
          <Stack spacing={2.5}>
            {renderFields(APP_REGISTRATION_FIELDS)}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Email (Microsoft Graph)
          </Typography>
          <Stack spacing={2.5}>{renderFields(MAIL_FIELDS)}</Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            SharePoint (file uploads)
          </Typography>
          <Stack spacing={2.5}>{renderFields(SHAREPOINT_FIELDS)}</Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ mt: 4, minWidth: 160 }}
          >
            {loading ? 'Saving…' : 'Save settings'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
