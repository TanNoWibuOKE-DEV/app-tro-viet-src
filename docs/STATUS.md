# Trọ Việt — Tiến độ

**Phase hiện tại:** Phase 0 — Nền móng
**Trạng thái:** Đã hoàn thành (Chờ xác nhận để chuyển sang Phase 1)

## Quyết định đã chốt (Sau Phase 0)
- **Tech Stack:** Monorepo (`apps/mobile`, `packages/shared`, `supabase/`), Expo (React Native + TypeScript + Expo Router) + Supabase (Postgres, PostGIS, Auth, Storage, Realtime). Chi tiết tại [001-stack.md](file:///d:/File_Website/web_tmđt/docs/adr/001-stack.md).
- **Thị trường ra mắt đầu tiên:** TP. Đà Nẵng (áp dụng mô hình địa giới 2 cấp hiện hành và bảng `area_aliases`).
- **Quy chuẩn chi phí:** Minh bạch 100%, không bao giờ coi chi phí chưa cung cấp là 0đ, tách biệt "Mỗi tháng" và "Cần chuẩn bị khi vào ở".
- **Bảo mật:** Bật RLS 100% trên 18 bảng CSDL, không đưa `service_role` key vào client hay source control.

## Phase đã xong
- **Phase 0 — Nền móng:**
  - Khởi tạo Monorepo, cấu hình TypeScript, GitHub Actions CI.
  - Xây dựng `@troviet/shared` với Zod schemas, formatters tiền tệ VNĐ/diện tích/khoảng cách, Total Cost Calculator (test độ phủ đạt 100%).
  - Tạo Supabase migration v1 (18 bảng, PostGIS, Unaccent, Full RLS, rollback script).
  - Tạo dữ liệu mẫu `seed.sql` cho TP. Đà Nẵng có nhãn `[MẪU - DEV]`.
  - Xây dựng ứng dụng mobile Expo với Theme (Light/Dark), Brand kit, màn hình Hello/Healthcheck chạy được trên web và mobile.

## Phase tiếp theo
- **Phase 1 — Tìm phòng & Nguồn tin:** Authentication (OTP/Email/OAuth), Onboarding, Property Search & Filter, Property Detail, Landlord posting, Admin moderation.

## Việc nợ
Xem [BACKLOG.md](file:///d:/File_Website/web_tmđt/docs/BACKLOG.md).
