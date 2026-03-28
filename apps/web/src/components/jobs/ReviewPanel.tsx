'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchApplications,
} from '@/store/slices/applicationsSlice';
import {
  fetchReviews,
  submitReview,
} from '@/store/slices/reviewsSlice';
import type { IApplication, IReview } from '@weir-here/shared';
import { toUserErrorMessage } from '@/lib/errorMessage';

interface ReviewPanelProps {
  jobId: string;
}

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  submitted: 'info',
  under_review: 'default',
  accepted: 'success',
  rejected: 'error',
};

interface ReviewFormState {
  rating: number;
  eliminated: boolean;
  notes: string;
}

export default function ReviewPanel({ jobId }: ReviewPanelProps) {
  const dispatch = useAppDispatch();
  const applications = useAppSelector((state) => state.applications.applications);
  const appsLoading = useAppSelector((state) => state.applications.loading);
  const appsError = useAppSelector((state) => state.applications.error);
  const reviews = useAppSelector((state) => state.reviews.reviews);
  const reviewsLoading = useAppSelector((state) => state.reviews.loading);
  const reviewsError = useAppSelector((state) => state.reviews.error);

  const [expandedId, setExpandedId] = useState<string | false>(false);
  const [forms, setForms] = useState<Record<string, ReviewFormState>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchApplications(jobId));
  }, [dispatch, jobId]);

  const handleExpand = useCallback(
    (applicationId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedId(isExpanded ? applicationId : false);
      if (isExpanded) {
        dispatch(fetchReviews(applicationId));
      }
    },
    [dispatch],
  );

  const getForm = useCallback(
    (appId: string): ReviewFormState =>
      forms[appId] ?? { rating: 5, eliminated: false, notes: '' },
    [forms],
  );

  const updateForm = useCallback(
    (appId: string, patch: Partial<ReviewFormState>) => {
      setForms((prev) => ({
        ...prev,
        [appId]: { ...prev[appId] ?? { rating: 5, eliminated: false, notes: '' }, ...patch },
      }));
    },
    [],
  );

  const handleSubmitReview = useCallback(
    (applicationId: string) => {
      const form = getForm(applicationId);
      dispatch(
        submitReview({
          applicationId,
          rating: form.rating,
          eliminated: form.eliminated,
          notes: form.notes,
        }),
      );
      setSubmitted((prev) => ({ ...prev, [applicationId]: true }));
    },
    [dispatch, getForm],
  );

  const reviewsForApp = useCallback(
    (appId: string): IReview[] =>
      reviews.filter((r) => r.applicationId === appId),
    [reviews],
  );

  if (appsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (appsError) {
    return (
      <Alert severity="error">{toUserErrorMessage(appsError, 'Failed to load applications')}</Alert>
    );
  }

  if (applications.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No applications received yet.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Applications &amp; Reviews
      </Typography>

      {applications.map((app: IApplication) => {
        const appId = app._id ?? '';
        const form = getForm(appId);
        const appReviews = reviewsForApp(appId);

        return (
          <Accordion
            key={appId}
            expanded={expandedId === appId}
            onChange={handleExpand(appId)}
            variant="outlined"
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ sm: 'center' }}
                sx={{ width: '100%', pr: 1 }}
              >
                <Typography sx={{ fontWeight: 600, flex: 1 }}>
                  {app.applicantName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {app.applicantEmail}
                </Typography>
                <Chip
                  label={app.status.replace('_', ' ')}
                  size="small"
                  color={statusColors[app.status] ?? 'default'}
                />
                {app.createdAt && (
                  <Typography variant="caption" color="text.disabled">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </Typography>
                )}
              </Stack>
            </AccordionSummary>

            <AccordionDetails>
              {/* Existing reviews */}
              {reviewsLoading && expandedId === appId ? (
                <CircularProgress size={20} />
              ) : (
                appReviews.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Existing Reviews
                    </Typography>
                    {appReviews.map((rev) => (
                      <Paper key={rev._id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2">
                            Rating: <strong>{rev.rating}</strong>/10
                          </Typography>
                          {rev.eliminated && (
                            <Chip label="Eliminated" size="small" color="error" />
                          )}
                        </Stack>
                        {rev.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {rev.notes}
                          </Typography>
                        )}
                        {rev.createdAt && (
                          <Typography variant="caption" color="text.disabled">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )
              )}

              <Divider sx={{ my: 2 }} />

              {/* Review form */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Submit Your Review
              </Typography>

              {submitted[appId] && !reviewsError && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  Review submitted!
                </Alert>
              )}
              {reviewsError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {toUserErrorMessage(reviewsError, 'Review failed')}
                </Alert>
              )}

              <Stack spacing={2}>
                <TextField
                  label="Rating (0–10)"
                  type="number"
                  size="small"
                  value={form.rating}
                  onChange={(e) =>
                    updateForm(appId, {
                      rating: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)),
                    })
                  }
                  slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                  sx={{ maxWidth: 160 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.eliminated}
                      onChange={(e) => updateForm(appId, { eliminated: e.target.checked })}
                    />
                  }
                  label="Eliminated"
                />
                <TextField
                  label="Notes"
                  multiline
                  minRows={2}
                  size="small"
                  fullWidth
                  value={form.notes}
                  onChange={(e) => updateForm(appId, { notes: e.target.value })}
                />
                <Button
                  variant="contained"
                  size="small"
                  disabled={reviewsLoading || !!submitted[appId]}
                  onClick={() => handleSubmitReview(appId)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Submit Review
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
