'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  LinearProgress,
  Grid,
  Radio,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ELECTRIC_BLUE } from '@/theme/theme';
import { filterClients, paginateList } from '@/lib/adminListHelpers';

interface Client {
  _id: string;
  name: string;
  address: string;
  phoneNumbers?: { number: string; isBest: boolean }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<{ name: string; address: string; phoneNumbers: { number: string; isBest: boolean }[] }>({ name: '', address: '', phoneNumbers: [] });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      setClients(data);
    } catch {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => { setPage(0); }, [search]);

  const filteredClients = useMemo(() => filterClients(clients, search), [clients, search]);
  const paginatedClients = useMemo(
    () => paginateList(filteredClients, page, rowsPerPage),
    [filteredClients, page, rowsPerPage],
  );

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditing(client);
      setForm({ name: client.name, address: client.address, phoneNumbers: client.phoneNumbers || [] });
    } else {
      setEditing(null);
      setForm({ name: '', address: '', phoneNumbers: [] });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editing ? { id: editing._id } : {}), ...form }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchClients();
      setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    try {
      await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
      await fetchClients();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GroupIcon sx={{ color: ELECTRIC_BLUE, fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>Clients</Typography>
        </Box>
        {!open && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Client
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : open ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" mb={3}>{editing ? 'Edit Client' : 'New Client'}</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                fullWidth
                label="Name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address *"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Phone Numbers</Typography>
              {form.phoneNumbers.map((phone, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="Phone Number"
                    value={phone.number}
                    onChange={(e) => {
                      const newPhones = [...form.phoneNumbers];
                      newPhones[index].number = e.target.value;
                      setForm((f) => ({ ...f, phoneNumbers: newPhones }));
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Radio
                        checked={phone.isBest}
                        onChange={() => {
                          const newPhones = form.phoneNumbers.map((p, i) => ({ ...p, isBest: i === index }));
                          setForm((f) => ({ ...f, phoneNumbers: newPhones }));
                        }}
                      />
                    }
                    label="Best Number"
                  />
                  <IconButton color="error" onClick={() => {
                    const newPhones = form.phoneNumbers.filter((_, i) => i !== index);
                    if (phone.isBest && newPhones.length > 0) {
                      newPhones[0].isBest = true;
                    }
                    setForm((f) => ({ ...f, phoneNumbers: newPhones }));
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => {
                setForm(f => ({ ...f, phoneNumbers: [...f.phoneNumbers, { number: '', isBest: f.phoneNumbers.length === 0 }] }));
              }}>
                Add Phone
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim() || !form.address.trim()}>
                {saving ? <CircularProgress size={20} /> : editing ? 'Save Changes' : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              size="small"
              fullWidth
              label="Search name, address, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No clients yet. Click &quot;Add Client&quot; to get started.
                  </TableCell>
                </TableRow>
              )}
              {clients.length > 0 && filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No clients match your search.
                  </TableCell>
                </TableRow>
              )}
              {paginatedClients.map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={c.name.charAt(0).toUpperCase()} size="small" sx={{ bgcolor: ELECTRIC_BLUE, color: 'white', fontWeight: 700 }} />
                      <Typography fontWeight={600}>{c.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {c.phoneNumbers?.map((p, i) => (
                        <Typography key={i} variant="body2" sx={{ fontWeight: p.isBest ? 600 : 400, color: p.isBest ? 'text.primary' : 'text.secondary' }}>
                          {p.number} {p.isBest && <Chip label="Best" size="small" sx={{ height: 16, fontSize: '0.65rem', ml: 1 }} />}
                        </Typography>
                      ))}
                      {(!c.phoneNumbers || c.phoneNumbers.length === 0) && <Typography variant="body2" color="text.disabled">—</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{c.address}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpen(c)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(c._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClients.length > 0 && (
            <TablePagination
              component="div"
              count={filteredClients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              rowsPerPageOptions={[25]}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={() => {}}
            />
          )}
        </Paper>
      )}

    </Box>
  );
}
