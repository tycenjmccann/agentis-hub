import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import Busboy from 'busboy';
import { ParsedFile, ImageFormat } from '@/types/avatar';
import { AvatarErrorCodes } from '@/types/avatar';
import { Readable } from 'stream';

const PROCESSING_TIMEOUT_MS = 30_000;
const MAX_FILE_FIELDS = 1;

export interface AvatarUploadConfig {
  bucket: string;
  tableName: string;
  cdnDomain: string;
}

/**
 * Service layer for avatar upload operations.
 * Handles multipart parsing, S3 upload, DynamoDB update, and previous avatar cleanup.
 */
export class AvatarUploadService {
  constructor(
    private s3Client: S3Client,
    private dynamoClient: DynamoDBDocumentClient,
    private config: AvatarUploadConfig
  ) {}

  /**
   * Parse a multipart/form-data body and extract the uploaded file.
   * Enforces single-file-field limit (SEC-VAL-10).
   * Enforces processing timeout (SF-6).
   */
  async parseMultipartBody(
    body: Buffer | ReadableStream<Uint8Array>,
    contentType: string
  ): Promise<ParsedFile> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Processing timeout exceeded'));
      }, PROCESSING_TIMEOUT_MS);

      const busboy = Busboy({
        headers: { 'content-type': contentType },
        limits: { files: MAX_FILE_FIELDS + 1, fileSize: 6 * 1024 * 1024 },
      });

      let fileCount = 0;
      let resolved = false;

      busboy.on('file', (_fieldname, stream, info) => {
        fileCount++;

        if (fileCount > MAX_FILE_FIELDS) {
          clearTimeout(timeout);
          stream.resume();
          if (!resolved) {
            resolved = true;
            reject(new Error('Multiple file fields not allowed'));
          }
          return;
        }

        const chunks: Buffer[] = [];

        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        stream.on('end', () => {
          if (resolved) return;
          clearTimeout(timeout);
          resolved = true;
          resolve({
            buffer: Buffer.concat(chunks),
            mimeType: info.mimeType,
            filename: info.filename,
          });
        });

        stream.on('error', (err) => {
          if (resolved) return;
          clearTimeout(timeout);
          resolved = true;
          reject(err);
        });
      });

      busboy.on('finish', () => {
        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          reject(new Error(AvatarErrorCodes.MISSING_FILE));
        }
      });

      busboy.on('error', (err) => {
        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          reject(err);
        }
      });

      // Pipe input to busboy
      if (Buffer.isBuffer(body)) {
        const readable = Readable.from(body);
        readable.pipe(busboy);
      } else {
        const reader = (body as ReadableStream<Uint8Array>).getReader();
        const readable = new Readable({
          async read() {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(Buffer.from(value));
            }
          },
        });
        readable.pipe(busboy);
      }
    });
  }

  /**
   * Upload avatar to S3 and update DynamoDB user record.
   * Generates server-side S3 key (SEC-VAL-08).
   * Deletes previous avatar best-effort (non-blocking).
   */
  async uploadAvatar(userId: string, file: ParsedFile, format: ImageFormat): Promise<string> {
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const s3Key = `avatars/${userId}/${Date.now()}.${ext}`;
    const contentType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

    // Upload to S3
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: contentType,
      })
    );

    const cdnUrl = `https://${this.config.cdnDomain}/${s3Key}`;

    // Get previous avatar key for cleanup
    let previousKey: string | undefined;
    try {
      const getResult = await this.dynamoClient.send(
        new GetCommand({
          TableName: this.config.tableName,
          Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
          ProjectionExpression: 'avatarS3Key',
        })
      );
      previousKey = getResult.Item?.avatarS3Key;
    } catch (err) {
      console.error('Failed to get previous avatar key:', err);
    }

    // Update DynamoDB user record
    await this.dynamoClient.send(
      new UpdateCommand({
        TableName: this.config.tableName,
        Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
        UpdateExpression: 'SET avatarUrl = :url, avatarS3Key = :key, updatedAt = :now',
        ExpressionAttributeValues: {
          ':url': cdnUrl,
          ':key': s3Key,
          ':now': new Date().toISOString(),
        },
        ConditionExpression: 'attribute_exists(PK)',
      })
    );

    // Delete previous avatar (best-effort, fire-and-forget)
    if (previousKey) {
      this.s3Client
        .send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: previousKey }))
        .catch((err) => console.error('Failed to delete previous avatar:', err));
    }

    return cdnUrl;
  }
}
