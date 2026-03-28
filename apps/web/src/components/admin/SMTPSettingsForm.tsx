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
    FormControlLabel,
    Checkbox,
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
    type: 'text' | 'password' | 'number' | 'checkbox';
}

const FIELDS: FieldConfig[] = [
    { key: 'SMTP_HOST', label: 'SMTP Host', type: 'text' },
    { key: 'SMTP_PORT', label: 'SMTP Port', type: 'number' },
    { key: 'SMTP_USER', label: 'SMTP Username', type: 'text' },
    { key: 'SMTP_PASS', label: 'SMTP Password', type: 'password' },
    { key: 'SMTP_SECURE', label: 'Secure (SSL/TLS)', type: 'checkbox' },
    { key: 'SMTP_FROM', label: 'From Email', type: 'text' },
    { key: 'SMTP_CIPHERS', label: 'Ciphers (Optional)', type: 'text' },
];

export default function SMTPSettingsForm() {
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
                if (field.type === 'password' && val === '********') continue;
                payload[field.key] = val;
            }

            dispatch(saveSettings(payload));
            setSaved(true);
        },
        [dispatch, form],
    );

    return (
        <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                SMTP Configuration
            </Typography>

            {saved && !error && !loading && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    SMTP settings saved successfully.
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
                    <Stack spacing={2.5}>
                        {FIELDS.map((field) => (
                            field.type === 'checkbox' ? (
                                <FormControlLabel
                                    key={field.key}
                                    control={
                                        <Checkbox
                                            checked={form[field.key] === 'true'}
                                            onChange={(e) => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                                        />
                                    }
                                    label={field.label}
                                />
                            ) : (
                                <TextField
                                    key={field.key}
                                    label={field.label}
                                    type={field.type === 'password' ? 'password' : 'text'}
                                    fullWidth
                                    value={form[field.key] ?? ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    placeholder={field.type === 'password' ? '••••••••' : ''}
                                    slotProps={{
                                        inputLabel: { shrink: true },
                                    }}
                                />
                            )
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
                        {loading ? 'Saving…' : 'Save SMTP Settings'}
                    </Button>
                </Box>
            )}
        </Paper>
    );
}
