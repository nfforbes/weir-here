/**
 * Unit tests for /api/admin/invoices/[id] route
 *
 * Tests JSON mode and PDF generation mode, auth, 404 handling, and
 * that the assignment is marked as invoiced after PDF download.
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockGenerateInvoicePdf = jest.fn();
jest.mock('@/lib/invoicePdf', () => ({
  generateInvoicePdf: (...a: unknown[]) => mockGenerateInvoicePdf(...a),
}));

const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();

jest.mock('@/models/Assignment', () => ({
  __esModule: true,
  default: {
    findById: (...a: unknown[]) => mockFindById(...a),
    findByIdAndUpdate: (...a: unknown[]) => mockFindByIdAndUpdate(...a),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminOk() {
  mockRequireAdministrator.mockResolvedValue({ ok: true });
}
function adminUnauthorized(status: 401 | 403 = 401) {
  mockRequireAdministrator.mockResolvedValue({ ok: false, status });
}

const ASSIGNMENT_ID = 'abc123def456';
const BASE = `https://example.com/api/admin/invoices/${ASSIGNMENT_ID}`;

const FAKE_ASSIGNMENT = {
  _id: ASSIGNMENT_ID,
  clientId: { _id: 'c1', name: 'Client A', address: '1 Main St' },
  providerId: { _id: 'p1', name: 'Provider A' },
  clientChargeCents: 15000,
  providerPayCents: 10000,
  description: 'Home care services',
  serviceDate: new Date('2025-03-10'),
  invoiced: false,
};

function makePopulateChain(result: unknown) {
  return {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

function makeRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/invoices/[id] — JSON format', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/invoices/[id]/route');
    const res = await GET(makeRequest(BASE), { params: Promise.resolve({ id: ASSIGNMENT_ID }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when assignment not found', async () => {
    adminOk();
    mockFindById.mockReturnValue(makePopulateChain(null));
    const { GET } = await import('@/app/api/admin/invoices/[id]/route');
    const res = await GET(makeRequest(BASE), { params: Promise.resolve({ id: ASSIGNMENT_ID }) });
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('Assignment not found');
  });

  it('returns invoice JSON with invoiceNumber field', async () => {
    adminOk();
    mockFindById.mockReturnValue(makePopulateChain(FAKE_ASSIGNMENT));
    const { GET } = await import('@/app/api/admin/invoices/[id]/route');
    const res = await GET(makeRequest(BASE), { params: Promise.resolve({ id: ASSIGNMENT_ID }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.invoiceNumber).toMatch(/^INV-/);
    expect(body.clientChargeCents).toBe(15000);
  });
});

describe('GET /api/admin/invoices/[id] — PDF format', () => {
  beforeEach(() => jest.clearAllMocks());

  it('generates PDF, marks assignment as invoiced, returns PDF content-type', async () => {
    adminOk();
    mockFindById.mockReturnValue(makePopulateChain(FAKE_ASSIGNMENT));
    mockFindByIdAndUpdate.mockResolvedValue({});

    const fakePdfBuffer = Buffer.from('%PDF-1.4 fake content');
    mockGenerateInvoicePdf.mockResolvedValue(fakePdfBuffer);

    const { GET } = await import('@/app/api/admin/invoices/[id]/route');
    const res = await GET(
      makeRequest(`${BASE}?format=pdf`),
      { params: Promise.resolve({ id: ASSIGNMENT_ID }) }
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('attachment');
    expect(res.headers.get('Content-Disposition')).toContain('.pdf');

    // Should mark as invoiced
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(ASSIGNMENT_ID, { invoiced: true });
  });

  it('passes correct invoice data to PDF generator', async () => {
    adminOk();
    mockFindById.mockReturnValue(makePopulateChain(FAKE_ASSIGNMENT));
    mockFindByIdAndUpdate.mockResolvedValue({});
    mockGenerateInvoicePdf.mockResolvedValue(Buffer.from('pdf'));

    const { GET } = await import('@/app/api/admin/invoices/[id]/route');
    await GET(makeRequest(`${BASE}?format=pdf`), { params: Promise.resolve({ id: ASSIGNMENT_ID }) });

    expect(mockGenerateInvoicePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        clientName: 'Client A',
        clientAddress: '1 Main St',
        providerName: 'Provider A',
        amountDollars: 150, // 15000 cents → $150.00
        description: 'Home care services',
      })
    );
  });

  it('returns 401 when not authenticated in PDF mode', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/invoices/[id]/route');
    const res = await GET(
      makeRequest(`${BASE}?format=pdf`),
      { params: Promise.resolve({ id: ASSIGNMENT_ID }) }
    );
    expect(res.status).toBe(401);
  });
});
