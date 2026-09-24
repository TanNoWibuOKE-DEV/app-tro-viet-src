-- ==============================================================================
-- Trọ Việt - Migration v5 (Phase 6: Lease Contracts & Rent Invoicing)
-- ==============================================================================

-- 1. CONTRACT STATUS ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
    CREATE TYPE contract_status AS ENUM (
      'draft',
      'pending_signature',
      'active',
      'terminated',
      'expired'
    );
  END IF;
END $$;

-- 2. INVOICE STATUS ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM (
      'pending',
      'paid',
      'overdue'
    );
  END IF;
END $$;

-- 3. CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status contract_status NOT NULL DEFAULT 'draft',
  monthly_rent BIGINT NOT NULL,
  deposit_amount BIGINT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  landlord_signed_at TIMESTAMPTZ,
  tenant_signed_at TIMESTAMPTZ,
  contract_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_contracts_landlord_id ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_listing_id ON contracts(listing_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR(20) NOT NULL,
  rent_amount BIGINT NOT NULL,
  electricity_amount BIGINT NOT NULL DEFAULT 0,
  electricity_kwh INT,
  water_amount BIGINT NOT NULL DEFAULT 0,
  water_m3 INT,
  internet_amount BIGINT NOT NULL DEFAULT 0,
  service_amount BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL,
  status invoice_status NOT NULL DEFAULT 'pending',
  vietqr_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_landlord_id ON invoices(landlord_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 5. RLS POLICIES FOR CONTRACTS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Users view involved contracts'
  ) THEN
    CREATE POLICY "Users view involved contracts" ON contracts
      FOR SELECT USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Landlords create contracts'
  ) THEN
    CREATE POLICY "Landlords create contracts" ON contracts
      FOR INSERT WITH CHECK (auth.uid() = landlord_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Participants update contracts'
  ) THEN
    CREATE POLICY "Participants update contracts" ON contracts
      FOR UPDATE USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;
END $$;

-- 6. RLS POLICIES FOR INVOICES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users view involved invoices'
  ) THEN
    CREATE POLICY "Users view involved invoices" ON invoices
      FOR SELECT USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Landlords create invoices'
  ) THEN
    CREATE POLICY "Landlords create invoices" ON invoices
      FOR INSERT WITH CHECK (auth.uid() = landlord_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Participants update invoices'
  ) THEN
    CREATE POLICY "Participants update invoices" ON invoices
      FOR UPDATE USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;
END $$;
