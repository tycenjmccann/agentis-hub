import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticateRequest } from '@/lib/auth';

// Set JWT_SECRET for testing
vi.stubEnv('JWT_SECRET', 'test-secret-key');

describe('authenticateRequest', () => {
  function createRequest(authHeader?: string): NextRequest {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    return new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
      headers,
    });
  }

  it('returns error when no Authorization header is present', () => {
    const result = authenticateRequest(createRequest());
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
    expect(result.error!.message).toBe('Authentication required');
  });

  it('returns error when Authorization header does not start with Bearer', () => {
    const result = authenticateRequest(createRequest('Basic abc123'));
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
  });

  it('returns error when token is empty', () => {
    const result = authenticateRequest(createRequest('Bearer '));
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
  });

  it('returns error for invalid token', () => {
    const result = authenticateRequest(createRequest('Bearer invalid-token'));
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
    expect(result.error!.message).toBe('Invalid or expired token');
  });

  it('returns error for expired token', () => {
    const token = jwt.sign({ sub: 'user-123' }, 'test-secret-key', { expiresIn: '-1h' });
    const result = authenticateRequest(createRequest(`Bearer ${token}`));
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
  });

  it('returns error when token has no sub claim', () => {
    const token = jwt.sign({ name: 'test' }, 'test-secret-key', { expiresIn: '1h' });
    const result = authenticateRequest(createRequest(`Bearer ${token}`));
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
    expect(result.error!.message).toBe('Invalid token: missing subject');
  });

  it('returns user for valid token', () => {
    const token = jwt.sign({ sub: 'user-123' }, 'test-secret-key', { expiresIn: '1h' });
    const result = authenticateRequest(createRequest(`Bearer ${token}`));
    expect(result.user).toBeDefined();
    expect(result.user!.userId).toBe('user-123');
  });

  it('returns error for token signed with wrong secret', () => {
    const token = jwt.sign({ sub: 'user-123' }, 'wrong-secret', { expiresIn: '1h' });
    const result = authenticateRequest(createRequest(`Bearer ${token}`));
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('UNAUTHORIZED');
  });
});
