'use client';

import { useMemo } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { JAMAICA_PARISHES } from '@weir-here/shared';

interface PreferredParishesFieldProps {
  homeParish: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function PreferredParishesField({
  homeParish,
  value,
  onChange,
  disabled = false,
}: PreferredParishesFieldProps) {
  const availableToAdd = useMemo(
    () => JAMAICA_PARISHES.filter((parish) => !value.includes(parish)),
    [value],
  );

  const addParish = (parish: string) => {
    if (!parish || value.includes(parish)) return;
    onChange([...value, parish]);
  };

  const removeParish = (parish: string) => {
    if (parish === homeParish.trim()) return;
    onChange(value.filter((item) => item !== parish));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Preferred parishes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Your home parish from your address is included automatically. Add other parishes where you
        are willing to work.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {value.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            Select your address parish to include your home parish.
          </Typography>
        )}
        {value.map((parish) => {
          const isHome = parish === homeParish.trim();
          return (
            <Chip
              key={parish}
              label={isHome ? `${parish} (home)` : parish}
              onDelete={isHome || disabled ? undefined : () => removeParish(parish)}
              color={isHome ? 'primary' : 'default'}
              variant={isHome ? 'filled' : 'outlined'}
            />
          );
        })}
      </Box>

      <FormControl fullWidth disabled={disabled || availableToAdd.length === 0}>
        <InputLabel id="preferred-parish-add-label">Add preferred parish</InputLabel>
        <Select
          labelId="preferred-parish-add-label"
          label="Add preferred parish"
          value=""
          onChange={(e) => addParish(e.target.value)}
        >
          {availableToAdd.map((parish) => (
            <MenuItem key={parish} value={parish}>
              {parish}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
