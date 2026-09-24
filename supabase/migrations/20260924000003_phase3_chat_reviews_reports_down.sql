-- ==============================================================================
-- Trọ Việt - Migration v3 Rollback (Phase 3)
-- ==============================================================================

DROP POLICY IF EXISTS "Landlords reply to reviews on their listings" ON reviews;
DROP POLICY IF EXISTS "Tenants create conversations" ON conversations;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users read own notifications" ON notifications;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
