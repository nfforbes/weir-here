'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ELECTRIC_BLUE } from '@/theme/theme';

interface Qualification {
  _id: string;
  fileName: string;
  driveWebViewLink: string;
  uploadedAt: string;
}

interface Client {
  _id: string;
  name: string;
  address: string;
  qualifications: Qualification[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditing(client);
      setForm({ name: client.name, address: client.address });
    } else {
      setEditing(null);
      setForm({ name: '', address: '' });
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
    if (!confirm('Delete this client and all their qualifications?')) return;
    try {
      await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
      await fetchClients();
    } catch {
      setError('Delete failed');
    }
  };

  const handleUploadClick = (clientId: string) => {
    setUploadingFor(clientId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;

    setUploadProgress(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', uploadingFor);

    try {
      const res = await fetch('/api/admin/qualifications', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      setSuccess(`"${file.name}" uploaded to Google Drive successfully`);
      await fetchClients();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadProgress(false);
      setUploadingFor(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteQual = async (id: string) => {
    if (!confirm('Remove this qualification?')) return;
    try {
      await fetch(`/api/admin/qualifications?id=${id}`, { method: 'DELETE' });
      await fetchClients();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <Box>
      <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} accept="*/*" />

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
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {uploadProgress && <LinearProgress sx={{ mb: 2 }} />}

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
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Qualifications</TableCell>
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
              {clients.map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={c.name.charAt(0).toUpperCase()} size="small" sx={{ bgcolor: ELECTRIC_BLUE, color: 'white', fontWeight: 700 }} />
                      <Typography fontWeight={600}>{c.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{c.address}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {c.qualifications.length === 0 && (
                        <Typography variant="caption" color="text.disabled">None</Typography>
                      )}
                      {c.qualifications.map((q) => (
                        <Box key={q._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={q.fileName}
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
                        onClick={() => handleUploadClick(c._id)}
                        sx={{ mt: 0.5, width: 'fit-content' }}
                        disabled={uploadProgress}
                      >
                        Upload
                      </Button>
                    </Box>
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
        </Paper>
      )}

    </Box>
  );
}
