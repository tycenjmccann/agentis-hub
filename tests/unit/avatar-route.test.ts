import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({ send: vi.fn().mockResolvedValue({}) })),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue({ Item: {} }),
    }),
  },
  UpdateCommand: vi.fn(),
  GetCommand: vi.fn(),
}));

const TEST_SECRET = 'test-jwt-secret';

function createToken(sub: string): string {
  return jwt.sign({ sub }, TEST_SECRET);
}

function createMultipartBody(filename: string, content: Buffer): { body: Blob; contentType: string } {
  const boundary = '----TestBoundary123';
  const header =
    `------TestBoundary123\r\n` +
    `Content-Disposition: form-data; name="avatar"; filename="${filename}"\r\n` +
    `Content-Type: image/jpeg\r\n\r\n`;
  const footer = `\r\n------TestBoundary123--\r\n`;

  const body = Buffer.concat([Buffer.from(header), content, Buffer.from(footer)]);
  return { body: new Blob([body]), contentType: `multipart/form-data; boundary=----TestBoundary123` };
}

function createValidJpegBuffer(): Buffer {
  const buf = Buffer.alloc(20);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xe0;
  buf[4] = 0xff;
  buf[5] = 0xc0;
  buf.writeUInt16BE(17, 6);
  buf[8] = 8;
  buf.writeUInt16BE(200, 9);
  buf.writeUInt16BE(200, 11);
  return buf;
}

describe('POST /api/users/[userId]/avatar', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', TEST_SECRET);
    vi.stubEnv('AVATARS_BUCKET_NAME', 'test-bucket');
    vi.stubEnv('CDN_DOMAIN', 'cdn.example.com');
    vi.stubEnv('USERS_TABLE_NAME', 'test-table');
  });

  it('returns 401 without auth header', async () => {
    const { POST } = await import('@/app/api/users/[userId]/avatar/route');

    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=----test' },
    });

    const response = await POST(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('UNAUTHORIZED');
  });

  it('returns 401 when userId does not match token sub', async () => {
    const { POST } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('different-user');
    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'multipart/form-data; boundary=----test',
      },
    });

    const response = await POST(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('UNAUTHORIZED');
  });

  it('returns 400 for missing file', async () => {
    const { POST } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('user1');
    const emptyBody = new Blob([Buffer.from(`------TestBoundary123--\r\n`)]);

    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': `multipart/form-data; boundary=----TestBoundary123`,
      },
      body: emptyBody,
    });

    const response = await POST(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(400);
  });

  it('returns 413 for file too large', async () => {
    const { POST } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('user1');
    const largeContent = Buffer.alloc(5 * 1024 * 1024 + 1);
    largeContent[0] = 0xff;
    largeContent[1] = 0xd8;
    largeContent[2] = 0xff;

    const { body, contentType } = createMultipartBody('large.jpg', largeContent);

    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': contentType,
      },
      body,
    });

    const response = await POST(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(413);
  });

  it('returns 400 for non-image file with spoofed Content-Type', async () => {
    const { POST } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('user1');
    const textContent = Buffer.from('This is definitely not an image file');
    const { body, contentType } = createMultipartBody('malicious.jpg', textContent);

    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': contentType,
      },
      body,
    });

    const response = await POST(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('INVALID_FILE_CONTENT');
  });

  it('returns 200 with avatarUrl on success', async () => {
    const { POST } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('user1');
    const jpegBuffer = createValidJpegBuffer();
    const { body, contentType } = createMultipartBody('avatar.jpg', jpegBuffer);

    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': contentType,
      },
      body,
    });

    const response = await POST(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.avatarUrl).toMatch(/^https:\/\/cdn\.example\.com\/avatars\/user1\/\d+\.jpg$/);
  });
});

describe('DELETE /api/users/[userId]/avatar', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', TEST_SECRET);
    vi.stubEnv('AVATARS_BUCKET_NAME', 'test-bucket');
    vi.stubEnv('CDN_DOMAIN', 'cdn.example.com');
    vi.stubEnv('USERS_TABLE_NAME', 'test-table');
  });

  it('returns 401 without auth header', async () => {
    const { DELETE } = await import('@/app/api/users/[userId]/avatar/route');

    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(401);
  });

  it('returns 401 when userId does not match token sub', async () => {
    const { DELETE } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('attacker');
    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });

    const response = await DELETE(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(401);
  });

  it('returns 404 when user has no avatar', async () => {
    const { DELETE } = await import('@/app/api/users/[userId]/avatar/route');

    const token = createToken('user1');
    const request = new NextRequest('http://localhost/api/users/user1/avatar', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });

    const response = await DELETE(request, { params: { userId: 'user1' } });
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.error).toBe('NO_AVATAR');
  });
});
