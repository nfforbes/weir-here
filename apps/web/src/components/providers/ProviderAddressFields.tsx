'use client';

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { JAMAICA_PARISHES, type ProviderAddressDetails } from '@weir-here/shared';

interface ProviderAddressFieldsProps {
  value: ProviderAddressDetails;
  onChange: (value: ProviderAddressDetails) => void;
  disabled?: boolean;
}

export default function ProviderAddressFields({
  value,
  onChange,
  disabled = false,
}: ProviderAddressFieldsProps) {
  const setField = (field: keyof ProviderAddressDetails, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street address line 1"
          value={value.streetLine1}
          disabled={disabled}
          onChange={(e) => setField('streetLine1', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street address line 2"
          value={value.streetLine2}
          disabled={disabled}
          onChange={(e) => setField('streetLine2', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City / Town"
          value={value.city}
          disabled={disabled}
          onChange={(e) => setField('city', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel id="provider-parish-label">Parish</InputLabel>
          <Select
            labelId="provider-parish-label"
            label="Parish"
            value={value.parish}
            onChange={(e) => setField('parish', e.target.value)}
          >
            <MenuItem value="">
              <em>Select parish</em>
            </MenuItem>
            {JAMAICA_PARISHES.map((parish) => (
              <MenuItem key={parish} value={parish}>
                {parish}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Postal code"
          value={value.postalCode}
          disabled={disabled}
          onChange={(e) => setField('postalCode', e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
