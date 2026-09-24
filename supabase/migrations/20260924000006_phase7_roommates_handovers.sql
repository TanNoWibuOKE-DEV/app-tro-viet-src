-- ==============================================================================
-- Trọ Việt - Migration v6 (Phase 7: Roommate Matching & Property Handovers)
-- ==============================================================================

-- 1. ENUMS FOR ROOMMATE MATCHING
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sleep_schedule') THEN
    CREATE TYPE sleep_schedule AS ENUM ('early_bird', 'night_owl', 'flexible');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'smoking_habit') THEN
    CREATE TYPE smoking_habit AS ENUM ('no_smoking', 'balcony_only', 'smoking_allowed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_habit') THEN
    CREATE TYPE pet_habit AS ENUM ('no_pets', 'has_cats', 'has_dogs', 'pet_friendly');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cleanliness_level') THEN
    CREATE TYPE cleanliness_level AS ENUM ('neat_freak', 'moderate', 'relaxed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_preference') THEN
    CREATE TYPE gender_preference AS ENUM ('male_only', 'female_only', 'any');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_status') THEN
    CREATE TYPE handover_status AS ENUM ('draft', 'completed');
  END IF;
END $$;

-- 2. ROOMMATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS roommate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  age INT,
  occupation VARCHAR(150) NOT NULL,
  budget_monthly_max BIGINT NOT NULL,
  target_wards TEXT[] NOT NULL DEFAULT '{}',
  sleep_schedule sleep_schedule NOT NULL DEFAULT 'flexible',
  smoking_habit smoking_habit NOT NULL DEFAULT 'no_smoking',
  pet_habit pet_habit NOT NULL DEFAULT 'no_pets',
  cleanliness_level cleanliness_level NOT NULL DEFAULT 'moderate',
  gender_preference gender_preference NOT NULL DEFAULT 'any',
  bio TEXT NOT NULL DEFAULT '',
  has_room BOOLEAN NOT NULL DEFAULT false,
  existing_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_roommate_profiles_user_id ON roommate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_is_active ON roommate_profiles(is_active);

-- 3. PROPERTY HANDOVERS TABLE
CREATE TABLE IF NOT EXISTS property_handovers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handover_date DATE NOT NULL DEFAULT CURRENT_DATE,
  initial_electricity_meter BIGINT NOT NULL DEFAULT 0,
  electricity_meter_photo_url TEXT,
  initial_water_meter BIGINT NOT NULL DEFAULT 0,
  water_meter_photo_url TEXT,
  item_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  general_notes TEXT,
  landlord_confirmed BOOLEAN NOT NULL DEFAULT false,
  tenant_confirmed BOOLEAN NOT NULL DEFAULT false,
  landlord_confirmed_at TIMESTAMPTZ,
  tenant_confirmed_at TIMESTAMPTZ,
  status handover_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_property_handovers_contract_id ON property_handovers(contract_id);
CREATE INDEX IF NOT EXISTS idx_property_handovers_landlord_id ON property_handovers(landlord_id);
CREATE INDEX IF NOT EXISTS idx_property_handovers_tenant_id ON property_handovers(tenant_id);

-- 4. RLS POLICIES FOR ROOMMATE PROFILES
ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'roommate_profiles' AND policyname = 'Anyone views active roommate profiles'
  ) THEN
    CREATE POLICY "Anyone views active roommate profiles" ON roommate_profiles
      FOR SELECT USING (is_active = true OR auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'roommate_profiles' AND policyname = 'Users create own roommate profile'
  ) THEN
    CREATE POLICY "Users create own roommate profile" ON roommate_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'roommate_profiles' AND policyname = 'Users update own roommate profile'
  ) THEN
    CREATE POLICY "Users update own roommate profile" ON roommate_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'roommate_profiles' AND policyname = 'Users delete own roommate profile'
  ) THEN
    CREATE POLICY "Users delete own roommate profile" ON roommate_profiles
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. RLS POLICIES FOR PROPERTY HANDOVERS
ALTER TABLE property_handovers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_handovers' AND policyname = 'Participants view handovers'
  ) THEN
    CREATE POLICY "Participants view handovers" ON property_handovers
      FOR SELECT USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_handovers' AND policyname = 'Participants update handovers'
  ) THEN
    CREATE POLICY "Participants update handovers" ON property_handovers
      FOR UPDATE USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_handovers' AND policyname = 'Participants create handovers'
  ) THEN
    CREATE POLICY "Participants create handovers" ON property_handovers
      FOR INSERT WITH CHECK (auth.uid() = landlord_id OR auth.uid() = tenant_id);
  END IF;
END $$;
