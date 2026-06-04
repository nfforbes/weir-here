/**
 * Unit tests for /api/admin/providers route
 *
 * Strategy: mock requireAdministrator, connectDB, and the Provider model.
 * All tests run in jsdom/node without a real database.
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.mock('@/models/Provider', () => ({
  __esModule: true,
  default: {
    find: (...args: unknown[]) => mockFind(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    findByIdAndUpdate: (...args: unknown[]) => mockFindByIdAndUpdate(...args),
    findByIdAndDelete: (...args: unknown[]) => mockFindByIdAndDelete(...args),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminOk() {
  mockRequireAdministrator.mockResolvedValue({ ok: true });
}
function adminUnauthorized(status: 401 | 403 = 401) {
  mockRequireAdministrator.mockResolvedValue({ ok: false, status });
}

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/providers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/providers/route');
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when not admin', async () => {
    adminUnauthorized(403);
    const { GET } = await import('@/app/api/admin/providers/route');
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('returns provider list on success', async () => {
    adminOk();
    const fakeProviders = [
      { _id: '1', name: 'Alice', info: 'Bio A' },
      { _id: '2', name: 'Bob', info: 'Bio B' },
    ];
    mockFind.mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(fakeProviders) }) });

    const { GET } = await import('@/app/api/admin/providers/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(fakeProviders);
  });
});

describe('POST /api/admin/providers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { POST } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('POST', 'https://example.com/api/admin/providers', { name: 'Alice' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('POST', 'https://example.com/api/admin/providers', { info: 'some info' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Name is required');
  });

  it('returns 400 when name is blank whitespace', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('POST', 'https://example.com/api/admin/providers', { name: '   ' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates and returns provider on success', async () => {
    adminOk();
    const created = { _id: 'abc', name: 'Alice', info: 'Good nurse' };
    mockCreate.mockResolvedValue(created);

    const { POST } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('POST', 'https://example.com/api/admin/providers', { name: 'Alice', info: 'Good nurse' });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('Alice');
    expect(mockCreate).toHaveBeenCalledWith({ name: 'Alice', info: 'Good nurse' });
  });
});

describe('PUT /api/admin/providers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { PUT } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('PUT', 'https://example.com/api/admin/providers', { id: '1', name: 'X' });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when id is missing', async () => {
    adminOk();
    const { PUT } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('PUT', 'https://example.com/api/admin/providers', { name: 'X' });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when provider not found', async () => {
    adminOk();
    mockFindByIdAndUpdate.mockResolvedValue(null);
    const { PUT } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('PUT', 'https://example.com/api/admin/providers', { id: 'bad-id', name: 'X' });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });

  it('returns updated provider on success', async () => {
    adminOk();
    const updated = { _id: '1', name: 'Updated', info: 'new info' };
    mockFindByIdAndUpdate.mockResolvedValue(updated);
    const { PUT } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('PUT', 'https://example.com/api/admin/providers', { id: '1', name: 'Updated', info: 'new info' });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Updated');
  });
});

describe('DELETE /api/admin/providers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { DELETE } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('DELETE', 'https://example.com/api/admin/providers?id=1');
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when id query param is missing', async () => {
    adminOk();
    const { DELETE } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('DELETE', 'https://example.com/api/admin/providers');
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('deletes and returns success', async () => {
    adminOk();
    mockFindByIdAndDelete.mockResolvedValue({});
    const { DELETE } = await import('@/app/api/admin/providers/route');
    const req = makeRequest('DELETE', 'https://example.com/api/admin/providers?id=abc123');
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123');
  });
});
