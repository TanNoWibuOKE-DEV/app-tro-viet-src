-- ==============================================================================
-- Trọ Việt - Migration v1 (Initial Schema)
-- Description: Core 18 tables, PostGIS, Unaccent, Full RLS, and Constraints
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. ENUMS
CREATE TYPE admin_unit_type AS ENUM (
  'province',
  'centrally_run_city',
  'ward',
  'commune',
  'special_zone'
);

CREATE TYPE user_role AS ENUM (
  'tenant',
  'landlord',
  'moderator',
  'admin'
);

CREATE TYPE verification_level AS ENUM (
  'none',
  'L1',
  'L2',
  'L3'
);

CREATE TYPE property_type AS ENUM (
  'room',
  'apartment',
  'house',
  'shared'
);

CREATE TYPE listing_status AS ENUM (
  'draft',
  'pending_review',
  'published',
  'rejected',
  'hidden'
);

CREATE TYPE utility_billing_type AS ENUM (
  'meter',
  'fixed_monthly',
  'tiered',
  'unprovided'
);

CREATE TYPE review_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'investigating',
  'resolved',
  'dismissed'
);

-- ==============================================================================
-- 3. ADMINISTRATIVE BOUNDARIES (2-tier system: Province/City -> Ward/Commune)
-- ==============================================================================

CREATE TABLE admin_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type admin_unit_type NOT NULL,
  level SMALLINT NOT NULL CHECK (level IN (1, 2)),
  parent_id UUID REFERENCES admin_units(id) ON DELETE SET NULL,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  successor_ids UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_admin_units_parent ON admin_units(parent_id);
CREATE INDEX idx_admin_units_level ON admin_units(level);
CREATE INDEX idx_admin_units_code ON admin_units(code);

-- Mappings for old districts/wards into new 2-tier units
CREATE TABLE admin_unit_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_code VARCHAR(50) NOT NULL,
  legacy_name VARCHAR(150) NOT NULL,
  new_unit_id UUID NOT NULL REFERENCES admin_units(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Market definitions (e.g. Da Nang market, HCMC market)
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  province_codes VARCHAR(20)[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Area Aliases for natural search ("khu Mỹ Khê", "quận Hải Châu cũ", "gần ĐH Duy Tân")
CREATE TABLE area_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_unit_id UUID REFERENCES admin_units(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  alias_name VARCHAR(150) NOT NULL,
  normalized_name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'legacy_district', 'neighborhood', 'landmark', 'university'
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_area_aliases_normalized ON area_aliases(normalized_name);
CREATE INDEX idx_area_aliases_market ON area_aliases(market_id);

-- ==============================================================================
-- 4. USERS & PROFILES
-- ==============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'tenant',
  verification_level verification_level NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE landlord_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200),
  identity_verified BOOLEAN NOT NULL DEFAULT false,
  total_listings_count INT NOT NULL DEFAULT 0,
  active_listings_count INT NOT NULL DEFAULT 0,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  review_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level verification_level NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  document_type VARCHAR(100),
  document_url TEXT,
  verified_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 5. PROPERTIES & LISTINGS
-- ==============================================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_type property_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  province_code VARCHAR(20) NOT NULL REFERENCES admin_units(code),
  ward_code VARCHAR(20) NOT NULL REFERENCES admin_units(code),
  street VARCHAR(200) NOT NULL,
  house_number VARCHAR(50) NOT NULL,
  legacy_district VARCHAR(100),
  location GEOGRAPHY(POINT, 4326),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  area_square_meters NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_properties_ward ON properties(ward_code);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  status listing_status NOT NULL DEFAULT 'draft',
  available_from DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INT NOT NULL DEFAULT 0,
  favorite_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_property ON listings(property_id);

-- Mandatory Transparent Costs: All currency in integer VND
CREATE TABLE listing_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  monthly_rent BIGINT NOT NULL CHECK (monthly_rent > 0),
  deposit BIGINT NOT NULL DEFAULT 0 CHECK (deposit >= 0),
  
  -- Electricity
  electricity_billing_type utility_billing_type NOT NULL DEFAULT 'meter',
  electricity_cost_per_unit INT,
  
  -- Water
  water_billing_type utility_billing_type NOT NULL DEFAULT 'meter',
  water_cost_per_unit INT,
  
  -- Internet
  internet_billing_type utility_billing_type NOT NULL DEFAULT 'unprovided',
  internet_cost INT,
  
  -- Parking
  parking_billing_type utility_billing_type NOT NULL DEFAULT 'unprovided',
  parking_cost INT,
  
  -- Service fee
  service_fee_billing_type utility_billing_type NOT NULL DEFAULT 'unprovided',
  service_cost INT,
  
  other_fees_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_media_listing ON media(listing_id, sort_order);

-- ==============================================================================
-- 6. FAVORITES, CHAT, REVIEWS, AUDIT
-- ==============================================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  landlord_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- 'listing', 'user', 'review'
  target_id UUID NOT NULL,
  reason_category VARCHAR(100) NOT NULL,
  details TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) ON ALL 18 TABLES
-- ==============================================================================

ALTER TABLE admin_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_unit_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for public geographic data
CREATE POLICY "Public read admin_units" ON admin_units FOR SELECT USING (true);
CREATE POLICY "Public read admin_unit_mappings" ON admin_unit_mappings FOR SELECT USING (true);
CREATE POLICY "Public read markets" ON markets FOR SELECT USING (true);
CREATE POLICY "Public read area_aliases" ON area_aliases FOR SELECT USING (true);

-- User profiles
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Landlord profiles
CREATE POLICY "Public read landlord profiles" ON landlord_profiles FOR SELECT USING (true);
CREATE POLICY "Landlords can update own profile" ON landlord_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Published Listings & Costs
CREATE POLICY "Public read published listings" ON listings FOR SELECT USING (status = 'published');
CREATE POLICY "Landlords manage own listings" ON listings FOR ALL USING (auth.uid() = landlord_id);

CREATE POLICY "Public read published listing costs" ON listing_costs FOR SELECT USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_costs.listing_id AND listings.status = 'published')
);
CREATE POLICY "Landlords manage own listing costs" ON listing_costs FOR ALL USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_costs.listing_id AND listings.landlord_id = auth.uid())
);

-- Media
CREATE POLICY "Public read published media" ON media FOR SELECT USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = media.listing_id AND listings.status = 'published')
);
CREATE POLICY "Landlords manage own media" ON media FOR ALL USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = media.listing_id AND listings.landlord_id = auth.uid())
);

-- Favorites
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Conversations & Messages
CREATE POLICY "Participants read conversations" ON conversations FOR SELECT USING (
  auth.uid() = tenant_id OR auth.uid() = landlord_id
);
CREATE POLICY "Participants read messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.tenant_id = auth.uid() OR conversations.landlord_id = auth.uid())
  )
);
CREATE POLICY "Senders create messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.tenant_id = auth.uid() OR conversations.landlord_id = auth.uid())
  )
);

-- Reviews
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Tenants create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- Reports
CREATE POLICY "Users read own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Moderation & Audit logs: Service role / Admin only
-- (Default deny for normal users, service role bypasses RLS)
