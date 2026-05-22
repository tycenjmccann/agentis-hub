/**
 * Database row shape for notification_preferences table.
 */
export interface NotificationPreferencesRow {
  id: string;
  user_id: string;
  matches_enabled: boolean;
  messages_enabled: boolean;
  promotions_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * API response shape for notification preferences.
 */
export interface PreferencesResponse {
  matches: boolean;
  messages: boolean;
  promotions: boolean;
  updatedAt: string | null;
}

/**
 * Request body shape for updating preferences.
 */
export interface UpdatePreferencesRequest {
  matches?: boolean;
  messages?: boolean;
  promotions?: boolean;
}

/**
 * Default preferences for new users (all notifications enabled).
 */
export const DEFAULT_PREFERENCES: PreferencesResponse = {
  matches: true,
  messages: true,
  promotions: true,
  updatedAt: null,
};
