-- ==============================================================================
-- Trọ Việt - Migration v9 (Phase 12: Tenant Life Hub & Legal Concierge)
-- Strictly adheres to 2-tier administrative model, integer VND & Law 91/2025/QH15.
-- ==============================================================================

-- 1. SERVICE REQUESTS TABLE (Tenant Life Hub: Moving, Cleaning, Repairs)
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code TEXT NOT NULL UNIQUE, -- e.g. "SRV849201"
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('moving', 'cleaning', 'plumbing_electrical', 'laundry', 'ac_maintenance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  pickup_address TEXT,
  destination_address TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  estimated_cost BIGINT NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0), -- Integer VND
  final_cost BIGINT CHECK (final_cost IS NULL OR final_cost >= 0),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  partner_name TEXT,
  partner_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_code ON service_requests(request_code);
CREATE INDEX IF NOT EXISTS idx_service_requests_tenant ON service_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_type ON service_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- 2. UTILITY REGULATIONS TABLE (Official Law, Decisions, State Tariffs)
CREATE TABLE IF NOT EXISTS utility_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_code TEXT NOT NULL UNIQUE, -- e.g. "QD2941_BCT"
  category TEXT NOT NULL CHECK (category IN ('electricity', 'water', 'internet', 'general')),
  title TEXT NOT NULL,
  issuing_body TEXT NOT NULL,
  effective_date DATE NOT NULL,
  max_recommended_rate BIGINT NOT NULL, -- Integer VND (e.g. 4000 VND/kWh or 35000 VND/m3)
  tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  legal_notes TEXT NOT NULL,
  penalty_guidelines TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_utility_regulations_code ON utility_regulations(regulation_code);
CREATE INDEX IF NOT EXISTS idx_utility_regulations_category ON utility_regulations(category);

-- 3. UTILITY DISPUTES & LEGAL NEGOTIATIONS TABLE (Automated Dispute Concierge)
CREATE TABLE IF NOT EXISTS utility_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_code TEXT NOT NULL UNIQUE, -- e.g. "DISP938210"
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('electricity_overcharge', 'water_overcharge', 'deposit_refund', 'illegal_eviction', 'maintenance_neglect')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent_to_landlord', 'negotiating', 'resolved', 'escalated_ward_police')),
  billed_rate BIGINT NOT NULL DEFAULT 0, -- Integer VND
  legal_max_rate BIGINT NOT NULL DEFAULT 0, -- Integer VND
  excess_amount BIGINT NOT NULL DEFAULT 0, -- Integer VND
  letter_content TEXT NOT NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_utility_disputes_code ON utility_disputes(dispute_code);
CREATE INDEX IF NOT EXISTS idx_utility_disputes_tenant ON utility_disputes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_utility_disputes_landlord ON utility_disputes(landlord_id);
CREATE INDEX IF NOT EXISTS idx_utility_disputes_status ON utility_disputes(status);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Service Requests RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Tenants can view own service requests'
  ) THEN
    CREATE POLICY "Tenants can view own service requests"
      ON service_requests
      FOR SELECT
      USING (auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Tenants can create service requests'
  ) THEN
    CREATE POLICY "Tenants can create service requests"
      ON service_requests
      FOR INSERT
      WITH CHECK (auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Tenants can update own service requests'
  ) THEN
    CREATE POLICY "Tenants can update own service requests"
      ON service_requests
      FOR UPDATE
      USING (auth.uid() = tenant_id);
  END IF;
END $$;

-- Utility Regulations RLS (Public read for all authenticated and anonymous users)
ALTER TABLE utility_regulations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'utility_regulations' AND policyname = 'Anyone can view utility regulations'
  ) THEN
    CREATE POLICY "Anyone can view utility regulations"
      ON utility_regulations
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Utility Disputes RLS
ALTER TABLE utility_disputes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'utility_disputes' AND policyname = 'Participants can view own disputes'
  ) THEN
    CREATE POLICY "Participants can view own disputes"
      ON utility_disputes
      FOR SELECT
      USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'utility_disputes' AND policyname = 'Tenants can create disputes'
  ) THEN
    CREATE POLICY "Tenants can create disputes"
      ON utility_disputes
      FOR INSERT
      WITH CHECK (auth.uid() = tenant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'utility_disputes' AND policyname = 'Participants can update own disputes'
  ) THEN
    CREATE POLICY "Participants can update own disputes"
      ON utility_disputes
      FOR UPDATE
      USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);
  END IF;
