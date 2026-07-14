/**
 * Unit tests for /api/admin/assignments route
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockAssignmentFind = jest.fn();
const mockAssignmentCreate = jest.fn();
const mockAssignmentFindById = jest.fn();
const mockAssignmentFindByIdAndDelete = jest.fn();
const mockAssignmentFindByIdAndUpdate = jest.fn();

jest.mock('@/models/Assignment', () => ({
  __esModule: true,
  default: {
    find: (...a: unknown[]) => mockAssignmentFind(...a),
    create: (...a: unknown[]) => mockAssignmentCreate(...a),
    findById: (...a: unknown[]) => mockAssignmentFindById(...a),
    findByIdAndDelete: (...a: unknown[]) => mockAssignmentFindByIdAndDelete(...a),
    findByIdAndUpdate: (...a: unknown[]) => mockAssignmentFindByIdAndUpdate(...a),
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

const BASE = 'https://example.com/api/admin/assignments';

const POPULATED_ASSIGNMENT = {
  _id: 'a1',
  clientId: { _id: 'c1', name: 'Client A', address: '1 Main' },
  providerId: { _id: 'p1', name: 'Provider A' },
  clientChargeCents: 10000,
  providerPayCents: 7500,
  description: 'Daily care',
  serviceDate: new Date('2025-01-15'),
  invoiced: false,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/assignments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/assignments/route');
    const res = await GET(makeRequest('GET', BASE));
    expect(res.status).toBe(401);
  });

  it('returns all assignments when no filters', async () => {
    adminOk();
    const chainMock = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([POPULATED_ASSIGNMENT]),
    };
    mockAssignmentFind.mockReturnValue(chainMock);

    const { GET } = await import('@/app/api/admin/assignments/route');
    const res = await GET(makeRequest('GET', BASE));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(mockAssignmentFind).toHaveBeenCalledWith({});
  });

  it('filters by clientId when provided', async () => {
    adminOk();
    const chainMock = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    mockAssignmentFind.mockReturnValue(chainMock);

    const { GET } = await import('@/app/api/admin/assignments/route');
    const res = await GET(makeRequest('GET', `${BASE}?clientId=c1`));
    expect(res.status).toBe(200);
    expect(mockAssignmentFind).toHaveBeenCalledWith({ clientId: 'c1' });
  });

  it('filters by providerId when provided', async () => {
    adminOk();
    const chainMock = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    mockAssignmentFind.mockReturnValue(chainMock);

    const { GET } = await import('@/app/api/admin/assignments/route');
    const res = await GET(makeRequest('GET', `${BASE}?providerId=p1`));
    expect(res.status).toBe(200);
    expect(mockAssignmentFind).toHaveBeenCalledWith({ providerId: 'p1' });
  });
});

describe('POST /api/admin/assignments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when clientId is missing', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('POST', BASE, { providerId: 'p1', clientChargeCents: 1000, providerPayCents: 700 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('clientId is required');
  });

  it('returns 400 when providerId is missing', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('POST', BASE, { clientId: 'c1', clientChargeCents: 1000, providerPayCents: 700 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('providerId is required');
  });

  it('returns 400 when clientChargeCents is negative', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('POST', BASE, { clientId: 'c1', providerId: 'p1', clientChargeCents: -1, providerPayCents: 700 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('clientChargeCents');
  });

  it('returns 400 when providerPayCents is negative', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('POST', BASE, { clientId: 'c1', providerId: 'p1', clientChargeCents: 1000, providerPayCents: -5 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates assignment and returns populated data', async () => {
    adminOk();
    mockAssignmentCreate.mockResolvedValue({ _id: 'a1' });

    const populateChain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(POPULATED_ASSIGNMENT),
    };
    mockAssignmentFindById.mockReturnValue(populateChain);

    const { POST } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('POST', BASE, {
      clientId: 'c1',
      providerId: 'p1',
      clientChargeCents: 10000,
      providerHourlyRateCents: 5000,
      providerPayCents: 7500,
      description: 'Daily care',
      serviceDate: '2025-01-15',
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.clientChargeCents).toBe(10000);
    expect(mockAssignmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 'c1',
      providerId: 'p1',
      clientChargeCents: 10000,
      providerHourlyRateCents: 5000,
      providerPayCents: 7500,
    }));
  });
});

describe('DELETE /api/admin/assignments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when id is missing', async () => {
    adminOk();
    const { DELETE } = await import('@/app/api/admin/assignments/route');
    const res = await DELETE(makeRequest('DELETE', BASE));
    expect(res.status).toBe(400);
  });

  it('deletes assignment and returns success', async () => {
    adminOk();
    mockAssignmentFindByIdAndDelete.mockResolvedValue({});
    const { DELETE } = await import('@/app/api/admin/assignments/route');
    const res = await DELETE(makeRequest('DELETE', `${BASE}?id=a1`));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockAssignmentFindByIdAndDelete).toHaveBeenCalledWith('a1');
  });
});

describe('PUT /api/admin/assignments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when id is missing', async () => {
    adminOk();
    const { PUT } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('PUT', BASE, { clientId: 'c1', providerId: 'p1', clientChargeCents: 1000, providerHourlyRateCents: 500 });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('id is required');
  });

  it('returns 400 when clientId is missing', async () => {
    adminOk();
    const { PUT } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('PUT', BASE, { id: 'a1', providerId: 'p1', clientChargeCents: 1000, providerHourlyRateCents: 500 });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('clientId is required');
  });

  it('returns 400 when providerHourlyRateCents is negative', async () => {
    adminOk();
    const { PUT } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('PUT', BASE, { id: 'a1', clientId: 'c1', providerId: 'p1', clientChargeCents: 1000, providerHourlyRateCents: -500 });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when status is invalid', async () => {
    adminOk();
    const { PUT } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('PUT', BASE, { id: 'a1', clientId: 'c1', providerId: 'p1', clientChargeCents: 1000, providerHourlyRateCents: 500, status: 'invalid-status' });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('updates assignment and returns populated data on success', async () => {
    adminOk();
    mockAssignmentFindByIdAndUpdate.mockResolvedValue({ _id: 'a1' });

    const populateChain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(POPULATED_ASSIGNMENT),
    };
    mockAssignmentFindById.mockReturnValue(populateChain);

    const { PUT } = await import('@/app/api/admin/assignments/route');
    const req = makeRequest('PUT', BASE, {
      id: 'a1',
      clientId: 'c1',
      providerId: 'p1',
      clientChargeCents: 10000,
      providerHourlyRateCents: 5000,
      providerPayCents: 7500,
      description: 'Updated Daily care',
      serviceDate: '2025-01-15',
      status: 'completed',
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.clientChargeCents).toBe(10000);
    expect(mockAssignmentFindByIdAndUpdate).toHaveBeenCalledWith('a1', expect.objectContaining({
      clientId: 'c1',
      providerId: 'p1',
      clientChargeCents: 10000,
      providerHourlyRateCents: 5000,
      providerPayCents: 7500,
      status: 'completed',
    }), { new: true });
  });
});
