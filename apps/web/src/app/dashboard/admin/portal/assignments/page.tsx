'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  InputAdornment,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ELECTRIC_BLUE } from '@/theme/theme';

interface Provider { _id: string; name: string; }
interface Client { _id: string; name: string; }
interface Assignment {
  _id: string;
  clientId: { _id: string; name: string; address: string };
  providerId: { _id: string; name: string };
  clientChargeCents: number;
  providerPayCents: number;
  description: string;
  serviceDate: string;
  invoiced: boolean;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientId: '',
    providerId: '',
    clientCharge: '',
    providerHourlyRate: '',
    providerPay: '',
    description: '',
    serviceDate: new Date().toISOString().split('T')[0],
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, pRes, cRes] = await Promise.all([
        fetch('/api/admin/assignments'),
        fetch('/api/admin/providers'),
        fetch('/api/admin/clients'),
      ]);
      setAssignments(await aRes.json());
      setProviders(await pRes.json());
      setClients(await cRes.json());
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    if (!form.clientId || !form.providerId || !form.clientCharge) return;
    setSaving(true);
    try {
        const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          providerId: form.providerId,
          clientChargeCents: Math.round(parseFloat(form.clientCharge) * 100),
          providerHourlyRateCents: Math.round(parseFloat(form.providerHourlyRate || '0') * 100),
          providerPayCents: form.providerPay ? Math.round(parseFloat(form.providerPay) * 100) : 0,
          description: form.description,
          serviceDate: form.serviceDate,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
      setOpen(false);
      setForm({ clientId: '', providerId: '', clientCharge: '', providerHourlyRate: '', providerPay: '', description: '', serviceDate: new Date().toISOString().split('T')[0] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await fetch(`/api/admin/assignments?id=${id}`, { method: 'DELETE' });
      await fetchAll();
    } catch {
      setError('Delete failed');
    }
  };

  const handleInvoice = async (id: string) => {
    setGeneratingInvoice(id);
    try {
      const res = await fetch(`/api/admin/invoices/${id}?format=pdf`);
      if (!res.ok) throw new Error('Invoice generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id.slice(-6)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      await fetchAll(); // refresh invoiced status
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invoice failed');
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIcon sx={{ color: ELECTRIC_BLUE, fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>Assignments</Typography>
        </Box>
        {!open && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            New Assignment
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : open ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" mb={3}>New Assignment</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Client *</InputLabel>
                <Select value={form.clientId} label="Client *" onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}>
                  {clients.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Provider *</InputLabel>
                <Select value={form.providerId} label="Provider *" onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}>
                  {providers.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Date *"
                type="date"
                value={form.serviceDate}
                onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Charge to Client *"
                type="number"
                value={form.clientCharge}
                onChange={(e) => setForm((f) => ({ ...f, clientCharge: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provider Hourly Rate *"
                type="number"
                value={form.providerHourlyRate}
                onChange={(e) => setForm((f) => ({ ...f, providerHourlyRate: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pay to Provider"
                type="number"
                value={form.providerPay}
                onChange={(e) => setForm((f) => ({ ...f, providerPay: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !form.clientId || !form.providerId || !form.clientCharge}
              >
                {saving ? <CircularProgress size={20} /> : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
                <TableCell>Client</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Service Date</TableCell>
                <TableCell>Client Charge</TableCell>
                <TableCell>Provider Pay</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No assignments yet.
                  </TableCell>
                </TableRow>
              )}
              {assignments.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell><Typography fontWeight={600}>{a.clientId?.name ?? '—'}</Typography></TableCell>
                  <TableCell>{a.providerId?.name ?? '—'}</TableCell>
                  <TableCell>{new Date(a.serviceDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{fmt(a.clientChargeCents)}</TableCell>
                  <TableCell sx={{ color: 'warning.dark', fontWeight: 600 }}>{fmt(a.providerPayCents)}</TableCell>
                  <TableCell sx={{ maxWidth: 180 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>{a.description || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    {a.invoiced
                      ? <Chip icon={<CheckCircleIcon />} label="Invoiced" size="small" color="success" variant="outlined" />
                      : <Chip label="Pending" size="small" variant="outlined" />
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download Invoice PDF">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleInvoice(a._id)}
                        disabled={generatingInvoice === a._id}
                      >
                        {generatingInvoice === a._id ? <CircularProgress size={16} /> : <ReceiptIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(a._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
