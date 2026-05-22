-- Migration: 001_create_notification_preferences.sql
-- Creates the notification_preferences table for storing per-user push notification settings.
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    matches_enabled     BOOLEAN     NOT NULL DEFAULT TRUE,
    messages_enabled    BOOLEAN     NOT NULL DEFAULT TRUE,
    promotions_enabled  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_user_id
    ON notification_preferences(user_id);

-- Trigger to auto-update updated_at on modification
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;

CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();
