/**
 * Unit tests for /api/admin/clients route
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockClientFind = jest.fn();
const mockClientCreate = jest.fn();
const mockClientFindByIdAndUpdate = jest.fn();
const mockClientFindByIdAndDelete = jest.fn();

jest.mock('@/models/Client', () => ({
  __esModule: true,
  default: {
    find: (...a: unknown[]) => mockClientFind(...a),
    create: (...a: unknown[]) => mockClientCreate(...a),
    findByIdAndUpdate: (...a: unknown[]) => mockClientFindByIdAndUpdate(...a),
    findByIdAndDelete: (...a: unknown[]) => mockClientFindByIdAndDelete(...a),
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

const BASE = 'https://example.com/api/admin/clients';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/clients', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/clients/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns clients on success', async () => {
    adminOk();
    const fakeClients = [{ _id: 'c1', name: 'Client A', address: '1 Main St' }];

    mockClientFind.mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(fakeClients) }) });

    const { GET } = await import('@/app/api/admin/clients/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe('Client A');
  });
});

describe('POST /api/admin/clients', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when name is missing', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('POST', BASE, { address: '1 Main St' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Name is required');
  });

  it('returns 400 when address is missing', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('POST', BASE, { name: 'Client A' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Address is required');
  });

  it('creates and returns client on success', async () => {
    adminOk();
    const created = { _id: 'c1', name: 'Client A', address: '1 Main St' };
    mockClientCreate.mockResolvedValue(created);
    const { POST } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('POST', BASE, { name: 'Client A', address: '1 Main St' });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect((await res.json()).name).toBe('Client A');
  });
});

describe('PUT /api/admin/clients', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when id is missing', async () => {
    adminOk();
    const { PUT } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('PUT', BASE, { name: 'X', address: 'Y' });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when client not found', async () => {
    adminOk();
    mockClientFindByIdAndUpdate.mockResolvedValue(null);
    const { PUT } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('PUT', BASE, { id: 'no-such', name: 'X', address: 'Y' });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });

  it('returns updated client on success', async () => {
    adminOk();
    const updated = { _id: 'c1', name: 'Updated', address: 'New Addr' };
    mockClientFindByIdAndUpdate.mockResolvedValue(updated);
    const { PUT } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('PUT', BASE, { id: 'c1', name: 'Updated', address: 'New Addr' });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe('Updated');
  });
});

describe('DELETE /api/admin/clients', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when id is missing', async () => {
    adminOk();
    const { DELETE } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('DELETE', BASE);
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('deletes client', async () => {
    adminOk();
    mockClientFindByIdAndDelete.mockResolvedValue({});
    const { DELETE } = await import('@/app/api/admin/clients/route');
    const req = makeRequest('DELETE', `${BASE}?id=c1`);
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
