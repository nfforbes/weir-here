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
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchSettings,
  saveSettings,
} from '@/store/slices/settingsSlice';
import { toUserErrorMessage } from '@/lib/errorMessage';

type FieldConfig =
  | {
      key: string;
      label: string;
      type: 'text' | 'password';
      helperText?: string;
    }
  | {
      key: string;
      label: string;
      type: 'select';
      helperText?: string;
      options: { value: string; label: string }[];
    };

const DELIVERY_OPTIONS = [
  { value: 'primary', label: 'Primary inbox only' },
  { value: 'secondary', label: 'Second inbox only' },
  { value: 'both', label: 'Both inboxes' },
] as const;

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
      'Primary address for consultation form submissions. Leave blank to use the send-as mailbox.',
  },
  {
    key: 'MS365_MAIL_TO_2',
    label: 'Consultation — second inbox (optional)',
    type: 'text',
    helperText:
      'Optional second recipient for consultations. Used when delivery is “second” or “both”.',
  },
  {
    key: 'MS365_CONSULTATION_DELIVERY',
    label: 'Consultation delivery',
    type: 'select',
    helperText:
      'Which address(es) receive consultation emails. If “second” or “both”, set the second inbox above.',
    options: [...DELIVERY_OPTIONS],
  },
  {
    key: 'MS365_APPLICATIONS_MAIL_TO',
    label: 'Job applications — primary inbox (optional)',
    type: 'text',
    helperText:
      'Primary address for job application notifications. Leave blank to use the consultation inbox or send-as mailbox.',
  },
  {
    key: 'MS365_APPLICATIONS_MAIL_TO_2',
    label: 'Job applications — second inbox (optional)',
    type: 'text',
    helperText:
      'Optional second recipient for job applications. Used when delivery is “second” or “both”.',
  },
  {
    key: 'MS365_APPLICATIONS_DELIVERY',
    label: 'Job applications delivery',
    type: 'select',
    helperText:
      'Which address(es) receive job application notifications. Independent of consultation settings.',
    options: [...DELIVERY_OPTIONS],
  },
];

const SHAREPOINT_FIELDS: FieldConfig[] = [
  { key: 'MS365_SHAREPOINT_SITE_ID', label: 'SharePoint site ID', type: 'text' },
  { key: 'MS365_RESUME_FOLDER_PATH', label: 'Resume folder path', type: 'text' },
  { key: 'MS365_LOGO_FOLDER_PATH', label: 'Logo folder path', type: 'text' },
  { key: 'MS365_JOB_ATTACHMENT_PATH', label: 'Job attachment path', type: 'text' },
];

const ALL_FIELDS: FieldConfig[] = [
  ...APP_REGISTRATION_FIELDS,
  ...MAIL_FIELDS,
  ...SHAREPOINT_FIELDS,
];

const MASK_SKIP = '********';

const DEFAULT_DELIVERY = 'primary';

export default function MS365SettingsForm() {
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((state) => state.settings);

  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    const merged = { ...settings };
    for (const field of ALL_FIELDS) {
      if (field.type === 'select' && (merged[field.key] === undefined || merged[field.key] === '')) {
        merged[field.key] = DEFAULT_DELIVERY;
      }
    }
    setForm(merged);
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
        if (field.type === 'select') {
          payload[field.key] = val || DEFAULT_DELIVERY;
          continue;
        }
        payload[field.key] = val;
      }

      dispatch(saveSettings(payload));
      setSaved(true);
    },
    [dispatch, form],
  );

  const renderField = (field: FieldConfig) => {
    if (field.type === 'select') {
      return (
        <TextField
          key={field.key}
          select
          label={field.label}
          fullWidth
          value={form[field.key] ?? DEFAULT_DELIVERY}
          onChange={(e) => handleChange(field.key, e.target.value)}
          helperText={field.helperText}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        >
          {field.options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    return (
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
    );
  };

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
            {APP_REGISTRATION_FIELDS.map(renderField)}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Email (Microsoft Graph)
          </Typography>
          <Stack spacing={2.5}>{MAIL_FIELDS.map(renderField)}</Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            SharePoint (file uploads)
          </Typography>
          <Stack spacing={2.5}>{SHAREPOINT_FIELDS.map(renderField)}</Stack>

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
