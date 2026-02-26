'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOffIcon from '@mui/icons-material/PersonOff';

interface UserRow {
  _id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  personas: string[];
  createdAt: string;
}

interface Props {
  currentUserId: string;
}

export default function AdminUsersClient({ currentUserId }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error('Failed to load users');
    const data = await res.json();
    setUsers(data.users || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await fetchUsers();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchUsers]);

  const handlePromoteDemote = async (userId: string, action: 'promote' | 'demote') => {
    setUpdating(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setError(null);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Registered Users
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        All users who have logged in to the system.
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Personas</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => {
              const isAdmin = u.personas?.includes('administrator');
              const isSelf = u._id === currentUserId;
              const busy = updating === u._id;
              return (
                <TableRow key={u._id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.emailVerified ? (
                      <Chip icon={<CheckCircleIcon />} label="Yes" color="success" size="small" />
                    ) : (
                      <Chip icon={<CancelIcon />} label="No" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {u.personas?.map((p) => (
                        <Chip key={p} label={p} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {isAdmin ? (
                      <Tooltip title={isSelf ? 'You cannot remove your own admin status' : 'Remove admin'}>
                        <span>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<PersonOffIcon />}
                            onClick={() => handlePromoteDemote(u._id, 'demote')}
                            disabled={isSelf || busy}
                          >
                            Remove Admin
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AdminPanelSettingsIcon />}
                        onClick={() => handlePromoteDemote(u._id, 'promote')}
                        disabled={busy}
                      >
                        Promote to Admin
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No users registered yet.
        </Typography>
      )}
    </Box>
  );
}
