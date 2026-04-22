'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJob, clearCurrentJob } from '@/store/slices/jobsSlice';
import { toUserErrorMessage } from '@/lib/errorMessage';
import { formatJobSalaryPlain } from '@weir-here/shared';

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const { currentJob: job, loading, error } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    if (slug) dispatch(fetchJob(slug));
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [slug, dispatch]);

  const handleApply = () => {
    if (user) {
      router.push(`/jobs/${slug}/apply`);
    } else {
      router.push(`/auth/login?returnTo=/jobs/${slug}/apply`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
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

  const salary = formatJobSalaryPlain(job.salaryRange);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/jobs')}
        sx={{ mb: 3 }}
      >
        Back to Search
      </Button>

      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {job.title}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Chip icon={<LocationOnIcon />} label={job.location} variant="outlined" />
          <Chip icon={<WorkIcon />} label={job.employmentType} variant="outlined" />
          {salary && (
            <Chip icon={<AttachMoneyIcon />} label={salary} variant="outlined" />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {job.description}
        </Typography>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Responsibilities
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {job.responsibilities}
        </Typography>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Requirements
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {job.requirements}
        </Typography>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          How to Apply
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {job.howToApply}
        </Typography>

        {job.skills.length > 0 && (
          <>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {job.skills.map((s) => (
                <Chip key={s} label={s} size="small" />
              ))}
            </Box>
          </>
        )}

        {job.benefits.length > 0 && (
          <>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Benefits
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {job.benefits.map((b) => (
                <Chip key={b} label={b} size="small" color="success" variant="outlined" />
              ))}
            </Box>
          </>
        )}

        {job.screeningQuestions.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Screening Questions
            </Typography>
            <List disablePadding>
              {job.screeningQuestions.map((q) => (
                <ListItem key={q.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HelpOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={q.question}
                    secondary={`Type: ${q.type} ${q.required ? '(Required)' : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" size="large" onClick={handleApply}>
          Apply Now
        </Button>
      </Box>
    </Container>
  );
}
