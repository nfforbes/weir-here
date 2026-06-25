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
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ELECTRIC_BLUE } from '@/theme/theme';
import { filterProviders, paginateList } from '@/lib/adminListHelpers';
import {
  EMPTY_PROVIDER_ADDRESS,
  formatProviderAddress,
  hydrateProviderAddressDetails,
  normalizePreferredParishes,
  type ProviderAddressDetails,
} from '@weir-here/shared';
import ProviderAddressFields from '@/components/providers/ProviderAddressFields';
import PreferredParishesField from '@/components/providers/PreferredParishesField';

interface Qualification {
  _id: string;
  fileName: string;
  description?: string;
  driveWebViewLink: string;
  uploadedAt: string;
}

interface Provider {
  _id: string;
  name: string;
  email?: string;
  address: string;
  addressDetails?: ProviderAddressDetails;
  preferredParishes?: string[];
  phoneNumbers?: { number: string; isBest: boolean }[];
  qualifications: Qualification[];
}

type ProviderFormState = {
  name: string;
  email: string;
  addressDetails: ProviderAddressDetails;
  preferredParishes: string[];
  phoneNumbers: { number: string; isBest: boolean }[];
};

const emptyForm = (): ProviderFormState => ({
  name: '',
  email: '',
  addressDetails: { ...EMPTY_PROVIDER_ADDRESS },
  preferredParishes: [],
  phoneNumbers: [],
});

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState<ProviderFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [gridUploadState, setGridUploadState] = useState<{ providerId: string; file: File | null; description: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [stagedQualifications, setStagedQualifications] = useState<{ file: File | null; description: string }[]>([]);
  const [editingQualifications, setEditingQualifications] = useState<Qualification[]>([]);
  const [qualificationsToDelete, setQualificationsToDelete] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers');
      const data = await res.json();
      setProviders(data);
    } catch {
      setError('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  useEffect(() => { setPage(0); }, [search]);

  const filteredProviders = useMemo(() => filterProviders(providers, search), [providers, search]);
  const paginatedProviders = useMemo(
    () => paginateList(filteredProviders, page, rowsPerPage),
    [filteredProviders, page, rowsPerPage],
  );

  const handleOpen = (provider?: Provider) => {
    if (provider) {
      setEditing(provider);
      const addressDetails = hydrateProviderAddressDetails(
        provider.addressDetails,
        provider.address,
      );
      setForm({
        name: provider.name,
        email: provider.email || '',
        addressDetails,
        preferredParishes: normalizePreferredParishes(
          addressDetails.parish,
          provider.preferredParishes,
        ),
        phoneNumbers: provider.phoneNumbers || [],
      });
      setEditingQualifications([...provider.qualifications]);
    } else {
      setEditing(null);
      setForm(emptyForm());
      setEditingQualifications([]);
    }
    setStagedQualifications([]);
    setQualificationsToDelete([]);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editing ? { id: editing._id } : {}),
          name: form.name,
          email: form.email,
          addressDetails: form.addressDetails,
          preferredParishes: normalizePreferredParishes(
            form.addressDetails.parish,
            form.preferredParishes,
          ),
          phoneNumbers: form.phoneNumbers,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const savedProvider = await res.json();
      const providerId = editing ? editing._id : savedProvider._id;

      // Process edits to existing qualifications
      for (const eq of editingQualifications) {
        const original = editing?.qualifications.find((q) => q._id === eq._id);
        if (original && original.description !== eq.description) {
          const editRes = await fetch('/api/admin/qualifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: eq._id, description: eq.description }),
          });
          if (!editRes.ok) throw new Error(`Failed to update qualification: ${eq.fileName}`);
        }
      }

      // Process deletes of existing qualifications
      for (const id of qualificationsToDelete) {
        const delRes = await fetch(`/api/admin/qualifications?id=${id}`, { method: 'DELETE' });
        if (!delRes.ok) throw new Error(`Failed to delete qualification`);
      }

      for (const sq of stagedQualifications) {
        if (!sq.file) continue;
        const formData = new FormData();
        formData.append('file', sq.file);
        formData.append('providerId', providerId);
        if (sq.description) formData.append('description', sq.description);

        const uploadRes = await fetch('/api/admin/qualifications', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
           const errorData = await uploadRes.json().catch(() => ({}));
           throw new Error(`Failed to upload ${sq.file.name}: ${errorData.error || uploadRes.statusText}`);
        }
      }

      await fetchProviders();
      setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this provider and all their qualifications?')) return;
    try {
      await fetch(`/api/admin/providers?id=${id}`, { method: 'DELETE' });
      await fetchProviders();
    } catch {
      setError('Delete failed');
    }
  };

  const handleGridUploadClick = (providerId: string) => {
    setGridUploadState({ providerId, file: null, description: '' });
  };

  const handleGridUploadSubmit = async () => {
    if (!gridUploadState || !gridUploadState.file || !gridUploadState.description.trim()) return;

    setUploadProgress(true);
    setError('');
    const formData = new FormData();
    formData.append('file', gridUploadState.file);
    formData.append('providerId', gridUploadState.providerId);
    formData.append('description', gridUploadState.description.trim());

    try {
      const res = await fetch('/api/admin/qualifications', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      setSuccess(`"${gridUploadState.file.name}" uploaded successfully`);
      await fetchProviders();
      setGridUploadState(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteQual = async (id: string) => {
    if (!confirm('Remove this qualification?')) return;
    try {
      await fetch(`/api/admin/qualifications?id=${id}`, { method: 'DELETE' });
      await fetchProviders();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ color: ELECTRIC_BLUE, fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>Providers</Typography>
        </Box>
        {!open && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Provider
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {uploadProgress && <LinearProgress sx={{ mb: 2 }} />}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : open ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" mb={3}>{editing ? 'Edit Provider' : 'New Provider'}</Typography>
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
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Address
              </Typography>
              <ProviderAddressFields
                value={form.addressDetails}
                onChange={(addressDetails) =>
                  setForm((f) => ({
                    ...f,
                    addressDetails,
                    preferredParishes: normalizePreferredParishes(
                      addressDetails.parish,
                      f.preferredParishes,
                    ),
                  }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <PreferredParishesField
                homeParish={form.addressDetails.parish}
                value={normalizePreferredParishes(
                  form.addressDetails.parish,
                  form.preferredParishes,
                )}
                onChange={(preferredParishes) => setForm((f) => ({ ...f, preferredParishes }))}
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
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Qualifications</Typography>
              {editingQualifications.map((eq, i) => (
                <Box key={eq._id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Button variant="outlined" component="a" href={eq.driveWebViewLink} target="_blank" sx={{ minWidth: 120 }}>
                    View File
                  </Button>
                  <Typography variant="body2" sx={{ minWidth: 100, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eq.fileName}
                  </Typography>
                  <TextField 
                    size="small"
                    label="Description *" 
                    value={eq.description || ''}
                    onChange={(e) => {
                      const newEqs = [...editingQualifications];
                      newEqs[i].description = e.target.value;
                      setEditingQualifications(newEqs);
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton color="error" onClick={() => {
                      const newEqs = [...editingQualifications];
                      newEqs.splice(i, 1);
                      setEditingQualifications(newEqs);
                      setQualificationsToDelete([...qualificationsToDelete, eq._id]);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              {stagedQualifications.map((sq, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Button variant="outlined" component="label" sx={{ minWidth: 120 }}>
                    {sq.file ? 'Change File' : 'Select File'}
                    <input type="file" hidden onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      const newStaged = [...stagedQualifications];
                      newStaged[i].file = file;
                      setStagedQualifications(newStaged);
                    }} />
                  </Button>
                  <Typography variant="body2" sx={{ minWidth: 100, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sq.file ? sq.file.name : 'No file selected'}
                  </Typography>
                  <TextField 
                    size="small"
                    label="Description *" 
                    value={sq.description}
                    onChange={(e) => {
                      const newStaged = [...stagedQualifications];
                      newStaged[i].description = e.target.value;
                      setStagedQualifications(newStaged);
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton color="error" onClick={() => {
                      const newStaged = [...stagedQualifications];
                      newStaged.splice(i, 1);
                      setStagedQualifications(newStaged);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => setStagedQualifications([...stagedQualifications, { file: null, description: '' }])}>
                Add Qualification
              </Button>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSave} 
                disabled={saving || !form.name.trim() || !form.email.trim() || stagedQualifications.some(sq => sq.file && !sq.description.trim()) || editingQualifications.some(eq => !eq.description?.trim())}
              >
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
              label="Search name, email, address, phone, or qualification"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Preferred Parishes</TableCell>
                <TableCell>Qualifications</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No providers yet. Click &quot;Add Provider&quot; to get started.
                  </TableCell>
                </TableRow>
              )}
              {providers.length > 0 && filteredProviders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No providers match your search.
                  </TableCell>
                </TableRow>
              )}
              {paginatedProviders.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={p.name.charAt(0).toUpperCase()} size="small" sx={{ bgcolor: ELECTRIC_BLUE, color: 'white', fontWeight: 700 }} />
                      <Typography fontWeight={600}>{p.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {p.phoneNumbers?.map((ph, i) => (
                        <Typography key={i} variant="body2" sx={{ fontWeight: ph.isBest ? 600 : 400, color: ph.isBest ? 'text.primary' : 'text.secondary' }}>
                          {ph.number} {ph.isBest && <Chip label="Best" size="small" sx={{ height: 16, fontSize: '0.65rem', ml: 1 }} />}
                        </Typography>
                      ))}
                      {(!p.phoneNumbers || p.phoneNumbers.length === 0) && <Typography variant="body2" color="text.disabled">—</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {p.email ? (
                      <Typography variant="body2" color="text.secondary">{p.email}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatProviderAddress(p.addressDetails, p.address) || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 180 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(p.preferredParishes ?? []).length === 0 && (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                      {(p.preferredParishes ?? []).map((parish) => (
                        <Chip key={parish} label={parish} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {p.qualifications.length === 0 && (
                        <Typography variant="caption" color="text.disabled">None</Typography>
                      )}
                      {p.qualifications.map((q) => (
                        <Box key={q._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={q.description ? `${q.description} (${q.fileName})` : q.fileName}
                            size="small"
                            variant="outlined"
                            clickable
                            component="a"
                            href={q.driveWebViewLink}
                            target="_blank"
                            icon={<OpenInNewIcon style={{ fontSize: 12 }} />}
                            onDelete={() => handleDeleteQual(q._id)}
                          />
                        </Box>
                      ))}
                      <Button
                        size="small"
                        startIcon={<UploadFileIcon />}
                        onClick={() => handleGridUploadClick(p._id)}
                        sx={{ mt: 0.5, width: 'fit-content' }}
                        disabled={uploadProgress}
                      >
                        Upload
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpen(p)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProviders.length > 0 && (
            <TablePagination
              component="div"
              count={filteredProviders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              rowsPerPageOptions={[25]}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={() => {}}
            />
          )}
        </Paper>
      )}

      {gridUploadState && (
        <Dialog open={true} onClose={() => setGridUploadState(null)} fullWidth maxWidth="sm">
          <DialogTitle>Upload Qualification</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5 }}>
                {gridUploadState.file ? gridUploadState.file.name : 'Select File'}
                <input 
                  type="file" 
                  hidden 
                  accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setGridUploadState({ ...gridUploadState, file: e.target.files[0] });
                    }
                  }} />
              </Button>
              <TextField
                label="Description *"
                fullWidth
                value={gridUploadState.description}
                onChange={(e) => setGridUploadState({ ...gridUploadState, description: e.target.value })}
                placeholder="e.g. CPR Certification"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGridUploadState(null)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleGridUploadSubmit} 
              disabled={!gridUploadState.file || !gridUploadState.description.trim() || uploadProgress}
            >
              {uploadProgress ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
