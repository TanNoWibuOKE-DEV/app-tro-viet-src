-- ==============================================================================
-- Trọ Việt - Migration v8 Rollback (Phase 11: Deposit Escrows & Subscriptions)
-- ==============================================================================

DROP TABLE IF EXISTS landlord_subscriptions CASCADE;
DROP TABLE IF EXISTS deposit_escrows CASCADE;
