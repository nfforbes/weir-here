/**
 * Unit tests for /api/admin/qualifications route (file upload → Google Drive)
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockUploadFileToDrive = jest.fn();
jest.mock('@/lib/googleDrive', () => ({
  uploadFileToDrive: (...a: unknown[]) => mockUploadFileToDrive(...a),
}));

const mockQualCreate = jest.fn();
const mockQualFindByIdAndDelete = jest.fn();

jest.mock('@/models/Qualification', () => ({
  __esModule: true,
  default: {
    create: (...a: unknown[]) => mockQualCreate(...a),
    findByIdAndDelete: (...a: unknown[]) => mockQualFindByIdAndDelete(...a),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminOk() {
  mockRequireAdministrator.mockResolvedValue({ ok: true });
}
function adminUnauthorized(status: 401 | 403 = 401) {
  mockRequireAdministrator.mockResolvedValue({ ok: false, status });
}

const BASE = 'https://example.com/api/admin/qualifications';

function makeFormDataRequest(fields: Record<string, string>, file?: { name: string; content: string; type: string }): NextRequest {
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  if (file) {
    const blob = new Blob([file.content], { type: file.type });
    formData.append('file', blob, file.name);
  }
  return new NextRequest(BASE, { method: 'POST', body: formData });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/admin/qualifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { POST } = await import('@/app/api/admin/qualifications/route');
    const req = makeFormDataRequest({ providerId: 'p1' }, { name: 'doc.pdf', content: 'data', type: 'application/pdf' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is provided', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/qualifications/route');
    // FormData without a file
    const req = makeFormDataRequest({ providerId: 'p1' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('No file provided');
  });

  it('returns 400 when providerId is missing', async () => {
    adminOk();
    const { POST } = await import('@/app/api/admin/qualifications/route');
    const req = makeFormDataRequest({}, { name: 'doc.pdf', content: 'data', type: 'application/pdf' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('providerId is required');
  });

  it('uploads to Drive and creates qualification record', async () => {
    adminOk();
    mockUploadFileToDrive.mockResolvedValue({ fileId: 'drive-id', webViewLink: 'https://drive.google.com/file/d/drive-id/view' });
    const createdQual = { _id: 'q1', providerId: 'p1', fileName: 'doc.pdf', driveFileId: 'drive-id' };
    mockQualCreate.mockResolvedValue(createdQual);

    const { POST } = await import('@/app/api/admin/qualifications/route');
    const req = makeFormDataRequest({ providerId: 'p1' }, { name: 'doc.pdf', content: '%PDF content', type: 'application/pdf' });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.driveFileId).toBe('drive-id');
    expect(mockUploadFileToDrive).toHaveBeenCalledWith(expect.any(Buffer), 'doc.pdf', 'application/pdf');
    expect(mockQualCreate).toHaveBeenCalledWith(expect.objectContaining({ providerId: 'p1', fileName: 'doc.pdf' }));
  });

  it('returns 500 when Drive upload fails', async () => {
    adminOk();
    mockUploadFileToDrive.mockRejectedValue(new Error('Google Drive is not configured. Please add credentials in Admin → Configuration.'));
    const { POST } = await import('@/app/api/admin/qualifications/route');
    const req = makeFormDataRequest({ providerId: 'p1' }, { name: 'doc.pdf', content: 'data', type: 'application/pdf' });
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain('Google Drive is not configured');
  });
});

describe('DELETE /api/admin/qualifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when id is missing', async () => {
    adminOk();
    const { DELETE } = await import('@/app/api/admin/qualifications/route');
    const req = new NextRequest(BASE, { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('deletes qualification and returns success', async () => {
    adminOk();
    mockQualFindByIdAndDelete.mockResolvedValue({});
    const { DELETE } = await import('@/app/api/admin/qualifications/route');
    const req = new NextRequest(`${BASE}?id=q1`, { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockQualFindByIdAndDelete).toHaveBeenCalledWith('q1');
  });
});
