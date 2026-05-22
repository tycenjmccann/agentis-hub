export interface NotificationPreferences {
  matches: boolean;
  messages: boolean;
  promotions: boolean;
}

export interface PreferencesResponse extends NotificationPreferences {
  updatedAt: string | null;
}

export interface PreferenceItemConfig {
  id: keyof NotificationPreferences;
  label: string;
  description: string;
}
