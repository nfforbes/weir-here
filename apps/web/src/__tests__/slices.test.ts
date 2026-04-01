import authReducer, {
  setUser,
  clearUser,
  setLoading,
  setError,
  bootstrapUserSuccess,
  bootstrapUserFailure,
} from '@/store/slices/authSlice';
import jobsReducer, {
  fetchJobsSuccess,
  fetchJobsFailure,
  fetchJobSuccess,
  setSearchFilters,
  clearCurrentJob,
  createJobSuccess,
} from '@/store/slices/jobsSlice';
import applicationsReducer, {
  fetchApplicationsSuccess,
  submitApplicationSuccess,
} from '@/store/slices/applicationsSlice';
import reviewsReducer, {
  fetchReviewsSuccess,
  submitReviewSuccess,
} from '@/store/slices/reviewsSlice';
import settingsReducer, {
  fetchSettingsSuccess,
  saveSettingsSuccess,
} from '@/store/slices/settingsSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should set user on setUser', () => {
    const user = {
      auth0Id: 'auth0|123',
      email: 'test@test.com',
      name: 'Test User',
      personas: ['user' as const],
      emailVerified: true,
    };
    const state = authReducer(initialState, setUser(user));
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear user on clearUser', () => {
    const withUser = {
      ...initialState,
      user: {
        auth0Id: 'auth0|123',
        email: 'test@test.com',
        name: 'Test',
        personas: ['user' as const],
        emailVerified: true,
      },
      isAuthenticated: true,
    };
    const state = authReducer(withUser, clearUser());
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set loading state', () => {
    const state = authReducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('should set error', () => {
    const state = authReducer(initialState, setError('test error'));
    expect(state.error).toBe('test error');
  });

  it('should handle bootstrapUserSuccess', () => {
    const user = {
      auth0Id: 'auth0|123',
      email: 'test@test.com',
      name: 'Test',
      personas: ['user' as const],
      emailVerified: true,
    };
    const state = authReducer({ ...initialState, loading: true }, bootstrapUserSuccess(user));
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should handle bootstrapUserFailure', () => {
    const state = authReducer(
      { ...initialState, loading: true },
      bootstrapUserFailure('Failed')
    );
    expect(state.error).toBe('Failed');
    expect(state.loading).toBe(false);
  });
});

describe('jobsSlice', () => {
  const initialState = {
    jobs: [] as any[],
    currentJob: null as any,
    loading: false,
    deletingJobId: null as string | null,
    error: null as string | null,
    searchFilters: { query: '', category: '', location: '', tags: [] as string[], page: 1, limit: 10 },
  };

  it('should set jobs on fetchJobsSuccess', () => {
    const payload = [{ _id: '1', title: 'Dev' }];
    const state = jobsReducer(
      { ...initialState, loading: true },
      fetchJobsSuccess(payload as any)
    );
    expect(state.jobs).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it('should set error on fetchJobsFailure', () => {
    const state = jobsReducer(
      { ...initialState, loading: true },
      fetchJobsFailure('Failed')
    );
    expect(state.error).toBe('Failed');
    expect(state.loading).toBe(false);
  });

  it('should set current job on fetchJobSuccess', () => {
    const job = { _id: '1', title: 'Dev' };
    const state = jobsReducer(initialState, fetchJobSuccess(job as any));
    expect(state.currentJob).toEqual(job);
  });

  it('should update search filters', () => {
    const state = jobsReducer(
      initialState,
      setSearchFilters({ query: 'react', category: 'Technology' })
    );
    expect(state.searchFilters.query).toBe('react');
    expect(state.searchFilters.category).toBe('Technology');
  });

  it('should clear current job', () => {
    const withJob = { ...initialState, currentJob: { _id: '1', title: 'Dev' } as any };
    const state = jobsReducer(withJob, clearCurrentJob());
    expect(state.currentJob).toBeNull();
  });

  it('should add created job to the list', () => {
    const newJob = { _id: '2', title: 'Designer' };
    const state = jobsReducer(initialState, createJobSuccess(newJob as any));
    expect(state.jobs).toContainEqual(newJob);
    expect(state.loading).toBe(false);
  });
});

describe('applicationsSlice', () => {
  const initialState = {
    applications: [],
    currentApplication: null,
    loading: false,
    error: null,
  };

  it('should set applications on fetchApplicationsSuccess', () => {
    const apps = [{ _id: '1', applicantName: 'John' }];
    const state = applicationsReducer(
      { ...initialState, loading: true },
      fetchApplicationsSuccess(apps as any)
    );
    expect(state.applications).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it('should add submitted application', () => {
    const app = { _id: '2', applicantName: 'Jane' };
    const state = applicationsReducer(initialState, submitApplicationSuccess(app as any));
    expect(state.applications).toContainEqual(app);
  });
});

describe('reviewsSlice', () => {
  const initialState = {
    reviews: [],
    loading: false,
    error: null,
  };

  it('should set reviews on fetchReviewsSuccess', () => {
    const revs = [{ _id: '1', rating: 8.5, eliminated: false }];
    const state = reviewsReducer(
      { ...initialState, loading: true },
      fetchReviewsSuccess(revs as any)
    );
    expect(state.reviews).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it('should add or update review on submitReviewSuccess', () => {
    const review = { _id: '1', applicationId: 'a1', rating: 7.5, eliminated: false };
    const state = reviewsReducer(initialState, submitReviewSuccess(review as any));
    expect(state.reviews).toContainEqual(review);
  });
});

describe('settingsSlice', () => {
  const initialState = {
    settings: {} as Record<string, string>,
    loading: false,
    error: null,
  };

  it('should populate settings on fetchSettingsSuccess', () => {
    const settings = { MS365_CLIENT_ID: 'abc', MS365_TENANT_ID: 'xyz' };
    const state = settingsReducer(
      { ...initialState, loading: true },
      fetchSettingsSuccess(settings)
    );
    expect(state.settings.MS365_CLIENT_ID).toBe('abc');
    expect(state.loading).toBe(false);
  });

  it('should merge settings on saveSettingsSuccess', () => {
    const existing = {
      settings: { MS365_CLIENT_ID: 'old' } as Record<string, string>,
      loading: true,
      error: null,
    };
    const state = settingsReducer(existing, saveSettingsSuccess({ MS365_CLIENT_ID: 'new' }));
    expect(state.settings.MS365_CLIENT_ID).toBe('new');
    expect(state.loading).toBe(false);
  });
});
