'use client';

import Link from 'next/link';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { IJob } from '@weir-here/shared';

interface JobCardProps {
  job: IJob;
}

const employmentTypeLabels: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
};

function formatSalary(min: number, max: number, currency: string): string {
  try {
    const code = currency?.trim() || 'USD';
    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    });
    return `${fmt.format(min)} – ${fmt.format(max)}`;
  } catch {
    return `${min} – ${max} ${currency || ''}`.trim();
  }
}

export default function JobCard({ job }: JobCardProps) {
  const tags = job.tags ?? [];
  const truncatedDescription =
    job.description.length > 150
      ? `${job.description.slice(0, 150)}…`
      : job.description;

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card
      variant="outlined"
      sx={{
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/jobs/${job._id}`}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {job.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {truncatedDescription}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={employmentTypeLabels[job.employmentType] ?? job.employmentType}
              size="small"
              color="primary"
              variant="outlined"
            />
            {job.salaryRange && (
              <Typography variant="body2" color="text.secondary">
                {formatSalary(
                  job.salaryRange.min,
                  job.salaryRange.max,
                  job.salaryRange.currency,
                )}
              </Typography>
            )}
          </Stack>

          {tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          {postedDate && (
            <Typography variant="caption" color="text.disabled">
              Posted {postedDate}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
