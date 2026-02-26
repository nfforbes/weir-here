'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Pagination,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';
import type { JobListItem } from '@/store/slices/jobsSlice';

export default function JobBoardClient() {
  const [items, setItems] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (tag) params.set('tag', tag);
    params.set('page', String(page));

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, location, tag, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchJobs();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category, location, tag]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Job Board
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <TextField
          placeholder="Search jobs..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: '1 1 200px' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          placeholder="Category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ flex: '1 1 150px' }}
        />
        <TextField
          placeholder="Location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ flex: '1 1 150px' }}
        />
        <TextField
          placeholder="Tag"
          size="small"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          sx={{ flex: '1 1 150px' }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 8 }}>
          No jobs found. Try adjusting your search criteria.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {items.map((job) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={job._id}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardActionArea component={Link} href={`/jobs/${job._id}`} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {job.companyName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {job.description}...
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip label={job.employmentType} size="small" color="primary" variant="outlined" />
                        {job.tags.slice(0, 3).map((t) => (
                          <Chip key={t} label={t} size="small" variant="outlined" />
                        ))}
                      </Box>
                      {job.salaryRange?.min && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {job.salaryRange.currency || 'USD'} {job.salaryRange.min.toLocaleString()}
                          {job.salaryRange.max ? ` - ${job.salaryRange.max.toLocaleString()}` : '+'}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
