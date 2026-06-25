'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import {
  hydrateProviderAddressDetails,
  normalizePreferredParishes,
  type ProviderAddressDetails,
} from '@weir-here/shared';
import ProviderAddressFields from '@/components/providers/ProviderAddressFields';
import PreferredParishesField from '@/components/providers/PreferredParishesField';
import { ELECTRIC_BLUE } from '@/theme/theme';

interface PhoneNumber {
  number: string;
  isBest: boolean;
}

interface ProviderProfile {
  _id: string;
  name: string;
  email: string;
  address: string;
  addressDetails: ProviderAddressDetails;
  preferredParishes: string[];
  phoneNumbers: PhoneNumber[];
}

export default function ProviderProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<ProviderProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/provider/profile');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile');
        setForm({
          ...data,
          addressDetails: hydrateProviderAddressDetails(data.addressDetails, data.address),
          preferredParishes: data.preferredParishes ?? [],
          phoneNumbers: data.phoneNumbers ?? [],
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const normalizedPreferredParishes = useMemo(
    () => normalizePreferredParishes(form?.addressDetails.parish, form?.preferredParishes),
    [form?.addressDetails.parish, form?.preferredParishes],
  );

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          addressDetails: form.addressDetails,
          preferredParishes: normalizedPreferredParishes,
          phoneNumbers: form.phoneNumbers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setForm({
        ...data,
        addressDetails: hydrateProviderAddressDetails(data.addressDetails, data.address),
        preferredParishes: data.preferredParishes ?? [],
        phoneNumbers: data.phoneNumbers ?? [],
      });
      setSuccess('Your profile has been updated.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return <Alert severity="error">{error || 'Unable to load your provider profile.'}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <PersonIcon sx={{ color: ELECTRIC_BLUE, fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700}>
          My Profile
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" value={form.email} disabled />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Address
            </Typography>
            <ProviderAddressFields
              value={form.addressDetails}
              onChange={(addressDetails) =>
                setForm((f) =>
                  f
                    ? {
                        ...f,
                        addressDetails,
                        preferredParishes: normalizePreferredParishes(
                          addressDetails.parish,
                          f.preferredParishes,
                        ),
                      }
                    : f,
                )
              }
            />
          </Grid>

          <Grid item xs={12}>
            <PreferredParishesField
              homeParish={form.addressDetails.parish}
              value={normalizedPreferredParishes}
              onChange={(preferredParishes) =>
                setForm((f) => (f ? { ...f, preferredParishes } : f))
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Phone Numbers
            </Typography>
            {form.phoneNumbers.map((phone, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  label="Phone Number"
                  value={phone.number}
                  onChange={(e) => {
                    const next = [...form.phoneNumbers];
                    next[index] = { ...next[index], number: e.target.value };
                    setForm((f) => (f ? { ...f, phoneNumbers: next } : f));
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={phone.isBest}
                      onChange={() => {
                        const next = form.phoneNumbers.map((p, i) => ({ ...p, isBest: i === index }));
                        setForm((f) => (f ? { ...f, phoneNumbers: next } : f));
                      }}
                    />
                  }
                  label="Best Number"
                />
                <IconButton
                  color="error"
                  onClick={() => {
                    const next = form.phoneNumbers.filter((_, i) => i !== index);
                    if (phone.isBest && next.length > 0) next[0].isBest = true;
                    setForm((f) => (f ? { ...f, phoneNumbers: next } : f));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setForm((f) =>
                  f
                    ? {
                        ...f,
                        phoneNumbers: [
                          ...f.phoneNumbers,
                          { number: '', isBest: f.phoneNumbers.length === 0 },
                        ],
                      }
                    : f,
                )
              }
            >
              Add Phone
            </Button>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
