'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ELECTRIC_BLUE, DEEP_NAVY } from '@/theme/theme';

interface Provider { _id: string; name: string; }
interface ReportRow {
  client: string;
  provider: string;
  serviceDate: string;
  description: string;
  chargeAmount: number;
  providerPay: number;
  invoiced: boolean;
}

export default function ReportsPage() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [providerId, setProviderId] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/providers').then((r) => r.json()).then(setProviders).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ month });
      if (providerId) params.set('providerId', providerId);
      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(data.rows);
      setTotal(data.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [month, providerId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ month, format: 'excel' });
      if (providerId) params.set('providerId', providerId);
      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${month}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Group rows by client
  const grouped = rows.reduce<Record<string, ReportRow[]>>((acc, row) => {
    if (!acc[row.client]) acc[row.client] = [];
    acc[row.client].push(row);
    return acc;
  }, {});

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <BarChartIcon sx={{ color: ELECTRIC_BLUE, fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700}>Monthly Reports</Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterListIcon sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle1" fontWeight={600}>Filters</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
          <TextField
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Provider (optional)</InputLabel>
            <Select
              value={providerId}
              label="Provider (optional)"
              onChange={(e) => setProviderId(e.target.value)}
            >
              <MenuItem value="">All Providers</MenuItem>
              {providers.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={exporting || rows.length === 0}
            sx={{ height: 56, minWidth: 160 }}
          >
            {exporting ? 'Exporting…' : 'Export Excel'}
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Summary banner */}
      {rows.length > 0 && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${DEEP_NAVY} 0%, #1a3a5c 100%)`,
            borderRadius: 2,
            p: 2.5,
            mb: 3,
            display: 'flex',
            gap: 4,
            color: 'white',
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Total Billed</Typography>
            <Typography variant="h5" fontWeight={700}>${total.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Clients</Typography>
            <Typography variant="h5" fontWeight={700}>{Object.keys(grouped).length}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Assignments</Typography>
            <Typography variant="h5" fontWeight={700}>{rows.length}</Typography>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No data found for {month}{providerId ? ' with the selected provider' : ''}.</Typography>
        </Paper>
      ) : (
        Object.entries(grouped).map(([clientName, clientRows]) => {
          const clientTotal = clientRows.reduce((s, r) => s + r.chargeAmount, 0);
          return (
            <Paper key={clientName} sx={{ mb: 3, overflow: 'hidden' }}>
              {/* Client header */}
              <Box sx={{ px: 3, py: 2, bgcolor: '#f0f4ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight={700}>{clientName}</Typography>
                <Chip label={`Total: $${clientTotal.toFixed(2)}`} sx={{ bgcolor: ELECTRIC_BLUE, color: 'white', fontWeight: 700 }} />
              </Box>
              <Divider />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 600, color: 'text.secondary', fontSize: 12 } }}>
                    <TableCell>Provider</TableCell>
                    <TableCell>Service Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Client Charge</TableCell>
                    <TableCell>Provider Pay</TableCell>
                    <TableCell>Invoiced</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientRows.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{row.provider}</TableCell>
                      <TableCell>{row.serviceDate}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>{row.description || '—'}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>${row.chargeAmount.toFixed(2)}</TableCell>
                      <TableCell sx={{ color: 'warning.dark' }}>${row.providerPay.toFixed(2)}</TableCell>
                      <TableCell>
                        {row.invoiced
                          ? <Chip label="Yes" size="small" color="success" variant="outlined" />
                          : <Chip label="No" size="small" variant="outlined" />
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          );
        })
      )}
    </Box>
  );
}
