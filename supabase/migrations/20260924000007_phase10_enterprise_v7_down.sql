-- ==============================================================================
-- Trọ Việt - Rollback Migration v7 (Phase 10: Push Tokens, Bank Transactions & eKYC)
-- ==============================================================================

DROP TABLE IF EXISTS ekyc_verifications CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS push_tokens CASCADE;
