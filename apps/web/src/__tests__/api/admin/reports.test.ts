/**
 * Unit tests for /api/admin/reports route
 *
 * Tests auth, month validation, JSON aggregation, provider filter,
 * and Excel export content-type.
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockAssignmentFind = jest.fn();
jest.mock('@/models/Assignment', () => ({
  __esModule: true,
  default: {
    find: (...a: unknown[]) => mockAssignmentFind(...a),
  },
}));

// Mock ExcelJS to avoid actual file generation in tests
const mockWriteBuffer = jest.fn().mockResolvedValue(Buffer.from('XLSX'));
jest.mock('exceljs', () => {
  const sheet = {
    columns: [],
    getRow: jest.fn().mockReturnValue({ font: {}, fill: {} }),
    addRow: jest.fn().mockReturnValue({ font: {}, fill: {} }),
  };
  return {
    __esModule: true,
    default: {
      Workbook: jest.fn().mockImplementation(() => ({
        addWorksheet: jest.fn().mockReturnValue(sheet),
        xlsx: { writeBuffer: mockWriteBuffer },
      })),
    },
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminOk() {
  mockRequireAdministrator.mockResolvedValue({ ok: true });
}
function adminUnauthorized(status: 401 | 403 = 401) {
  mockRequireAdministrator.mockResolvedValue({ ok: false, status });
}

function makeRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' });
}

const BASE = 'https://example.com/api/admin/reports';

const FAKE_ASSIGNMENTS = [
  {
    clientId: { name: 'Client A', address: '1 Main' },
    providerId: { name: 'Provider X' },
    description: 'Daily care',
    serviceDate: new Date('2025-01-10'),
    clientChargeCents: 20000,
    providerPayCents: 14000,
    invoiced: true,
  },
  {
    clientId: { name: 'Client B', address: '2 Side St' },
    providerId: { name: 'Provider Y' },
    description: 'Night care',
    serviceDate: new Date('2025-01-20'),
    clientChargeCents: 15000,
    providerPayCents: 10000,
    invoiced: false,
  },
];

function makeChain(data: unknown[]) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/reports — Auth', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-01`));
    expect(res.status).toBe(401);
  });

  it('returns 403 when not admin', async () => {
    adminUnauthorized(403);
    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-01`));
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/reports — Validation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when month is missing', async () => {
    adminOk();
    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(BASE));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('month is required');
  });

  it('returns 400 when month format is invalid (YYYY-M)', async () => {
    adminOk();
    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-1`));
    expect(res.status).toBe(400);
  });

  it('returns 400 when month format is invalid (not a date)', async () => {
    adminOk();
    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=january`));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/reports — JSON response', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns aggregated rows and total for given month', async () => {
    adminOk();
    mockAssignmentFind.mockReturnValue(makeChain(FAKE_ASSIGNMENTS));

    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-01`));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.month).toBe('2025-01');
    expect(body.rows).toHaveLength(2);
    expect(body.total).toBe(350); // $200 + $150
    expect(body.rows[0].client).toBe('Client A');
    expect(body.rows[0].chargeAmount).toBe(200);
    expect(body.rows[1].provider).toBe('Provider Y');
  });

  it('filters by providerId when provided', async () => {
    adminOk();
    mockAssignmentFind.mockReturnValue(makeChain([FAKE_ASSIGNMENTS[0]]));

    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-01&providerId=p1`));
    expect(res.status).toBe(200);
    expect(mockAssignmentFind).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'p1' })
    );
  });

  it('returns empty rows and zero total when no data', async () => {
    adminOk();
    mockAssignmentFind.mockReturnValue(makeChain([]));

    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-06`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rows).toHaveLength(0);
    expect(body.total).toBe(0);
  });

  it('correctly maps invoiced status in rows', async () => {
    adminOk();
    mockAssignmentFind.mockReturnValue(makeChain(FAKE_ASSIGNMENTS));

    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-01`));
    const body = await res.json();
    expect(body.rows[0].invoiced).toBe(true);
    expect(body.rows[1].invoiced).toBe(false);
  });
});

describe('GET /api/admin/reports — Excel export', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns Excel content-type and attachment header', async () => {
    adminOk();
    mockAssignmentFind.mockReturnValue(makeChain(FAKE_ASSIGNMENTS));
    mockWriteBuffer.mockResolvedValue(Buffer.from('XLSX'));

    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2025-01&format=excel`));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('spreadsheetml.sheet');
    expect(res.headers.get('Content-Disposition')).toContain('report-2025-01.xlsx');
  });

  it('includes month in filename', async () => {
    adminOk();
    mockAssignmentFind.mockReturnValue(makeChain([]));
    mockWriteBuffer.mockResolvedValue(Buffer.from('XLSX'));

    const { GET } = await import('@/app/api/admin/reports/route');
    const res = await GET(makeRequest(`${BASE}?month=2024-12&format=excel`));
    expect(res.headers.get('Content-Disposition')).toContain('2024-12');
  });
});
