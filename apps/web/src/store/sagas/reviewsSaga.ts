import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { IReview } from '@weir-here/shared';
import {
  fetchReviews,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  submitReview,
  submitReviewSuccess,
  submitReviewFailure,
} from '@/store/slices/reviewsSlice';
import type { SubmitReviewPayload } from '@/store/slices/reviewsSlice';

async function getReviews(applicationId: string): Promise<IReview[]> {
  const res = await fetch(
    `/api/reviews?applicationId=${encodeURIComponent(applicationId)}`
  );
  if (!res.ok) throw new Error('Failed to fetch reviews');
  const data = await res.json();
  return data.reviews || [];
}

async function postReview(payload: SubmitReviewPayload): Promise<IReview> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  const data = await res.json();
  return data.review;
}

function* handleFetchReviews(action: PayloadAction<string>) {
  try {
    const reviews: IReview[] = yield call(getReviews, action.payload);
    yield put(fetchReviewsSuccess(reviews));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch reviews';
    yield put(fetchReviewsFailure(message));
  }
}

function* handleSubmitReview(action: PayloadAction<SubmitReviewPayload>) {
  try {
    const review: IReview = yield call(postReview, action.payload);
    yield put(submitReviewSuccess(review));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to submit review';
    yield put(submitReviewFailure(message));
  }
}

export default function* reviewsSaga() {
  yield takeLatest(fetchReviews.type, handleFetchReviews);
  yield takeLatest(submitReview.type, handleSubmitReview);
}
