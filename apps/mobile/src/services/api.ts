import { API_BASE_URL } from '../config';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private headers(contentType?: string): Record<string, string> {
    const h: Record<string, string> = {};
    if (contentType) h['Content-Type'] = contentType;
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    contentType = 'application/json',
  ): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    const res = await fetch(url, {
      method,
      headers: this.headers(contentType),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
    }

    const contentTypeHeader = res.headers.get('content-type') ?? '';
    if (contentTypeHeader.includes('application/json')) {
      return res.json() as Promise<T>;
    }
    return res.text() as unknown as T;
  }

  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
    let url = path;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url = `${path}?${qs}`;
    }
    return this.request<T>('GET', url);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  async uploadFile<T = unknown>(
    path: string,
    file: { uri: string; name: string; mimeType?: string },
    type: string,
  ): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const form = new FormData();

    form.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
    form.append('type', type);

    const res = await fetch(url, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Upload to ${path} failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<T>;
  }
}

export const api = new ApiService();
