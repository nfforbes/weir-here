'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  FormGroup,
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
import type { Persona } from '@weir-here/shared';

export interface AdminUserRow {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  personas: Persona[];
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersManager({ currentAuth0Id }: { currentAuth0Id: string }) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editRow, setEditRow] = useState<AdminUserRow | null>(null);
  const [editAdmin, setEditAdmin] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [deleteRow, setDeleteRow] = useState<AdminUserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(
        (data.users as AdminUserRow[]).map((u) => ({
          ...u,
          createdAt: typeof u.createdAt === 'string' ? u.createdAt : new Date(u.createdAt).toISOString(),
          updatedAt: typeof u.updatedAt === 'string' ? u.updatedAt : new Date(u.updatedAt).toISOString(),
        })),
      );
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Load failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.auth0Id.toLowerCase().includes(q),
    );
  }, [users, search]);

  const openEdit = (row: AdminUserRow) => {
    setEditRow(row);
    setEditAdmin(row.personas.includes('administrator'));
    setEditUser(row.personas.includes('user'));
  };

  const closeEdit = () => {
    if (!saving) setEditRow(null);
  };

  const savePersonas = async () => {
    if (!editRow) return;
    const personas: Persona[] = [];
    if (editUser) personas.push('user');
    if (editAdmin) personas.push('administrator');
    if (personas.length === 0) {
      setSnack({ message: 'Select at least one role.', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editRow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSnack({ message: 'Saved roles.', severity: 'success' });
      setEditRow(null);
      await loadUsers();
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Update failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteRow.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setSnack({ message: 'User removed.', severity: 'success' });
      setDeleteRow(null);
      await loadUsers();
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
      <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap', mb: 2, pl: 0 }}>
        <TextField
          size="small"
          label="Search name, email, or Auth0 ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" onClick={() => void loadUsers()}>
          Refresh
        </Button>
      </Toolbar>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No users match your search.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {row.personas.map((p) => (
                        <Chip key={p} size="small" label={p === 'administrator' ? 'Administrator' : 'User'} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{row.emailVerified ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="Edit roles" onClick={() => openEdit(row)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete user"
                      onClick={() => setDeleteRow(row)}
                      size="small"
                      disabled={row.auth0Id === currentAuth0Id}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editRow} onClose={closeEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit roles — {editRow?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editRow?.email}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={editUser} onChange={(e) => setEditUser(e.target.checked)} />}
              label="User (job posting, applications, dashboard)"
            />
            <FormControlLabel
              control={
                <Checkbox checked={editAdmin} onChange={(e) => setEditAdmin(e.target.checked)} />
              }
              label="Administrator (configuration, user management)"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void savePersonas()} variant="contained" disabled={saving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteRow} onClose={() => !saving && setDeleteRow(null)}>
        <DialogTitle>Remove user?</DialogTitle>
        <DialogContent>
          <Typography>
            This deletes <strong>{deleteRow?.name}</strong> ({deleteRow?.email}) from the application database.
            They can sign in again via Auth0 and will get a fresh profile unless you block them in Auth0.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRow(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void confirmDelete()} color="error" variant="contained" disabled={saving}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={6000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity} onClose={() => setSnack(null)} variant="filled" sx={{ width: '100%' }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
