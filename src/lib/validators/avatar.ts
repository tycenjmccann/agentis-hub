import { ImageFormat, ValidationResult } from '@/types/avatar';
import { AvatarErrorCodes } from '@/types/avatar';
import { ImageDimensions } from '@/types/avatar';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_DIMENSION = 4096;

export const MAGIC_BYTES = {
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
} as const;

/**
 * Detects image format by reading magic bytes at the start of the buffer.
 * Returns null if format is not recognized.
 */
export function detectImageFormat(buffer: Buffer): ImageFormat | null {
  if (buffer.length < 8) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  return null;
}

/**
 * Reads image dimensions from buffer headers without full image decode.
 * PNG: reads IHDR chunk (offset 16-23).
 * JPEG: scans for SOF0 (FF C0) or SOF2 (FF C2) marker.
 */
export function getImageDimensions(buffer: Buffer, format: ImageFormat): ImageDimensions {
  if (format === 'png') {
    if (buffer.length < 24) {
      return { width: 0, height: 0 };
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // JPEG: scan for SOF0 (FF C0) or SOF2 (FF C2) marker
  for (let i = 0; i < buffer.length - 9; i++) {
    if (buffer[i] === 0xff && (buffer[i + 1] === 0xc0 || buffer[i + 1] === 0xc2)) {
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      return { width, height };
    }
  }

  return { width: 0, height: 0 };
}

/**
 * Validates an avatar file buffer for upload.
 * Checks: file size, magic bytes (format detection), image dimensions.
 */
export function validateAvatarFile(buffer: Buffer): ValidationResult {
  // 1. Size check
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        code: AvatarErrorCodes.FILE_TOO_LARGE,
        message: 'File size exceeds the maximum allowed size of 5MB.',
        statusCode: 413,
      },
    };
  }

  // 2. Magic byte check
  const format = detectImageFormat(buffer);
  if (!format) {
    return {
      valid: false,
      error: {
        code: AvatarErrorCodes.INVALID_FILE_CONTENT,
        message: 'File content does not match expected format (magic byte verification failed).',
        statusCode: 400,
      },
    };
  }

  // 3. Dimension check (decompression bomb protection)
  const dimensions = getImageDimensions(buffer, format);
  if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
    return {
      valid: false,
      error: {
        code: AvatarErrorCodes.INVALID_FILE_CONTENT,
        message: `Image dimensions exceed maximum of ${MAX_DIMENSION}x${MAX_DIMENSION}.`,
        statusCode: 400,
      },
    };
  }

  if (dimensions.width === 0 || dimensions.height === 0) {
    return {
      valid: false,
      error: {
        code: AvatarErrorCodes.INVALID_FILE_CONTENT,
        message: 'Unable to read image dimensions. File may be corrupted.',
        statusCode: 400,
      },
    };
  }

  return { valid: true, format };
}