END $$;

-- 5. INITIAL SEED DATA (Official EVN Regulations & Sample Data)
INSERT INTO utility_regulations (
  regulation_code,
  category,
  title,
  issuing_body,
  effective_date,
  max_recommended_rate,
  tiers,
  legal_notes,
  penalty_guidelines
) VALUES
(
  'QD2941_BCT',
  'electricity',
  'Biểu giá bán lẻ điện sinh hoạt bậc thang theo Quyết định 2941/QĐ-BCT',
  'Bộ Công Thương',
  '2023-11-09',
  4000,
  '[
    {"tier": 1, "minKwh": 0, "maxKwh": 50, "rateVnd": 1893, "name": "Bậc 1 (0 - 50 kWh)"},
    {"tier": 2, "minKwh": 51, "maxKwh": 100, "rateVnd": 1956, "name": "Bậc 2 (51 - 100 kWh)"},
    {"tier": 3, "minKwh": 101, "maxKwh": 200, "rateVnd": 2271, "name": "Bậc 3 (101 - 200 kWh)"},
    {"tier": 4, "minKwh": 201, "maxKwh": 300, "rateVnd": 2860, "name": "Bậc 4 (201 - 300 kWh)"},
    {"tier": 5, "minKwh": 301, "maxKwh": 400, "rateVnd": 3197, "name": "Bậc 5 (301 - 400 kWh)"},
    {"tier": 6, "minKwh": 401, "maxKwh": 999999, "rateVnd": 3302, "name": "Bậc 6 (từ 401 kWh trở lên)"}
  ]'::jsonb,
  'Theo Thông tư 09/2023/TT-BCT, người thuê nhà có hợp đồng thuê từ 12 tháng trở lên và có đăng ký tạm trú được ký hợp đồng mua bán điện trực tiếp với EVN hoặc chủ nhà đứng tên kê khai đủ số người để cấp định mức (cứ 04 người tính 01 định mức sinh hoạt).',
  'Nghị định 134/2013/NĐ-CP sửa đổi bởi Nghị định 17/2022/NĐ-CP: Phạt tiền từ 20.000.000 ₫ đến 30.000.000 ₫ đối với người cho thuê nhà thu tiền điện của người thuê nhà cao hơn giá quy định.'
),
(
  'QD_NUOC_DANANG_HN_HCM',
  'water',
  'Khung giá nước sinh hoạt đô thị theo quy định địa phương',
  'UBND Tỉnh / Thành phố',
  '2024-01-01',
  35000,
  '[
    {"tier": 1, "minM3": 0, "maxM3": 10, "rateVnd": 8500, "name": "Định mức 1 (0 - 10 m³)"},
    {"tier": 2, "minM3": 11, "maxM3": 20, "rateVnd": 11500, "name": "Định mức 2 (11 - 20 m³)"},
    {"tier": 3, "minM3": 21, "maxM3": 30, "rateVnd": 16000, "name": "Định mức 3 (21 - 30 m³)"},
    {"tier": 4, "minM3": 31, "maxM3": 999999, "rateVnd": 27000, "name": "Vượt định mức (> 30 m³)"}
  ]'::jsonb,
  'Đối với người thuê trọ có đăng ký tạm trú, mỗi người thuê được tính định mức nước sinh hoạt tiêu chuẩn theo số nhân khẩu tại địa phương.',
  'Chủ nhà thu tiền nước vượt quá 35.000 ₫/m³ thường không phản ánh chi phí thực tế mà cộng gộp chi phí hao hụt không minh bạch.'
)
ON CONFLICT (regulation_code) DO NOTHING;
