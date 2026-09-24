-- ==============================================================================
-- Trọ Việt - Rollback Migration v4 (Phase 5: L3 Landlord Verification & Saved Searches)
-- ==============================================================================

-- 1. DROP SAVED_SEARCHES
DROP TABLE IF EXISTS saved_searches CASCADE;

-- 2. DROP COLUMNS FROM VERIFICATIONS
ALTER TABLE verifications DROP COLUMN IF EXISTS notes;
ALTER TABLE verifications DROP COLUMN IF EXISTS property_id;
