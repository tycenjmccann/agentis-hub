import { describe, it, expect } from 'vitest';
import { updatePreferencesSchema } from '@/lib/validators/notification-preferences';

describe('updatePreferencesSchema', () => {
  describe('valid inputs', () => {
    it('accepts a single boolean field (matches)', () => {
      const result = updatePreferencesSchema.safeParse({ matches: false });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual({ matches: false });
    });

    it('accepts a single boolean field (messages)', () => {
      const result = updatePreferencesSchema.safeParse({ messages: true });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual({ messages: true });
    });

    it('accepts a single boolean field (promotions)', () => {
      const result = updatePreferencesSchema.safeParse({ promotions: false });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual({ promotions: false });
    });

    it('accepts multiple fields', () => {
      const result = updatePreferencesSchema.safeParse({
        matches: true,
        messages: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ matches: true, messages: false });
      }
    });

    it('accepts all three fields', () => {
      const result = updatePreferencesSchema.safeParse({
        matches: false,
        messages: true,
        promotions: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          matches: false,
          messages: true,
          promotions: false,
        });
      }
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty object', () => {
      const result = updatePreferencesSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least one');
      }
    });

    it('rejects string values', () => {
      const result = updatePreferencesSchema.safeParse({ matches: 'true' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('boolean');
      }
    });

    it('rejects numeric values', () => {
      const result = updatePreferencesSchema.safeParse({ matches: 1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('boolean');
      }
    });

    it('rejects null values', () => {
      const result = updatePreferencesSchema.safeParse({ matches: null });
      expect(result.success).toBe(false);
    });

    it('rejects unknown fields (strict mode)', () => {
      const result = updatePreferencesSchema.safeParse({
        matches: true,
        unknown_field: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Unrecognized key');
      }
    });

    it('rejects non-object input', () => {
      const result = updatePreferencesSchema.safeParse('not an object');
      expect(result.success).toBe(false);
    });

    it('rejects array input', () => {
      const result = updatePreferencesSchema.safeParse([true, false]);
      expect(result.success).toBe(false);
    });
  });
});
