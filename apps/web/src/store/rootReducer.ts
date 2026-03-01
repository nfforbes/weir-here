import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import jobsReducer from '@/store/slices/jobsSlice';
import applicationsReducer from '@/store/slices/applicationsSlice';
import reviewsReducer from '@/store/slices/reviewsSlice';
import settingsReducer from '@/store/slices/settingsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  reviews: reviewsReducer,
  settings: settingsReducer,
});

export default rootReducer;
