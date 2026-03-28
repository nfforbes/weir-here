'use client';

import { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchJobs,
  setSearchFilters,
} from '@/store/slices/jobsSlice';
import JobSearchBar from '@/components/jobs/JobSearchBar';
import JobCard from '@/components/jobs/JobCard';
import { toUserErrorMessage } from '@/lib/errorMessage';

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { jobs: rawJobs, loading, error, searchFilters } = useAppSelector(
    (state) => state.jobs,
  );
  const jobs = Array.isArray(rawJobs) ? rawJobs : [];

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch, searchFilters]);

  const totalPages = Math.max(1, Math.ceil(jobs.length / searchFilters.limit));

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setSearchFilters({ page }));
  };

  const paginatedJobs = jobs.slice(
    (searchFilters.page - 1) * searchFilters.limit,
    searchFilters.page * searchFilters.limit,
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Job Board
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Browse open positions and find your next career move.
      </Typography>

      <JobSearchBar />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {toUserErrorMessage(error, 'Failed to load jobs')}
        </Alert>
      )}

      {!loading && !error && paginatedJobs.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          No jobs found matching your criteria.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {paginatedJobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={searchFilters.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
