-- Rollback: 001_create_notification_preferences_rollback.sql
-- Drops the notification_preferences table and associated objects.

DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
DROP FUNCTION IF EXISTS update_notification_preferences_updated_at();
DROP TABLE IF EXISTS notification_preferences;
