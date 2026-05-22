export type ImageFormat = 'jpeg' | 'png';

export interface AvatarResponse {
  avatarUrl: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface ParsedFile {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface ValidationResult {
  valid: boolean;
  format?: ImageFormat;
  error?: { code: string; message: string; statusCode: number };
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export const AvatarErrorCodes = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  INVALID_FILE_CONTENT: 'INVALID_FILE_CONTENT',
  MISSING_FILE: 'MISSING_FILE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
