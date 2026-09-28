-- ==============================================================================
-- Trọ Việt - Migration v10 (Phase 13: Campus Hub, Flood Alerts & Room Transfers)
-- Strictly adheres to 2-tier administrative model, integer VND & Law 91/2025/QH15.
-- ==============================================================================

-- 1. FLOOD RISK REPORTS TABLE (Crowdsourced Urban Flood Warning Points)
CREATE TABLE IF NOT EXISTS flood_risk_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  city_code TEXT NOT NULL DEFAULT 'danang' CHECK (city_code IN ('danang', 'hanoi', 'hcm')),
  ward_slug TEXT NOT NULL,
  street_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('light', 'moderate', 'severe')),
  depth_cm INTEGER NOT NULL DEFAULT 20 CHECK (depth_cm >= 0),
  description TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 1 CHECK (upvotes >= 0),
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flood_city ON flood_risk_reports(city_code);
CREATE INDEX IF NOT EXISTS idx_flood_ward ON flood_risk_reports(ward_slug);
CREATE INDEX IF NOT EXISTS idx_flood_severity ON flood_risk_reports(severity);

-- 2. ROOM TRANSFERS TABLE (Contract Transfer & Deposit Protection)
CREATE TABLE IF NOT EXISTS room_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_code TEXT NOT NULL UNIQUE, -- e.g. "TRF839210"
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  monthly_rent BIGINT NOT NULL CHECK (monthly_rent > 0), -- Integer VND
  deposit_amount BIGINT NOT NULL CHECK (deposit_amount >= 0), -- Integer VND
  room_address TEXT NOT NULL,
  ward_slug TEXT NOT NULL,
  city_code TEXT NOT NULL CHECK (city_code IN ('danang', 'hanoi', 'hcm')),
  available_date DATE NOT NULL,
  contract_months_left INTEGER NOT NULL CHECK (contract_months_left >= 1),
  landlord_consent BOOLEAN NOT NULL DEFAULT true,
  incentive_note TEXT,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_code ON room_transfers(transfer_code);
CREATE INDEX IF NOT EXISTS idx_transfers_city ON room_transfers(city_code);
CREATE INDEX IF NOT EXISTS idx_transfers_tenant ON room_transfers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON room_transfers(status);

-- 3. STUDENT PASS ITEMS TABLE (Pass-Exchange / Re-use Furniture & Appliances)
CREATE TABLE IF NOT EXISTS student_pass_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL UNIQUE, -- e.g. "PASS29103"
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('appliances', 'furniture', 'kitchen', 'study', 'other')),
  price_vnd BIGINT NOT NULL DEFAULT 0 CHECK (price_vnd >= 0), -- 0 = tặng miễn phí
  condition TEXT NOT NULL CHECK (condition IN ('like_new', 'good', 'fair')),
  campus_near TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'hidden')),
  pickup_location TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pass_items_code ON student_pass_items(item_code);
CREATE INDEX IF NOT EXISTS idx_pass_items_category ON student_pass_items(category);
CREATE INDEX IF NOT EXISTS idx_pass_items_status ON student_pass_items(status);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Flood Risk Reports RLS (Public read, verified users insert)
ALTER TABLE flood_risk_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'flood_risk_reports' AND policyname = 'Anyone can view flood reports'
  ) THEN
    CREATE POLICY "Anyone can view flood reports"
      ON flood_risk_reports
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'flood_risk_reports' AND policyname = 'Authenticated users can report flood points'
  ) THEN
    CREATE POLICY "Authenticated users can report flood points"
      ON flood_risk_reports
      FOR INSERT
      WITH CHECK (auth.uid() = reporter_id);
  END IF;
END $$;

-- Room Transfers RLS
ALTER TABLE room_transfers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_transfers' AND policyname = 'Anyone can view active room transfers'
  ) THEN
    CREATE POLICY "Anyone can view active room transfers"
      ON room_transfers
      FOR SELECT
      USING (status = 'active' OR auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_transfers' AND policyname = 'Tenants can create room transfers'
  ) THEN
    CREATE POLICY "Tenants can create room transfers"
      ON room_transfers
      FOR INSERT
      WITH CHECK (auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_transfers' AND policyname = 'Tenants can update own room transfers'
  ) THEN
    CREATE POLICY "Tenants can update own room transfers"
      ON room_transfers
      FOR UPDATE
      USING (auth.uid() = tenant_id);
  END IF;
END $$;

-- Student Pass Items RLS
ALTER TABLE student_pass_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_pass_items' AND policyname = 'Anyone can view available pass items'
  ) THEN
    CREATE POLICY "Anyone can view available pass items"
      ON student_pass_items
      FOR SELECT
      USING (status = 'available' OR auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_pass_items' AND policyname = 'Sellers can create pass items'
  ) THEN
    CREATE POLICY "Sellers can create pass items"
      ON student_pass_items
      FOR INSERT
      WITH CHECK (auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_pass_items' AND policyname = 'Sellers can update own pass items'
  ) THEN
    CREATE POLICY "Sellers can update own pass items"
      ON student_pass_items
      FOR UPDATE
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- 5. INITIAL SEED DATA FOR DEV / TEST [MẪU - DEV]
INSERT INTO flood_risk_reports (
  city_code,
  ward_slug,
  street_name,
  latitude,
  longitude,
  severity,
  depth_cm,
  description,
  upvotes,
  verified
) VALUES
(
  'danang',
  'thach-thang',
  'Đường Quang Trung đoạn qua Bệnh viện Đa khoa Đà Nẵng',
  16.0754,
  108.2198,
  'moderate',
  35,
  '[MẪU - DEV] Khu vực trũng thoát nước chậm khi mưa lớn liên tục trên 2 giờ, xe máy nên đi chậm.',
  14,
  true
),
(
  'danang',
  'hoa-khanh-bac',
  'Đường Mẹ Suốt đoạn gần ĐH Bách Khoa Đà Nẵng',
  16.0691,
  108.1523,
  'severe',
  60,
  '[MẪU - DEV] Điểm trũng thấp lịch sử, mùa mưa bão nước dâng nhanh tràn vào phòng trọ trệt. Cần thuê gác lửng hoặc tầng 2.',
  42,
  true
),
(
  'hanoi',
  'dich-vong-hau',
  'Đường Trần Thái Tông - Duy Tân, Cầu Giấy',
  21.0315,
  105.7832,
  'moderate',
  40,
  '[MẪU - DEV] Mưa rào lớn thường đọng nước ngập nửa bánh xe tại các ngã tư ngõ sâu.',
  28,
  true
),
(
  'hcm',
  'linh-trung',
  'Đường số 6 đoạn Làng Đại học Thủ Đức',
  10.8712,
  106.7789,
  'moderate',
  30,
  '[MẪU - DEV] Đoạn dốc trũng ngập cục bộ khi triều cường kết hợp mưa lớn.',
  19,
  true
)
ON CONFLICT DO NOTHING;
