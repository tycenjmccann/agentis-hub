import { DbClient } from '@/lib/db';
import {
  NotificationPreferencesRow,
  PreferencesResponse,
  UpdatePreferencesRequest,
  DEFAULT_PREFERENCES,
} from '@/types/notifications';

/**
 * Service layer for notification preferences.
 * Handles business logic, defaults, and database interaction.
 */
export class NotificationPreferencesService {
  constructor(private readonly db: DbClient) {}

  /**
   * Get notification preferences for a user.
   * Returns defaults (all true) if no record exists (lazy-create pattern).
   */
  async getPreferences(userId: string): Promise<PreferencesResponse> {
    const result = await this.db.query<NotificationPreferencesRow>(
      'SELECT matches_enabled, messages_enabled, promotions_enabled, updated_at FROM notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { ...DEFAULT_PREFERENCES };
    }

    const row = result.rows[0];
    return {
      matches: row.matches_enabled,
      messages: row.messages_enabled,
      promotions: row.promotions_enabled,
      updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
    };
  }

  /**
   * Update notification preferences for a user using UPSERT semantics.
   * Creates the record if it doesn't exist, updates if it does.
   * Only fields present in the updates object are changed.
   */
  async updatePreferences(
    userId: string,
    updates: UpdatePreferencesRequest
  ): Promise<PreferencesResponse> {
    const result = await this.db.query<NotificationPreferencesRow>(
      `INSERT INTO notification_preferences (user_id, matches_enabled, messages_enabled, promotions_enabled)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         matches_enabled = COALESCE($5, notification_preferences.matches_enabled),
         messages_enabled = COALESCE($6, notification_preferences.messages_enabled),
         promotions_enabled = COALESCE($7, notification_preferences.promotions_enabled),
         updated_at = NOW()
       RETURNING matches_enabled, messages_enabled, promotions_enabled, updated_at`,
      [
        userId,
        updates.matches ?? true,
        updates.messages ?? true,
        updates.promotions ?? true,
        updates.matches ?? null,
        updates.messages ?? null,
        updates.promotions ?? null,
      ]
    );

    const row = result.rows[0];
    return {
      matches: row.matches_enabled,
      messages: row.messages_enabled,
      promotions: row.promotions_enabled,
      updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
    };
  }
}
