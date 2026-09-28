-- ==============================================================================
-- Trọ Việt - Migration v7 (Phase 10: Push Tokens, Bank Transactions & eKYC)
-- Strictly adheres to 2-tier administrative model, integer VND & Law 91/2025/QH15.
-- ==============================================================================

-- 1. PUSH TOKENS TABLE (Device Management & Offline Notifications)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_token UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- 2. BANK TRANSACTIONS TABLE (VietQR Automated Webhook Reconciliation)
CREATE TABLE IF NOT EXISTS bank_transactions (
  id TEXT PRIMARY KEY, -- Bank transaction code e.g. "FT102938"
  gateway TEXT NOT NULL DEFAULT 'VIETQR',
  transaction_date TIMESTAMPTZ NOT NULL,
  account_number TEXT NOT NULL,
  sub_account TEXT,
  amount_in BIGINT NOT NULL CHECK (amount_in >= 0),
  transaction_content TEXT NOT NULL,
  extracted_invoice_code TEXT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  reconciliation_status TEXT NOT NULL DEFAULT 'pending' CHECK (reconciliation_status IN ('matched', 'partial', 'over', 'unmatched', 'duplicate')),
  difference_amount BIGINT NOT NULL DEFAULT 0,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_tx_invoice ON bank_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_bank_tx_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_tx_extracted_code ON bank_transactions(extracted_invoice_code);

-- 3. EKYC VERIFICATIONS TABLE (Law 91/2025/QH15 Compliant Identity Intelligence)
CREATE TABLE IF NOT EXISTS ekyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_card_number_hash TEXT NOT NULL, -- SHA-256 Hash of 12-digit CCCD
  id_card_last4 TEXT NOT NULL, -- Last 4 digits for masked display e.g. "5678"
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address_origin TEXT,
  document_type TEXT NOT NULL DEFAULT 'chip_cccd' CHECK (document_type IN ('chip_cccd', 'id_card_old', 'passport')),
  verification_method TEXT NOT NULL DEFAULT 'nfc_chip' CHECK (verification_method IN ('nfc_chip', 'ocr_liveness')),
  face_match_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  liveness_passed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ekyc_user ON ekyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ekyc_status ON ekyc_verifications(status);

-- 4. RLS POLICIES FOR PUSH TOKENS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'push_tokens' AND policyname = 'Users can manage own push tokens'
  ) THEN
    CREATE POLICY "Users can manage own push tokens"
      ON push_tokens
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. RLS POLICIES FOR BANK TRANSACTIONS
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bank_transactions' AND policyname = 'Landlords can view transactions of their invoices'
  ) THEN
    CREATE POLICY "Landlords can view transactions of their invoices"
      ON bank_transactions
      FOR SELECT
      USING (
        invoice_id IS NULL OR
        invoice_id IN (
          SELECT id FROM invoices WHERE landlord_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 6. RLS POLICIES FOR EKYC VERIFICATIONS
ALTER TABLE ekyc_verifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ekyc_verifications' AND policyname = 'Users can view own ekyc records'
  ) THEN
    CREATE POLICY "Users can view own ekyc records"
      ON ekyc_verifications
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ekyc_verifications' AND policyname = 'Users can insert own ekyc records'
  ) THEN
    CREATE POLICY "Users can insert own ekyc records"
      ON ekyc_verifications
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
