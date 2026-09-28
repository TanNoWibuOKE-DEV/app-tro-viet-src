-- ==============================================================================
-- Trọ Việt - Rollback Migration v10 (Phase 13: Campus Hub, Flood Alerts & Transfers)
-- ==============================================================================

DROP TABLE IF EXISTS student_pass_items CASCADE;
DROP TABLE IF EXISTS room_transfers CASCADE;
DROP TABLE IF EXISTS flood_risk_reports CASCADE;
