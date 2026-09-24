-- ==============================================================================
-- Trọ Việt - Migration v2 (Phase 1: Amenities, Search Function, Preferences)
-- ==============================================================================

-- 1. Amenities Table
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'room_features', 'building'
  icon VARCHAR(50),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Listing Amenities Junction Table
CREATE TABLE listing_amenities (
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

CREATE INDEX idx_listing_amenities_amenity ON listing_amenities(amenity_id);

-- 3. User Preferences (Onboarding Choices)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_property_types property_type[],
  min_price BIGINT CHECK (min_price >= 0),
  max_price BIGINT CHECK (max_price >= 0),
  preferred_ward_codes VARCHAR(20)[],
  preferred_amenity_codes VARCHAR(50)[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Enable RLS
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read amenities" ON amenities FOR SELECT USING (true);

CREATE POLICY "Public read published listing amenities" ON listing_amenities FOR SELECT USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_amenities.listing_id AND listings.status = 'published')
);

CREATE POLICY "Landlords manage listing amenities" ON listing_amenities FOR ALL USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_amenities.listing_id AND listings.landlord_id = auth.uid())
);

CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL USING (
  auth.uid() = user_id
);

-- 5. Standard Vietnamese Amenities Initial Seed
INSERT INTO amenities (code, name, category, icon, sort_order) VALUES
  ('air_conditioner', 'Máy lạnh / Điều hòa', 'room_features', 'snow', 1),
  ('private_bathroom', 'WC riêng', 'room_features', 'water', 2),
  ('water_heater', 'Bình nóng lạnh', 'room_features', 'thermometer', 3),
  ('mezzanine', 'Gác lửng', 'room_features', 'layers', 4),
  ('refrigerator', 'Tủ lạnh', 'room_features', 'box', 5),
  ('washing_machine', 'Máy giặt', 'building', 'disc', 6),
  ('kitchen_private', 'Khu bếp riêng', 'room_features', 'utensils', 7),
  ('balcony', 'Ban công / Cửa sổ thoáng', 'room_features', 'sun', 8),
  ('free_hours', 'Giờ giấc tự do, không chung chủ', 'building', 'clock', 9),
  ('security_fingerprint', 'Khóa vân tay / Camera an ninh', 'building', 'shield', 10),
  ('elevator', 'Thang máy', 'building', 'arrow-up', 11),
  ('parking_lot', 'Chỗ để xe trong nhà', 'building', 'key', 12)
ON CONFLICT (code) DO NOTHING;
