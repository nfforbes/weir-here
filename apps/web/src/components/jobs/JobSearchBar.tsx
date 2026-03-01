'use client';

import { useCallback } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSearchFilters, fetchJobs } from '@/store/slices/jobsSlice';

const CATEGORIES = [
  '',
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
] as const;

export default function JobSearchBar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.jobs.searchFilters);

  const updateFilter = useCallback(
    (patch: Record<string, unknown>) => {
      dispatch(setSearchFilters(patch));
    },
    [dispatch],
  );

  const handleSearch = useCallback(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleTagsChange = useCallback(
    (value: string) => {
      const tags = value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      dispatch(setSearchFilters({ tags }));
    },
    [dispatch],
  );

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      sx={{ width: '100%' }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
      >
        <TextField
          label="Search"
          placeholder="Job title, keyword…"
          size="small"
          value={filters.query}
          onChange={(e) => updateFilter({ query: e.target.value })}
          sx={{ flex: 2 }}
        />

        <TextField
          select
          label="Category"
          size="small"
          value={filters.category}
          onChange={(e) => updateFilter({ category: e.target.value })}
          sx={{ flex: 1, minWidth: 140 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {CATEGORIES.filter(Boolean).map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Location"
          placeholder="City, state, or Remote"
          size="small"
          value={filters.location}
          onChange={(e) => updateFilter({ location: e.target.value })}
          sx={{ flex: 1 }}
        />

        <TextField
          label="Tags"
          placeholder="e.g. react, node"
          size="small"
          value={filters.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{ minWidth: 110, whiteSpace: 'nowrap' }}
        >
          Search
        </Button>
      </Stack>
    </Box>
  );
}
