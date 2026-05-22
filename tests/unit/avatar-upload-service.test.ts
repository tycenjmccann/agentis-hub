import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarUploadService } from '@/lib/services/avatar-upload';
import { ParsedFile } from '@/types/avatar';

const mockSend = vi.fn();
const mockS3Client = { send: mockSend } as any;
const mockDynamoClient = { send: vi.fn() } as any;

const config = {
  bucket: 'test-bucket',
  tableName: 'test-users-table',
  cdnDomain: 'cdn.example.com',
};

describe('AvatarUploadService', () => {
  let service: AvatarUploadService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDynamoClient.send.mockResolvedValue({ Item: { avatarS3Key: 'avatars/user1/old.jpg' } });
    mockSend.mockResolvedValue({});
    service = new AvatarUploadService(mockS3Client, mockDynamoClient, config);
  });

  describe('uploadAvatar', () => {
    const file: ParsedFile = {
      buffer: Buffer.from('fake-image-data'),
      mimeType: 'image/jpeg',
      filename: 'photo.jpg',
    };

    it('returns CDN URL on successful upload', async () => {
      const url = await service.uploadAvatar('user123', file, 'jpeg');
      expect(url).toMatch(/^https:\/\/cdn\.example\.com\/avatars\/user123\/\d+\.jpg$/);
    });

    it('uploads to S3 with correct content type and cache-control', async () => {
      await service.uploadAvatar('user123', file, 'jpeg');
      const putCall = mockSend.mock.calls[0][0];
      expect(putCall.input.Bucket).toBe('test-bucket');
      expect(putCall.input.ContentType).toBe('image/jpeg');
      expect(putCall.input.CacheControl).toBe('public, max-age=86400, immutable');
      expect(putCall.input.Key).toMatch(/^avatars\/user123\/\d+\.jpg$/);
    });

    it('updates DynamoDB with correct attributes', async () => {
      await service.uploadAvatar('user123', file, 'jpeg');
      const updateCall = mockDynamoClient.send.mock.calls[1][0];
      expect(updateCall.input.TableName).toBe('test-users-table');
      expect(updateCall.input.Key).toEqual({ PK: 'USER#user123', SK: 'PROFILE' });
      expect(updateCall.input.ExpressionAttributeValues[':url']).toMatch(
        /^https:\/\/cdn\.example\.com\/avatars\/user123\/\d+\.jpg$/
      );
      expect(updateCall.input.ConditionExpression).toBe('attribute_exists(PK)');
    });

    it('deletes previous avatar from S3', async () => {
      await service.uploadAvatar('user123', file, 'jpeg');
      // Allow fire-and-forget to execute
      await new Promise((r) => setTimeout(r, 10));
      const deleteCall = mockSend.mock.calls[1][0];
      expect(deleteCall.input.Bucket).toBe('test-bucket');
      expect(deleteCall.input.Key).toBe('avatars/user1/old.jpg');
    });

    it('does not fail when previous avatar deletion fails', async () => {
      mockSend.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('S3 error'));
      const url = await service.uploadAvatar('user123', file, 'jpeg');
      expect(url).toBeDefined();
    });

    it('uses png extension for PNG format', async () => {
      const pngFile: ParsedFile = {
        buffer: Buffer.from('fake-png-data'),
        mimeType: 'image/png',
        filename: 'photo.png',
      };
      const url = await service.uploadAvatar('user123', pngFile, 'png');
      expect(url).toMatch(/\.png$/);
    });
  });

  describe('deleteAvatar', () => {
    it('returns deleted:false when user has no avatar', async () => {
      mockDynamoClient.send.mockResolvedValueOnce({ Item: {} });
      const result = await service.deleteAvatar('user123');
      expect(result.deleted).toBe(false);
    });

    it('deletes S3 object and clears DynamoDB on success', async () => {
      mockDynamoClient.send.mockResolvedValueOnce({
        Item: { avatarS3Key: 'avatars/user123/12345.jpg', avatarUrl: 'https://cdn.example.com/avatars/user123/12345.jpg' },
      });
      mockSend.mockResolvedValueOnce({});
      mockDynamoClient.send.mockResolvedValueOnce({});

      const result = await service.deleteAvatar('user123');
      expect(result.deleted).toBe(true);
      expect(result.previousKey).toBe('avatars/user123/12345.jpg');

      // Verify S3 delete was called
      expect(mockSend).toHaveBeenCalledTimes(1);
      const deleteCall = mockSend.mock.calls[0][0];
      expect(deleteCall.input.Bucket).toBe('test-bucket');
      expect(deleteCall.input.Key).toBe('avatars/user123/12345.jpg');

      // Verify DynamoDB update to clear fields
      const updateCall = mockDynamoClient.send.mock.calls[1][0];
      expect(updateCall.input.UpdateExpression).toContain('REMOVE avatarUrl, avatarS3Key');
    });

    it('propagates S3 errors', async () => {
      mockDynamoClient.send.mockResolvedValueOnce({
        Item: { avatarS3Key: 'avatars/user123/12345.jpg' },
      });
      mockSend.mockRejectedValueOnce(new Error('S3 delete failed'));

      await expect(service.deleteAvatar('user123')).rejects.toThrow('S3 delete failed');
    });
  });

  describe('parseMultipartBody', () => {
    it('extracts file from multipart body', async () => {
      const fileContent = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const body = Buffer.from(
        `------FormBoundary123\r\n` +
          `Content-Disposition: form-data; name="avatar"; filename="test.jpg"\r\n` +
          `Content-Type: image/jpeg\r\n\r\n` +
          fileContent.toString('binary') +
          `\r\n------FormBoundary123--\r\n`
      );

      const result = await service.parseMultipartBody(
        body,
        `multipart/form-data; boundary=----FormBoundary123`
      );

      expect(result.filename).toBe('test.jpg');
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.buffer.length).toBeGreaterThan(0);
    });
  });
});
