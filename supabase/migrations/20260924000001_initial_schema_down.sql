-- ==============================================================================
-- Trọ Việt - Rollback Migration v1
-- ==============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS moderation_actions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS listing_costs CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS landlord_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS area_aliases CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS admin_unit_mappings CASCADE;
DROP TABLE IF EXISTS admin_units CASCADE;

DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS review_status;
DROP TYPE IF EXISTS utility_billing_type;
DROP TYPE IF EXISTS listing_status;
DROP TYPE IF EXISTS property_type;
DROP TYPE IF EXISTS verification_level;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS admin_unit_type;
