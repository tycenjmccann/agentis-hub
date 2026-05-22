import { NextRequest, NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { authenticateRequest } from '@/lib/auth';
import { validateAvatarFile } from '@/lib/validators/avatar';
import { AvatarUploadService } from '@/lib/services/avatar-upload';
import { AvatarErrorCodes, ErrorResponse } from '@/types/avatar';

const region = process.env.AWS_REGION || 'us-east-1';

const s3Client = new S3Client({ region });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

const service = new AvatarUploadService(s3Client, dynamoClient, {
  bucket: process.env.AVATARS_BUCKET_NAME || '',
  tableName: process.env.USERS_TABLE_NAME || '',
  cdnDomain: process.env.CDN_DOMAIN || '',
});

/**
 * POST /api/users/{userId}/avatar
 *
 * Upload a profile avatar image. Validates JWT, ownership (IDOR prevention),
 * file type (magic bytes), size (5MB max), and dimensions (4096x4096 max).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  // 1. Authenticate
  const auth = authenticateRequest(request);
  if (auth.error) {
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.UNAUTHORIZED, message: auth.error.message },
      { status: 401 }
    );
  }

  // 2. Authorize — IDOR prevention (SEC-AUTH-02)
  if (auth.user.userId !== userId) {
    console.warn('IDOR attempt: token sub does not match userId param', {
      tokenSub: auth.user.userId,
      paramUserId: userId,
    });
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.UNAUTHORIZED, message: 'You are not authorized to modify this user\'s avatar.' },
      { status: 401 }
    );
  }

  // 3. Validate content type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.INVALID_FILE_TYPE, message: 'Request must be multipart/form-data' },
      { status: 400 }
    );
  }

  // 4. Parse multipart body
  let parsedFile;
  try {
    const body = await request.arrayBuffer();
    parsedFile = await service.parseMultipartBody(Buffer.from(body), contentType);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse upload';
    if (message === AvatarErrorCodes.MISSING_FILE) {
      return NextResponse.json<ErrorResponse>(
        { error: AvatarErrorCodes.MISSING_FILE, message: 'Request must include a \'file\' field with an image attachment.' },
        { status: 400 }
      );
    }
    console.error('Multipart parse error:', { userId, error: message });
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.INVALID_FILE_TYPE, message },
      { status: 400 }
    );
  }

  // 5. Validate file (magic bytes, size, dimensions)
  const validation = validateAvatarFile(parsedFile.buffer);
  if (!validation.valid) {
    console.warn('Avatar validation failed:', {
      userId,
      code: validation.error!.code,
      fileSize: parsedFile.buffer.length,
      firstBytes: parsedFile.buffer.subarray(0, 8).toString('hex'),
    });
    return NextResponse.json<ErrorResponse>(
      { error: validation.error!.code, message: validation.error!.message },
      { status: validation.error!.statusCode }
    );
  }

  // 6. Upload and update record
  try {
    const avatarUrl = await service.uploadAvatar(userId, parsedFile, validation.format!);
    return NextResponse.json({ avatarUrl }, { status: 200 });
  } catch (err) {
    console.error('Avatar upload failed:', { userId, error: err });
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.INTERNAL_ERROR, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/{userId}/avatar
 *
 * Remove the user's avatar from S3 and clear the profile field.
 * Returns 204 on success, 404 if no avatar exists.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  // 1. Authenticate
  const auth = authenticateRequest(request);
  if (auth.error) {
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.UNAUTHORIZED, message: auth.error.message },
      { status: 401 }
    );
  }

  // 2. Authorize — IDOR prevention
  if (auth.user.userId !== userId) {
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.UNAUTHORIZED, message: 'You are not authorized to modify this user\'s avatar.' },
      { status: 401 }
    );
  }

  // 3. Delete avatar
  try {
    const result = await service.deleteAvatar(userId);

    if (!result.deleted) {
      return NextResponse.json<ErrorResponse>(
        { error: AvatarErrorCodes.NO_AVATAR, message: 'User does not have a custom avatar to delete.' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Avatar delete failed:', { userId, error: err });
    return NextResponse.json<ErrorResponse>(
      { error: AvatarErrorCodes.INTERNAL_ERROR, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
