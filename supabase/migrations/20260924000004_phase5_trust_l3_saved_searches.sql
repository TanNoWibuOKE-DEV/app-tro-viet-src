-- ==============================================================================
-- Trọ Việt - Migration v4 (Phase 5: L3 Landlord Verification & Saved Searches)
-- ==============================================================================

-- 1. EXTEND NOTIFICATION TYPES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'saved_search_match' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'saved_search_match';
  END IF;
END $$;

-- 2. CREATE SAVED_SEARCHES TABLE
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  notify_new_matches BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

-- 3. ENABLE RLS ON SAVED_SEARCHES
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users view own saved searches'
  ) THEN
    CREATE POLICY "Users view own saved searches" ON saved_searches FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users create own saved searches'
  ) THEN
    CREATE POLICY "Users create own saved searches" ON saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users update own saved searches'
  ) THEN
    CREATE POLICY "Users update own saved searches" ON saved_searches FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users delete own saved searches'
  ) THEN
    CREATE POLICY "Users delete own saved searches" ON saved_searches FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. EXTEND VERIFICATIONS TABLE FOR L3 (LANDLORD DEED / LEASE AUTHORIZATION)
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- 5. SAMPLE SEED DATA FOR SAVED SEARCHES [MẪU - DEV/TEST]
-- Sample criteria demonstrating Da Nang Hai Chau search
INSERT INTO saved_searches (id, user_id, name, criteria, notify_new_matches)
VALUES (
  'e2e2e2e2-0000-0000-0000-000000000001',
  'd0d0d0d0-0000-0000-0000-000000000001',
  '[MẪU] Phòng trọ Hải Châu < 3 triệu có máy lạnh',
  '{"query": "Hai Chau", "wardCode": "48_HAICHAU1", "maxRent": 3000000, "amenityCodes": ["air_conditioner"]}'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;
