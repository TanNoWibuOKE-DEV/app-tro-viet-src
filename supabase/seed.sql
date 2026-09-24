-- ==============================================================================
-- Trọ Việt - Seed Data [MẪU - DEV]
-- Description: 2-tier administrative boundaries, aliases, and sample listings
-- WARNING: For development & testing purposes only. Strictly labeled [MẪU - DEV].
-- ==============================================================================

-- 1. Pilot Market: TP. Đà Nẵng
INSERT INTO markets (id, code, name, province_codes, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'DN',
  'Thành phố Đà Nẵng [MẪU - DEV]',
  ARRAY['48'],
  true
) ON CONFLICT (code) DO NOTHING;

-- 2. Level 1 Administrative Unit: TP. Đà Nẵng
INSERT INTO admin_units (id, code, name, type, level, parent_id, valid_from)
VALUES (
  'b0000000-0000-0000-0000-000000000048',
  '48',
  'Thành phố Đà Nẵng [MẪU - DEV]',
  'centrally_run_city',
  1,
  NULL,
  '2025-07-01'
) ON CONFLICT (code) DO NOTHING;

-- 3. Level 2 Administrative Units: Wards in TP. Đà Nẵng
INSERT INTO admin_units (id, code, name, type, level, parent_id, valid_from)
VALUES 
(
  'c0000000-0000-0000-0000-000000000001',
  '48_HAICHAU1',
  'Phường Hải Châu I [MẪU - DEV]',
  'ward',
  2,
  'b0000000-0000-0000-0000-000000000048',
  '2025-07-01'
),
(
  'c0000000-0000-0000-0000-000000000002',
  '48_PHUOCMY',
  'Phường Phước Mỹ [MẪU - DEV]',
  'ward',
  2,
  'b0000000-0000-0000-0000-000000000048',
  '2025-07-01'
),
(
  'c0000000-0000-0000-0000-000000000003',
  '48_HOAKHANHBAC',
  'Phường Hòa Khánh Bắc [MẪU - DEV]',
  'ward',
  2,
  'b0000000-0000-0000-0000-000000000048',
  '2025-07-01'
),
(
  'c0000000-0000-0000-0000-000000000004',
  '48_HOACUONGNAM',
  'Phường Hòa Cường Nam [MẪU - DEV]',
  'ward',
  2,
  'b0000000-0000-0000-0000-000000000048',
  '2025-07-01'
)
ON CONFLICT (code) DO NOTHING;

-- 4. Area Aliases & Habitual Landmarks
INSERT INTO area_aliases (market_id, admin_unit_id, alias_name, normalized_name, category, latitude, longitude)
VALUES 
(
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'Khu Mỹ Khê [MẪU - DEV]',
  'khu my khe',
  'neighborhood',
  16.0601,
  108.2464
),
(
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Quận Hải Châu cũ [MẪU - DEV]',
  'quan hai chau cu',
  'legacy_district',
  16.0712,
  108.2230
),
(
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Gần ĐH Duy Tân [MẪU - DEV]',
  'gan dh duy tan',
  'university',
  16.0728,
  108.2215
),
(
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000003',
  'Gần ĐH Bách Khoa Đà Nẵng [MẪU - DEV]',
  'gan dh bach khoa da nang',
  'university',
  16.0754,
  108.1528
),
(
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Gần Cầu Rồng [MẪU - DEV]',
  'gan cau rong',
  'landmark',
  16.0611,
  108.2272
);
