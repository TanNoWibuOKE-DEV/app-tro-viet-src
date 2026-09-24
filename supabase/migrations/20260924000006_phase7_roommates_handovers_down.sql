-- ==============================================================================
-- Trọ Việt - Rollback Migration v6 (Phase 7: Roommate Matching & Property Handovers)
-- ==============================================================================

DROP TABLE IF EXISTS property_handovers CASCADE;
DROP TABLE IF EXISTS roommate_profiles CASCADE;

DROP TYPE IF EXISTS handover_status;
DROP TYPE IF EXISTS gender_preference;
DROP TYPE IF EXISTS cleanliness_level;
DROP TYPE IF EXISTS pet_habit;
DROP TYPE IF EXISTS smoking_habit;
DROP TYPE IF EXISTS sleep_schedule;
