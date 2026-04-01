'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJob, clearCurrentJob, deleteJob } from '@/store/slices/jobsSlice';
import { fetchApplications } from '@/store/slices/applicationsSlice';
import ReviewPanel from '@/components/jobs/ReviewPanel';
import { toUserErrorMessage } from '@/lib/errorMessage';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  submitted: 'info',
  under_review: 'default',
  accepted: 'success',
  rejected: 'error',
};

export default function MyJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  const dispatch = useAppDispatch();
  const {
    currentJob: job,
    loading: jobLoading,
    error: jobError,
    deletingJobId,
  } = useAppSelector((state) => state.jobs);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteStartedRef = useRef(false);

  useEffect(() => {
    if (deletingJobId === id) deleteStartedRef.current = true;
  }, [deletingJobId, id]);

  useEffect(() => {
    if (!deleteStartedRef.current) return;
    if (deletingJobId !== null) return;
    if (jobError) {
      deleteStartedRef.current = false;
      return;
    }
    deleteStartedRef.current = false;
    router.push('/dashboard/my-jobs');
  }, [deletingJobId, jobError, router]);
  const {
    applications,
    loading: appsLoading,
    error: appsError,
  } = useAppSelector((state) => state.applications);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?returnTo=/dashboard/my-jobs/${id}`);
    }
  }, [user, authLoading, router, id]);

  useEffect(() => {
    if (id && user) {
      dispatch(fetchJob(id));
      dispatch(fetchApplications(id));
    }
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [id, user, dispatch]);

  if (authLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  const loading = jobLoading || appsLoading;
  const error = jobError || appsError;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !job) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{toUserErrorMessage(error, 'Failed to load job')}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>Job not found.</Typography>
      </Container>
    );
  }

  const canManagePosting = user?.sub === job.postedBy;
  const isDeletingThis = deletingJobId === id;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/dashboard/my-jobs')}
        sx={{ mb: 3 }}
      >
        Back to My Jobs
      </Button>

      {(jobError || appsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {toUserErrorMessage(jobError || appsError, 'Could not complete request')}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h4" fontWeight={700}>
            {job.title}
          </Typography>
          {canManagePosting && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/dashboard/my-jobs/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                disabled={isDeletingThis}
                onClick={() => setDeleteOpen(true)}
              >
                {isDeletingThis ? 'Deleting…' : 'Delete'}
              </Button>
            </Stack>
          )}
        </Stack>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={job.location} variant="outlined" size="small" />
          <Chip label={job.employmentType} variant="outlined" size="small" />
          {job.salaryRange && (
            <Chip
              label={`${job.salaryRange.currency} ${Number(job.salaryRange.min).toLocaleString()} – ${Number(job.salaryRange.max).toLocaleString()}`}
              variant="outlined"
              size="small"
            />
          )}
          {job.expiresAt && (
            <Chip
              label={`Expires ${new Date(job.expiresAt).toLocaleDateString()}`}
              variant="outlined"
              size="small"
              color={new Date(job.expiresAt) > new Date() ? 'default' : 'error'}
            />
          )}
        </Box>

        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
          Description
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
          {job.description}
        </Typography>

        {job.responsibilities && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
              Responsibilities
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {job.responsibilities}
            </Typography>
          </>
        )}

        {job.requirements && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
              Requirements
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {job.requirements}
            </Typography>
          </>
        )}

        {job.howToApply && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
              How to Apply
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {job.howToApply}
            </Typography>
          </>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Applicants ({applications.length})
      </Typography>

      {applications.length === 0 ? (
        <Typography color="text.secondary">
          No applications have been submitted yet.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Applied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        {app.applicantName || '—'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        {app.applicantEmail || '—'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(app.status ?? 'submitted').replace('_', ' ')}
                        size="small"
                        color={statusColors[app.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Review &amp; details
          </Typography>
          <ReviewPanel jobId={id ?? ''} />
        </>
      )}

      <Dialog open={deleteOpen} onClose={() => !isDeletingThis && setDeleteOpen(false)} aria-labelledby="delete-job-title">
        <DialogTitle id="delete-job-title">Delete this posting?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove the job listing. Applicants can no longer apply. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={isDeletingThis}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={isDeletingThis}
            onClick={() => {
              setDeleteOpen(false);
              if (id) dispatch(deleteJob(id));
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
