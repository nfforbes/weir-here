'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const INDUSTRIES = [
  'Technology & IT',
  'Finance & Banking',
  'Healthcare',
  'Engineering',
  'Manufacturing',
  'Retail & Hospitality',
  'Mining & Resources',
  'Logistics & Supply Chain',
  'Education',
  'Government & Public Sector',
  'Other',
];

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

interface Location {
  address: string;
  city: string;
  province: string;
  country: string;
  remote: boolean;
}

export default function RegisterCompanyClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [brandInfo, setBrandInfo] = useState('');
  const [remotePolicy, setRemotePolicy] = useState('');
  const [locations, setLocations] = useState<Location[]>([
    { address: '', city: '', province: '', country: '', remote: false },
  ]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactHidden, setContactHidden] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const addLocation = () =>
    setLocations([...locations, { address: '', city: '', province: '', country: '', remote: false }]);

  const removeLocation = (i: number) => setLocations(locations.filter((_, idx) => idx !== i));

  const updateLocation = (i: number, field: keyof Location, value: string | boolean) => {
    const copy = [...locations];
    copy[i] = { ...copy[i], [field]: value };
    setLocations(copy);
  };

  const handleSubmit = async () => {
    if (!name || !industry || !size || !contactName || !contactEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let logoUrl = '';
      if (logoFile) {
        const fd = new FormData();
        fd.append('file', logoFile);
        fd.append('target', 'logo');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          logoUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          website,
          industry,
          size,
          logoUrl,
          brandInfo,
          remotePolicy,
          locations,
          contactPerson: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            hiddenFromPublic: contactHidden,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register company');
      }

      router.push('/dashboard/talent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Register a Company
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Company Name *" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} fullWidth />
          <TextField label="Industry *" select value={industry} onChange={(e) => setIndustry(e.target.value)} fullWidth>
            {INDUSTRIES.map((i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Company Size *" select value={size} onChange={(e) => setSize(e.target.value)} fullWidth>
            {SIZES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Brand Info" multiline rows={2} value={brandInfo} onChange={(e) => setBrandInfo(e.target.value)} fullWidth />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Company Logo
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
          </Box>

          <TextField label="Remote Policy" value={remotePolicy} onChange={(e) => setRemotePolicy(e.target.value)} fullWidth placeholder="e.g. Fully remote, Hybrid, On-site" />

          <Divider />

          <Typography variant="h6">Locations</Typography>
          {locations.map((loc, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField label="Address" size="small" value={loc.address} onChange={(e) => updateLocation(i, 'address', e.target.value)} sx={{ flex: '1 1 200px' }} />
                <TextField label="City" size="small" value={loc.city} onChange={(e) => updateLocation(i, 'city', e.target.value)} sx={{ flex: '1 1 120px' }} />
                <TextField label="Province" size="small" value={loc.province} onChange={(e) => updateLocation(i, 'province', e.target.value)} sx={{ flex: '1 1 120px' }} />
                <TextField label="Country" size="small" value={loc.country} onChange={(e) => updateLocation(i, 'country', e.target.value)} sx={{ flex: '1 1 120px' }} />
                <FormControlLabel control={<Switch checked={loc.remote} onChange={(e) => updateLocation(i, 'remote', e.target.checked)} />} label="Remote" />
                {locations.length > 1 && (
                  <IconButton onClick={() => removeLocation(i)} size="small">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Paper>
          ))}
          <Button startIcon={<AddIcon />} onClick={addLocation} size="small">
            Add Location
          </Button>

          <Divider />

          <Typography variant="h6">Contact Person</Typography>
          <TextField label="Contact Name *" value={contactName} onChange={(e) => setContactName(e.target.value)} fullWidth />
          <TextField label="Contact Email *" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} fullWidth />
          <TextField label="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} fullWidth />
          <FormControlLabel
            control={<Switch checked={contactHidden} onChange={(e) => setContactHidden(e.target.checked)} />}
            label="Hide contact from public"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button variant="contained" size="large" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Registering...' : 'Register Company'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
