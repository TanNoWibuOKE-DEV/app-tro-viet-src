-- ==============================================================================
-- Trọ Việt - Migration v8 (Phase 11: Deposit Escrows & Landlord Subscriptions)
-- Strictly adheres to 2-tier administrative model, integer VND & Law 91/2025/QH15.
-- ==============================================================================

-- 1. DEPOSIT ESCROWS TABLE (Secure 48h Booking Protection Protocol)
CREATE TABLE IF NOT EXISTS deposit_escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_code TEXT NOT NULL UNIQUE, -- e.g. "DEP849201"
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0), -- Integer VND
  status TEXT NOT NULL DEFAULT 'holding' CHECK (status IN ('holding', 'released', 'disputed', 'refunded', 'cancelled')),
  hold_until TIMESTAMPTZ NOT NULL, -- Default 48h from creation
  handover_id UUID REFERENCES property_handovers(id) ON DELETE SET NULL,
  payment_reference TEXT,
  dispute_reason TEXT,
  resolution_notes TEXT,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deposit_escrows_code ON deposit_escrows(escrow_code);
CREATE INDEX IF NOT EXISTS idx_deposit_escrows_listing ON deposit_escrows(listing_id);
CREATE INDEX IF NOT EXISTS idx_deposit_escrows_tenant ON deposit_escrows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deposit_escrows_landlord ON deposit_escrows(landlord_id);
CREATE INDEX IF NOT EXISTS idx_deposit_escrows_status ON deposit_escrows(status);

-- 2. LANDLORD SUBSCRIPTIONS & VIP LISTINGS (Commercialization & Monetization)
CREATE TABLE IF NOT EXISTS landlord_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'vip_bronze', 'vip_silver', 'vip_diamond')),
  price_paid BIGINT NOT NULL DEFAULT 0 CHECK (price_paid >= 0), -- Integer VND
  package_code TEXT NOT NULL, -- e.g. "PKG102938"
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_refresh BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landlord_subs_landlord ON landlord_subscriptions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_subs_listing ON landlord_subscriptions(listing_id);
CREATE INDEX IF NOT EXISTS idx_landlord_subs_tier ON landlord_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_landlord_subs_active ON landlord_subscriptions(is_active);

-- 3. ROW LEVEL SECURITY (RLS) FOR DEPOSIT ESCROWS
ALTER TABLE deposit_escrows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deposit_escrows' AND policyname = 'Participants can view own deposit escrows'
  ) THEN
    CREATE POLICY "Participants can view own deposit escrows"
      ON deposit_escrows
      FOR SELECT
      USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deposit_escrows' AND policyname = 'Tenants can initiate deposit escrows'
  ) THEN
    CREATE POLICY "Tenants can initiate deposit escrows"
      ON deposit_escrows
      FOR INSERT
      WITH CHECK (auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deposit_escrows' AND policyname = 'Participants can update deposit escrows'
  ) THEN
    CREATE POLICY "Participants can update deposit escrows"
      ON deposit_escrows
      FOR UPDATE
      USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);
  END IF;
END $$;

-- 4. ROW LEVEL SECURITY (RLS) FOR LANDLORD SUBSCRIPTIONS
ALTER TABLE landlord_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'landlord_subscriptions' AND policyname = 'Public can view active subscriptions'
  ) THEN
    CREATE POLICY "Public can view active subscriptions"
      ON landlord_subscriptions
      FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'landlord_subscriptions' AND policyname = 'Landlords can manage own subscriptions'
  ) THEN
    CREATE POLICY "Landlords can manage own subscriptions"
      ON landlord_subscriptions
      FOR ALL
      USING (auth.uid() = landlord_id)
      WITH CHECK (auth.uid() = landlord_id);
  END IF;
END $$;
