'use client';

import { useEffect } from 'react';
import { Auth0Provider, useUser } from '@auth0/nextjs-auth0/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch } from '@/store';
import { bootstrapUser } from '@/store/slices/authSlice';
import ThemeRegistry from '@/theme/ThemeRegistry';

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoading && user) {
      dispatch(bootstrapUser());
    }
  }, [user, isLoading, dispatch]);

  /** Refresh roles from DB when returning to the tab (e.g. after `grant-administrator` or env bootstrap). */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !isLoading && user) {
        dispatch(bootstrapUser());
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user, isLoading, dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <Provider store={store}>
        <ThemeRegistry>
          <AuthBootstrap>{children}</AuthBootstrap>
        </ThemeRegistry>
      </Provider>
    </Auth0Provider>
  );
}
