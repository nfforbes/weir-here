/**
 * Unit tests for /api/admin/configuration route
 *
 * Verifies that:
 * - Auth is enforced for GET and POST
 * - GET returns masked secrets
 * - POST saves only allowed keys and skips masked placeholder values
 */

import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRequireAdministrator = jest.fn();
jest.mock('@/lib/adminAuth', () => ({
  requireAdministrator: () => mockRequireAdministrator(),
}));

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));

const mockConfigFind = jest.fn();
const mockConfigFindOneAndUpdate = jest.fn();

jest.mock('@/models/Config', () => ({
  __esModule: true,
  default: {
    find: (...a: unknown[]) => mockConfigFind(...a),
    findOneAndUpdate: (...a: unknown[]) => mockConfigFindOneAndUpdate(...a),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminOk() {
  mockRequireAdministrator.mockResolvedValue({ ok: true });
}
function adminUnauthorized(status: 401 | 403 = 401) {
  mockRequireAdministrator.mockResolvedValue({ ok: false, status });
}

function makeRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest('https://example.com/api/admin/configuration', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/configuration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { GET } = await import('@/app/api/admin/configuration/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns plain value for non-secret keys', async () => {
    adminOk();
    mockConfigFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { key: 'gdrive_client_id', value: 'my-client-id' },
        { key: 'gdrive_folder_id', value: 'folder-xyz' },
      ]),
    });

    const { GET } = await import('@/app/api/admin/configuration/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.gdrive_client_id).toBe('my-client-id');
    expect(body.gdrive_folder_id).toBe('folder-xyz');
  });

  it('masks gdrive_client_secret and gdrive_refresh_token', async () => {
    adminOk();
    mockConfigFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { key: 'gdrive_client_secret', value: 'super-secret' },
        { key: 'gdrive_refresh_token', value: 'refresh-token-value' },
      ]),
    });

    const { GET } = await import('@/app/api/admin/configuration/route');
    const res = await GET();
    const body = await res.json();
    expect(body.gdrive_client_secret).toBe('••••••••');
    expect(body.gdrive_refresh_token).toBe('••••••••');
  });

  it('returns empty string for keys with empty value', async () => {
    adminOk();
    mockConfigFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { key: 'gdrive_client_secret', value: '' },
      ]),
    });

    const { GET } = await import('@/app/api/admin/configuration/route');
    const res = await GET();
    const body = await res.json();
    expect(body.gdrive_client_secret).toBe('');
  });
});

describe('POST /api/admin/configuration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    adminUnauthorized(401);
    const { POST } = await import('@/app/api/admin/configuration/route');
    const res = await POST(makeRequest('POST', { gdrive_client_id: 'abc' }));
    expect(res.status).toBe(401);
  });

  it('saves valid keys and returns success', async () => {
    adminOk();
    mockConfigFindOneAndUpdate.mockResolvedValue({});
    const { POST } = await import('@/app/api/admin/configuration/route');
    const res = await POST(makeRequest('POST', {
      gdrive_client_id: 'client-id-value',
      gdrive_folder_id: 'folder-id-value',
    }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockConfigFindOneAndUpdate).toHaveBeenCalledWith(
      { key: 'gdrive_client_id' },
      { value: 'client-id-value' },
      { upsert: true, new: true }
    );
  });

  it('skips keys whose value is the masked placeholder', async () => {
    adminOk();
    mockConfigFindOneAndUpdate.mockResolvedValue({});
    const { POST } = await import('@/app/api/admin/configuration/route');
    await POST(makeRequest('POST', {
      gdrive_client_id: 'new-id',
      gdrive_client_secret: '••••••••', // should be skipped
    }));
    // Should have been called once (for client_id), not twice
    expect(mockConfigFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockConfigFindOneAndUpdate).not.toHaveBeenCalledWith(
      { key: 'gdrive_client_secret' },
      expect.anything(),
      expect.anything()
    );
  });
});
