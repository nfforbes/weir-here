'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface AdminTestimonialRow {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  context: string;
  avatarUrl: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  quote: '',
  authorName: '',
  authorTitle: '',
  context: '',
  avatarUrl: '',
  published: true,
  sortOrder: 0,
};

export default function AdminTestimonialsManager() {
  const [rows, setRows] = useState<AdminTestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTestimonialRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRows(
        (data.testimonials as AdminTestimonialRow[]).map((t) => ({
          ...t,
          createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
          updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : new Date(t.updatedAt).toISOString(),
        })),
      );
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Load failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: AdminTestimonialRow) => {
    setEditing(row);
    setForm({
      quote: row.quote,
      authorName: row.authorName,
      authorTitle: row.authorTitle,
      context: row.context,
      avatarUrl: row.avatarUrl,
      published: row.published,
      sortOrder: row.sortOrder,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const save = async () => {
    if (!form.quote.trim() || !form.authorName.trim()) {
      setSnack({ message: 'Quote and author name are required.', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/testimonials/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Save failed');
        setSnack({ message: 'Testimonial updated.', severity: 'success' });
      } else {
        const res = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Create failed');
        setSnack({ message: 'Testimonial created.', severity: 'success' });
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setSnack({ message: 'Testimonial removed.', severity: 'success' });
      setDeleteId(null);
      await load();
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Delete failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Toolbar disableGutters sx={{ gap: 2, mb: 2, pl: 0 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add testimonial
        </Button>
        <Button variant="outlined" onClick={() => void load()}>
          Refresh
        </Button>
      </Toolbar>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell>Quote preview</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Published</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No testimonials yet. Add one or run the seed script to import defaults.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{row.authorName}</Typography>
                    {[row.authorTitle, row.context].filter(Boolean).join(' · ') || '—'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="body2" noWrap title={row.quote}>
                      {row.quote}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.sortOrder}</TableCell>
                  <TableCell>
                    {row.published ? <Chip size="small" label="Yes" color="success" /> : <Chip size="small" label="Draft" />}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label="Edit" onClick={() => openEdit(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Delete" color="error" onClick={() => setDeleteId(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit testimonial' : 'New testimonial'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Quote"
            value={form.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            multiline
            minRows={4}
            required
            fullWidth
          />
          <TextField
            label="Author name"
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Author title or role (optional)"
            value={form.authorTitle}
            onChange={(e) => setForm((f) => ({ ...f, authorTitle: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Context / organization (optional)"
            value={form.context}
            onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
            fullWidth
            helperText="e.g. Acute care facility, Kingston region"
          />
          <TextField
            label="Avatar image URL (optional)"
            value={form.avatarUrl}
            onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            fullWidth
            helperText="https://… or a path under /public such as /photo.jpg"
          />
          <TextField
            label="Sort order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            fullWidth
            helperText="Lower numbers appear first on the public page."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
            }
            label="Published (visible on /testimonials)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} variant="contained" disabled={saving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => !saving && setDeleteId(null)}>
        <DialogTitle>Delete testimonial?</DialogTitle>
        <DialogContent>
          <Typography>This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void confirmDelete()} color="error" variant="contained" disabled={saving}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={6000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack?.severity} onClose={() => setSnack(null)} variant="filled" sx={{ width: '100%' }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
