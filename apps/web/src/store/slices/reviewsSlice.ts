import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IReview } from '@weir-here/shared';

interface SubmitReviewPayload {
  applicationId: string;
  rating: number;
  eliminated: boolean;
  notes: string;
}

interface ReviewsState {
  reviews: IReview[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    fetchReviews(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsSuccess(state, action: PayloadAction<IReview[]>) {
      state.reviews = action.payload;
      state.loading = false;
    },
    fetchReviewsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    submitReview(state, _action: PayloadAction<SubmitReviewPayload>) {
      state.loading = true;
      state.error = null;
    },
    submitReviewSuccess(state, action: PayloadAction<IReview>) {
      state.reviews.push(action.payload);
      state.loading = false;
    },
    submitReviewFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchReviews,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  submitReview,
  submitReviewSuccess,
  submitReviewFailure,
} = reviewsSlice.actions;

export type { SubmitReviewPayload, ReviewsState };
export default reviewsSlice.reducer;
