import { describe, it, expect } from 'vitest';
import {
  detectImageFormat,
  getImageDimensions,
  validateAvatarFile,
  MAX_FILE_SIZE,
} from '@/lib/validators/avatar';

function createValidPng(width: number, height: number): Buffer {
  const buf = Buffer.alloc(28);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  Buffer.from('IHDR').copy(buf, 12);
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  buf[24] = 8;
  buf[25] = 2;
  return buf;
}

function createValidJpeg(width: number, height: number): Buffer {
  const buf = Buffer.alloc(20);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xe0;
  buf[4] = 0xff;
  buf[5] = 0xc0;
  buf.writeUInt16BE(17, 6);
  buf[8] = 8;
  buf.writeUInt16BE(height, 9);
  buf.writeUInt16BE(width, 11);
  return buf;
}

describe('detectImageFormat', () => {
  it('detects valid JPEG magic bytes', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00]);
    expect(detectImageFormat(jpeg)).toBe('jpeg');
  });

  it('detects valid PNG magic bytes', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(detectImageFormat(png)).toBe('png');
  });

  it('returns null for invalid bytes', () => {
    const invalid = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
    expect(detectImageFormat(invalid)).toBeNull();
  });

  it('returns null for buffer too small', () => {
    const small = Buffer.from([0xff, 0xd8]);
    expect(detectImageFormat(small)).toBeNull();
  });

  it('returns null for GIF files (not allowed)', () => {
    const gif = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00]);
    expect(detectImageFormat(gif)).toBeNull();
  });

  it('returns null for SVG-like content (not allowed)', () => {
    const svg = Buffer.from('<svg xmlns', 'utf-8');
    expect(detectImageFormat(svg)).toBeNull();
  });
});

describe('getImageDimensions', () => {
  it('correctly reads PNG dimensions', () => {
    const png = createValidPng(800, 600);
    const dims = getImageDimensions(png, 'png');
    expect(dims.width).toBe(800);
    expect(dims.height).toBe(600);
  });

  it('correctly reads JPEG dimensions', () => {
    const jpeg = createValidJpeg(1024, 768);
    const dims = getImageDimensions(jpeg, 'jpeg');
    expect(dims.width).toBe(1024);
    expect(dims.height).toBe(768);
  });

  it('returns 0x0 for PNG buffer too small', () => {
    const buf = Buffer.alloc(10);
    const dims = getImageDimensions(buf, 'png');
    expect(dims.width).toBe(0);
    expect(dims.height).toBe(0);
  });

  it('returns 0x0 for JPEG without SOF marker', () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00]);
    const dims = getImageDimensions(buf, 'jpeg');
    expect(dims.width).toBe(0);
    expect(dims.height).toBe(0);
  });
});

describe('validateAvatarFile', () => {
  it('rejects files > 5MB', () => {
    const large = Buffer.alloc(MAX_FILE_SIZE + 1);
    const result = validateAvatarFile(large);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('FILE_TOO_LARGE');
    expect(result.error?.statusCode).toBe(413);
  });

  it('rejects non-image files', () => {
    const textFile = Buffer.from('This is not an image file at all');
    const result = validateAvatarFile(textFile);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('INVALID_FILE_CONTENT');
  });

  it('rejects files with spoofed Content-Type (text file with .jpg extension)', () => {
    const fakeJpeg = Buffer.alloc(100);
    fakeJpeg.write('Not a real JPEG', 0);
    const result = validateAvatarFile(fakeJpeg);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('INVALID_FILE_CONTENT');
  });

  it('rejects oversized dimensions', () => {
    const png = createValidPng(5000, 5000);
    const result = validateAvatarFile(png);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('INVALID_FILE_CONTENT');
    expect(result.error?.message).toContain('dimensions');
  });

  it('accepts valid JPEG', () => {
    const jpeg = createValidJpeg(200, 200);
    const result = validateAvatarFile(jpeg);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('jpeg');
  });

  it('accepts valid PNG', () => {
    const png = createValidPng(256, 256);
    const result = validateAvatarFile(png);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('png');
  });

  it('accepts PNG at maximum dimension boundary', () => {
    const png = createValidPng(4096, 4096);
    const result = validateAvatarFile(png);
    expect(result.valid).toBe(true);
  });

  it('rejects PNG just over maximum dimension', () => {
    const png = createValidPng(4097, 4096);
    const result = validateAvatarFile(png);
    expect(result.valid).toBe(false);
  });
});
