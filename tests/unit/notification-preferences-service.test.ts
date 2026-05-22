import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationPreferencesService } from '@/lib/services/notification-preferences';
import { DbClient } from '@/lib/db';
import { DEFAULT_PREFERENCES } from '@/types/notifications';

describe('NotificationPreferencesService', () => {
  let mockDb: DbClient;
  let service: NotificationPreferencesService;

  beforeEach(() => {
    mockDb = {
      query: vi.fn(),
    };
    service = new NotificationPreferencesService(mockDb);
  });

  describe('getPreferences', () => {
    it('returns default preferences when no record exists', async () => {
      vi.mocked(mockDb.query).mockResolvedValue({ rows: [], rowCount: 0 } as any);

      const result = await service.getPreferences('user-123');

      expect(result).toEqual(DEFAULT_PREFERENCES);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['user-123']
      );
    });

    it('returns stored preferences when record exists', async () => {
      const updatedAt = new Date('2026-05-22T10:30:00.000Z');
      vi.mocked(mockDb.query).mockResolvedValue({
        rows: [
          {
            matches_enabled: false,
            messages_enabled: true,
            promotions_enabled: false,
            updated_at: updatedAt,
          },
        ],
        rowCount: 1,
      } as any);

      const result = await service.getPreferences('user-123');

      expect(result).toEqual({
        matches: false,
        messages: true,
        promotions: false,
        updatedAt: '2026-05-22T10:30:00.000Z',
      });
    });

    it('propagates database errors', async () => {
      vi.mocked(mockDb.query).mockRejectedValue(new Error('Connection failed'));

      await expect(service.getPreferences('user-123')).rejects.toThrow('Connection failed');
    });
  });

  describe('updatePreferences', () => {
    it('updates a single preference', async () => {
      const updatedAt = new Date('2026-05-22T10:35:00.000Z');
      vi.mocked(mockDb.query).mockResolvedValue({
        rows: [
          {
            matches_enabled: false,
            messages_enabled: true,
            promotions_enabled: true,
            updated_at: updatedAt,
          },
        ],
        rowCount: 1,
      } as any);

      const result = await service.updatePreferences('user-123', { matches: false });

      expect(result).toEqual({
        matches: false,
        messages: true,
        promotions: true,
        updatedAt: '2026-05-22T10:35:00.000Z',
      });

      // Verify UPSERT query was called with correct params
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        [
          'user-123',
          false,    // matches for INSERT default
          true,     // messages for INSERT default
          true,     // promotions for INSERT default
          false,    // matches for UPDATE (COALESCE)
          null,     // messages for UPDATE (null = no change)
          null,     // promotions for UPDATE (null = no change)
        ]
      );
    });

    it('updates multiple preferences', async () => {
      const updatedAt = new Date('2026-05-22T10:35:00.000Z');
      vi.mocked(mockDb.query).mockResolvedValue({
        rows: [
          {
            matches_enabled: false,
            messages_enabled: false,
            promotions_enabled: true,
            updated_at: updatedAt,
          },
        ],
        rowCount: 1,
      } as any);

      const result = await service.updatePreferences('user-123', {
        matches: false,
        messages: false,
      });

      expect(result).toEqual({
        matches: false,
        messages: false,
        promotions: true,
        updatedAt: '2026-05-22T10:35:00.000Z',
      });
    });

    it('updates all preferences', async () => {
      const updatedAt = new Date('2026-05-22T10:35:00.000Z');
      vi.mocked(mockDb.query).mockResolvedValue({
        rows: [
          {
            matches_enabled: false,
            messages_enabled: false,
            promotions_enabled: false,
            updated_at: updatedAt,
          },
        ],
        rowCount: 1,
      } as any);

      const result = await service.updatePreferences('user-123', {
        matches: false,
        messages: false,
        promotions: false,
      });

      expect(result).toEqual({
        matches: false,
        messages: false,
        promotions: false,
        updatedAt: '2026-05-22T10:35:00.000Z',
      });
    });

    it('propagates database errors', async () => {
      vi.mocked(mockDb.query).mockRejectedValue(new Error('Connection failed'));

      await expect(
        service.updatePreferences('user-123', { matches: false })
      ).rejects.toThrow('Connection failed');
    });
  });
});
