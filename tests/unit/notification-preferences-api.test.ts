import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing route handlers
vi.mock('@/lib/db', () => ({
  default: { query: vi.fn() },
  db: { query: vi.fn() },
}));

vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn(),
}));

import { GET, PUT } from '@/app/api/notifications/preferences/route';
import { authenticateRequest } from '@/lib/auth';
import db from '@/lib/db';

const mockAuth = vi.mocked(authenticateRequest);
const mockQuery = vi.mocked(db.query);

function createRequest(method: string, body?: unknown): NextRequest {
  const url = 'http://localhost:3000/api/notifications/preferences';
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(url, init as any);
}

describe('GET /api/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });

    const response = await GET(createRequest('GET'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns default preferences for new user', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as any);

    const response = await GET(createRequest('GET'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      matches: true,
      messages: true,
      promotions: true,
      updatedAt: null,
    });
  });

  it('returns stored preferences for existing user', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });
    mockQuery.mockResolvedValue({
      rows: [
        {
          matches_enabled: false,
          messages_enabled: true,
          promotions_enabled: false,
          updated_at: new Date('2026-05-22T10:30:00.000Z'),
        },
      ],
      rowCount: 1,
    } as any);

    const response = await GET(createRequest('GET'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      matches: false,
      messages: true,
      promotions: false,
      updatedAt: '2026-05-22T10:30:00.000Z',
    });
  });

  it('returns 500 on database error', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });
    mockQuery.mockRejectedValue(new Error('DB connection failed'));

    const response = await GET(createRequest('GET'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });

    const response = await PUT(createRequest('PUT', { matches: false }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('updates a single preference successfully', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });
    mockQuery.mockResolvedValue({
      rows: [
        {
          matches_enabled: false,
          messages_enabled: true,
          promotions_enabled: true,
          updated_at: new Date('2026-05-22T10:35:00.000Z'),
        },
      ],
      rowCount: 1,
    } as any);

    const response = await PUT(createRequest('PUT', { matches: false }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      matches: false,
      messages: true,
      promotions: true,
      updatedAt: '2026-05-22T10:35:00.000Z',
    });
  });

  it('updates multiple preferences successfully', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });
    mockQuery.mockResolvedValue({
      rows: [
        {
          matches_enabled: false,
          messages_enabled: false,
          promotions_enabled: true,
          updated_at: new Date('2026-05-22T10:35:00.000Z'),
        },
      ],
      rowCount: 1,
    } as any);

    const response = await PUT(createRequest('PUT', { matches: false, messages: false }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matches).toBe(false);
    expect(data.messages).toBe(false);
    expect(data.promotions).toBe(true);
  });

  it('returns 400 for empty body', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });

    const response = await PUT(createRequest('PUT', {}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('at least one');
  });

  it('returns 400 for non-boolean values', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });

    const response = await PUT(createRequest('PUT', { matches: 'true' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toBeDefined();
  });

  it('returns 400 for unknown fields', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });

    const response = await PUT(createRequest('PUT', { matches: true, extra: true }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });

    const url = 'http://localhost:3000/api/notifications/preferences';
    const request = new NextRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: 'not valid json{{{',
    } as any);

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('Invalid JSON');
  });

  it('returns 500 on database error', async () => {
    mockAuth.mockReturnValue({ user: { userId: 'user-123' } });
    mockQuery.mockRejectedValue(new Error('DB connection failed'));

    const response = await PUT(createRequest('PUT', { matches: false }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});
