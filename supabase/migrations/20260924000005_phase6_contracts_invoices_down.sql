-- ==============================================================================
-- Trọ Việt - Rollback Migration v5 (Phase 6: Lease Contracts & Rent Invoicing)
-- ==============================================================================

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TYPE IF EXISTS invoice_status;
DROP TYPE IF EXISTS contract_status;
