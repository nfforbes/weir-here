'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Link as MuiLink,
} from '@mui/material';

interface ReviewData {
  rating: number;
  eliminated: boolean;
  reviewerId: string;
}

interface ApplicationItem {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  screeningAnswers: { question: string; answer: string }[];
  status: string;
  reviews: ReviewData[];
  createdAt: string;
}

interface Props {
  jobId: string;
  currentUserId: string;
}

export default function ApplicationsReviewClient({ jobId, currentUserId }: Props) {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewDialog, setReviewDialog] = useState<ApplicationItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [eliminated, setEliminated] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setApplications(data.applications);
      setJobTitle(data.jobTitle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const openReview = (app: ApplicationItem) => {
    const myReview = app.reviews.find((r) => r.reviewerId === currentUserId);
    setRating(myReview?.rating ?? 5);
    setEliminated(myReview?.eliminated ?? false);
    setNotes('');
    setReviewDialog(app);
  };

  const submitReview = async () => {
    if (!reviewDialog) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: reviewDialog._id,
          rating,
          eliminated,
          notes,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setReviewDialog(null);
      await fetchApplications();
    } catch {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = (reviews: ReviewData[]) => {
    if (reviews.length === 0) return '-';
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Applications for: {jobTitle}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {applications.length === 0 ? (
        <Typography color="text.secondary">No applications yet.</Typography>
      ) : (
        <Paper sx={{ borderRadius: 3, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Resume</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Avg Rating</TableCell>
                <TableCell>Reviews</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.applicantName}</TableCell>
                  <TableCell>{app.applicantEmail}</TableCell>
                  <TableCell>
                    <MuiLink href={app.resumeUrl} target="_blank" rel="noopener">
                      View
                    </MuiLink>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      size="small"
                      color={
                        app.status === 'eliminated'
                          ? 'error'
                          : app.status === 'shortlisted'
                            ? 'success'
                            : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{avgRating(app.reviews)}</TableCell>
                  <TableCell>{app.reviews.length}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openReview(app)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={!!reviewDialog} onClose={() => setReviewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Review: {reviewDialog?.applicantName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {reviewDialog?.screeningAnswers && reviewDialog.screeningAnswers.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Screening Answers
                </Typography>
                {reviewDialog.screeningAnswers.map((sa, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {sa.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sa.answer}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Rating: {rating.toFixed(1)} / 10
              </Typography>
              <Slider
                value={rating}
                onChange={(_, v) => setRating(v as number)}
                min={0}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Button
                variant={eliminated ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setEliminated(!eliminated)}
                size="small"
              >
                {eliminated ? 'Marked as Eliminated' : 'Mark as Eliminated'}
              </Button>
            </Box>

            <TextField
              label="Notes (optional)"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={submitReview} disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
