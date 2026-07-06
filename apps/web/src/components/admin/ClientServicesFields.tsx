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
import { CLIENT_SERVICE_OTHER_VALUE } from '@weir-here/shared';

export type ClientServiceRow = {
  id: string;
  selection: string;
  customValue: string;
};

export function servicesToRows(services: string[], options: string[]): ClientServiceRow[] {
  if (services.length === 0) return [];
  return services.map((name) => {
    const match = options.find((o) => o.toLowerCase() === name.toLowerCase());
    if (match) {
      return { id: crypto.randomUUID(), selection: match, customValue: '' };
    }
    return { id: crypto.randomUUID(), selection: CLIENT_SERVICE_OTHER_VALUE, customValue: name };
  });
}

export function rowsToServices(rows: ClientServiceRow[]): string[] {
  const values: string[] = [];
  for (const row of rows) {
    const value =
      row.selection === CLIENT_SERVICE_OTHER_VALUE
        ? row.customValue.trim()
        : row.selection.trim();
    if (value) values.push(value);
  }
  return [...new Set(values)];
}

type ClientServicesFieldsProps = {
  rows: ClientServiceRow[];
  options: string[];
  onChange: (rows: ClientServiceRow[]) => void;
};

export default function ClientServicesFields({ rows, options, onChange }: ClientServicesFieldsProps) {
  const updateRow = (id: string, patch: Partial<ClientServiceRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  const addRow = () => {
    onChange([
      ...rows,
      { id: crypto.randomUUID(), selection: options[0] ?? CLIENT_SERVICE_OTHER_VALUE, customValue: '' },
    ]);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Services (optional)
      </Typography>
      {rows.map((row) => (
        <Box key={row.id} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
          <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel>Service</InputLabel>
            <Select
              label="Service"
              value={row.selection}
              onChange={(e) => updateRow(row.id, { selection: e.target.value })}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
              <MenuItem value={CLIENT_SERVICE_OTHER_VALUE}>Other</MenuItem>
            </Select>
          </FormControl>
          {row.selection === CLIENT_SERVICE_OTHER_VALUE && (
            <TextField
              size="small"
              label="Custom service"
              value={row.customValue}
              onChange={(e) => updateRow(row.id, { customValue: e.target.value })}
              sx={{ flex: 1 }}
            />
          )}
          <IconButton color="error" onClick={() => removeRow(row.id)} aria-label="Remove service">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={addRow}>
        Add service
      </Button>
    </Box>
  );
}
