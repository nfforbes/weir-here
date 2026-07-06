'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {
  CLIENT_SERVICE_OPTIONS_KEY,
  parseClientServiceOptions,
  serializeClientServiceOptions,
} from '@weir-here/shared';

export default function ClientServiceOptionsForm() {
  const [options, setOptions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load settings');
      setOptions(parseClientServiceOptions(data.settings?.[CLIENT_SERVICE_OPTIONS_KEY]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load client services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addOption = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (options.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
      setError('That service is already in the list.');
      return;
    }
    setOptions((prev) => [...prev, trimmed].sort((a, b) => a.localeCompare(b)));
    setInput('');
    setError('');
  };

  const removeOption = (value: string) => {
    setOptions((prev) => prev.filter((o) => o !== value));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            [CLIENT_SERVICE_OPTIONS_KEY]: serializeClientServiceOptions(options),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccess('Client services saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Client Services
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add the services that appear in the client form dropdown. Choose &quot;Other&quot; on a client to enter a custom service.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSave}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Service name"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addOption} sx={{ whiteSpace: 'nowrap' }}>
              Add
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3, minHeight: 32 }}>
            {options.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No services configured yet.
              </Typography>
            )}
            {options.map((option) => (
              <Chip
                key={option}
                label={option}
                onDelete={() => removeOption(option)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save client services'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
