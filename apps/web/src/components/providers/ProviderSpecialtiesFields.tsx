'use client';

import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PROVIDER_SPECIALTY_OTHER_VALUE } from '@weir-here/shared';

export type ProviderSpecialtyRow = {
  id: string;
  selection: string;
  customValue: string;
};

export function specialtiesToRows(specialties: string[], options: string[]): ProviderSpecialtyRow[] {
  if (specialties.length === 0) return [];
  return specialties.map((name) => {
    const match = options.find((o) => o.toLowerCase() === name.toLowerCase());
    if (match) {
      return { id: crypto.randomUUID(), selection: match, customValue: '' };
    }
    return { id: crypto.randomUUID(), selection: PROVIDER_SPECIALTY_OTHER_VALUE, customValue: name };
  });
}

export function rowsToSpecialties(rows: ProviderSpecialtyRow[]): string[] {
  const values: string[] = [];
  for (const row of rows) {
    const value =
      row.selection === PROVIDER_SPECIALTY_OTHER_VALUE
        ? row.customValue.trim()
        : row.selection.trim();
    if (value) values.push(value);
  }
  return [...new Set(values)];
}

type ProviderSpecialtiesFieldsProps = {
  rows: ProviderSpecialtyRow[];
  options: string[];
  onChange: (rows: ProviderSpecialtyRow[]) => void;
  disabled?: boolean;
};

export default function ProviderSpecialtiesFields({
  rows,
  options,
  onChange,
  disabled = false,
}: ProviderSpecialtiesFieldsProps) {
  const updateRow = (id: string, patch: Partial<ProviderSpecialtyRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  const addRow = () => {
    onChange([
      ...rows,
      {
        id: crypto.randomUUID(),
        selection: options[0] ?? PROVIDER_SPECIALTY_OTHER_VALUE,
        customValue: '',
      },
    ]);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Specialties (optional)
      </Typography>
      {rows.map((row) => (
        <Box key={row.id} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
          <FormControl size="small" sx={{ minWidth: 200, flex: 1 }} disabled={disabled}>
            <InputLabel>Specialty</InputLabel>
            <Select
              label="Specialty"
              value={row.selection}
              onChange={(e) => updateRow(row.id, { selection: e.target.value })}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
              <MenuItem value={PROVIDER_SPECIALTY_OTHER_VALUE}>Other</MenuItem>
            </Select>
          </FormControl>
          {row.selection === PROVIDER_SPECIALTY_OTHER_VALUE && (
            <TextField
              size="small"
              label="Custom specialty"
              value={row.customValue}
              onChange={(e) => updateRow(row.id, { customValue: e.target.value })}
              sx={{ flex: 1 }}
              disabled={disabled}
            />
          )}
          <IconButton
            color="error"
            onClick={() => removeRow(row.id)}
            aria-label="Remove specialty"
            disabled={disabled}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={addRow} disabled={disabled}>
        Add specialty
      </Button>
    </Box>
  );
}
