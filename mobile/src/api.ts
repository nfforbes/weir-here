import { API_BASE_URL } from './config';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getJobs: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/jobs${qs ? `?${qs}` : ''}`);
  },
  getJob: (id: string) => apiFetch(`/api/jobs/${id}`),
  getCompanies: () => apiFetch('/api/companies'),
  createCompany: (data: Record<string, unknown>) =>
    apiFetch('/api/companies', { method: 'POST', body: JSON.stringify(data) }),
  createJob: (data: Record<string, unknown>) =>
    apiFetch('/api/jobs', { method: 'POST', body: JSON.stringify(data) }),
  applyForJob: (data: Record<string, unknown>) =>
    apiFetch('/api/applications', { method: 'POST', body: JSON.stringify(data) }),
  getApplications: (jobId: string) => apiFetch(`/api/jobs/${jobId}/applications`),
  submitReview: (data: Record<string, unknown>) =>
    apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getUser: () => apiFetch('/api/user'),
};
