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
import {
  EMPTY_ADDRESS_DETAILS,
  formatAddress,
  hydrateAddressDetails,
  type AddressDetails,
} from '@weir-here/shared';
import ProviderAddressFields from '@/components/providers/ProviderAddressFields';
import ClientServicesFields, {
  rowsToServices,
  servicesToRows,
  type ClientServiceRow,
} from '@/components/admin/ClientServicesFields';
import {
  CLIENT_SERVICE_OPTIONS_KEY,
  parseClientServiceOptions,
} from '@weir-here/shared';

interface Client {
  _id: string;
  name: string;
  email?: string;
  address: string;
  addressDetails?: AddressDetails;
  phoneNumbers?: { number: string; isBest: boolean }[];
  rate?: string;
  services?: string[];
  patientName?: string;
}

type ClientFormState = {
  name: string;
  email: string;
  addressDetails: AddressDetails;
  phoneNumbers: { number: string; isBest: boolean }[];
  rate: string;
  serviceRows: ClientServiceRow[];
  patientName: string;
};

const emptyForm = (): ClientFormState => ({
  name: '',
  email: '',
  addressDetails: { ...EMPTY_ADDRESS_DETAILS },
  phoneNumbers: [],
  rate: '',
  serviceRows: [],
  patientName: '',
});

const hasClientAddress = (form: ClientFormState) =>
  formatAddress(form.addressDetails).trim().length > 0;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const rowsPerPage = 25;

  const fetchServiceOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) {
        setServiceOptions(parseClientServiceOptions(data.settings?.[CLIENT_SERVICE_OPTIONS_KEY]));
      }
    } catch {
      setServiceOptions([]);
    }
  }, []);

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
  useEffect(() => { fetchServiceOptions(); }, [fetchServiceOptions]);

  useEffect(() => { setPage(0); }, [search]);

  const filteredClients = useMemo(() => filterClients(clients, search), [clients, search]);
  const paginatedClients = useMemo(
    () => paginateList(filteredClients, page, rowsPerPage),
    [filteredClients, page, rowsPerPage],
  );

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditing(client);
      setForm({
        name: client.name,
        email: client.email || '',
        addressDetails: hydrateAddressDetails(client.addressDetails, client.address),
        phoneNumbers: client.phoneNumbers || [],
        rate: client.rate || '',
        serviceRows: servicesToRows(client.services || [], serviceOptions),
        patientName: client.patientName || '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm());
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !hasClientAddress(form)) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editing ? { id: editing._id } : {}),
          name: form.name,
          email: form.email,
          addressDetails: form.addressDetails,
          phoneNumbers: form.phoneNumbers,
          rate: form.rate,
          services: rowsToServices(form.serviceRows),
          patientName: form.patientName,
        }),
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
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                fullWidth
                label="Name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rate (optional)"
                value={form.rate}
                onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                placeholder="e.g. $50/hr"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name (optional)"
                value={form.patientName}
                onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <ClientServicesFields
                rows={form.serviceRows}
                options={serviceOptions}
                onChange={(serviceRows) => setForm((f) => ({ ...f, serviceRows }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Address *
              </Typography>
              <ProviderAddressFields
                value={form.addressDetails}
                onChange={(addressDetails) => setForm((f) => ({ ...f, addressDetails }))}
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
              <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim() || !hasClientAddress(form)}>
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
              label="Search name, email, address, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No clients yet. Click &quot;Add Client&quot; to get started.
                  </TableCell>
                </TableRow>
              )}
              {clients.length > 0 && filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
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
                    {c.email ? (
                      <Typography variant="body2" color="text.secondary">{c.email}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {c.phoneNumbers?.map((p, i) => (
                        <Typography
                          key={i}
                          variant="body2"
                          component="div"
                          sx={{ fontWeight: p.isBest ? 600 : 400, color: p.isBest ? 'text.primary' : 'text.secondary' }}
                        >
                          {p.number} {p.isBest && <Chip label="Best" size="small" sx={{ height: 16, fontSize: '0.65rem', ml: 1 }} />}
                        </Typography>
                      ))}
                      {(!c.phoneNumbers || c.phoneNumbers.length === 0) && <Typography variant="body2" color="text.disabled">—</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatAddress(c.addressDetails, c.address)}
                    </Typography>
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
