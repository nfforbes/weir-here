import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Auth0 from 'react-native-auth0';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from './config';
import { setToken, clearToken, getToken } from './api';

const auth0 = new Auth0({ domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID });

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: { name: string; email: string } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthState['user']>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        setIsAuthenticated(true);
        try {
          const info = await auth0.auth.userInfo({ token });
          setUser({ name: info.name || '', email: info.email || '' });
        } catch {
          await clearToken();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async () => {
    try {
      const credentials = await auth0.webAuth.authorize({ scope: 'openid profile email' });
      if (credentials.accessToken) {
        await setToken(credentials.accessToken);
        setIsAuthenticated(true);
        const info = await auth0.auth.userInfo({ token: credentials.accessToken });
        setUser({ name: info.name || '', email: info.email || '' });
      }
    } catch {
      // user cancelled
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth0.webAuth.clearSession();
    } catch {
      // ignore
    }
    await clearToken();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
