# Trọ Việt — Tiến độ

**Phase hiện tại:** Phase 1 — Tìm phòng & Nguồn tin
**Trạng thái:** Đã hoàn thành (Chờ xác nhận để chuyển sang Phase 2)

## Quyết định đã chốt (Sau Phase 1)
- **Tech Stack:** Monorepo (`apps/mobile`, `packages/shared`, `supabase/`), Expo (React Native + TypeScript + Expo Router) + Supabase (Postgres, PostGIS, Auth, Storage, Realtime). Chi tiết tại [001-stack.md](file:///d:/File_Website/web_tmđt/docs/adr/001-stack.md).
- **Thị trường ra mắt đầu tiên:** TP. Đà Nẵng (áp dụng mô hình địa giới 2 cấp hiện hành và bảng `area_aliases`).
- **Quy chuẩn chi phí:** Minh bạch 100%, không bao giờ coi chi phí chưa cung cấp là 0đ, tách biệt "Mỗi tháng" và "Cần chuẩn bị khi vào ở".
- **Bảo mật & Kiểm duyệt:** Bật RLS 100% trên toàn bộ các bảng; tin đăng mới tạo chuyển vào trạng thái `pending_review` và chỉ hiển thị công khai khi được Admin phê duyệt.

## Phase đã xong
- **Phase 0 — Nền móng:**
  - Khởi tạo Monorepo, cấu hình TypeScript, GitHub Actions CI.
  - Xây dựng `@troviet/shared` với Zod schemas, formatters tiền tệ VNĐ/diện tích/khoảng cách, Total Cost Calculator (test độ phủ đạt 100%).
  - Tạo Supabase migration v1 (18 bảng, PostGIS, Unaccent, Full RLS, rollback script).
  - Tạo dữ liệu mẫu `seed.sql` cho TP. Đà Nẵng có nhãn `[MẪU - DEV]`.
  - Xây dựng ứng dụng mobile Expo với Theme (Light/Dark), Brand kit, màn hình Hello/Healthcheck chạy được trên web và mobile.
- **Phase 1 — Tìm phòng & Nguồn tin:**
  - Migration v2: Bổ sung bảng `amenities`, `listing_amenities`, `user_preferences` kèm RLS policies.
  - Xây dựng module Authentication & Onboarding (khảo sát nhu cầu 3 bước: loại phòng, ngân sách, khu vực).
  - Màn hình Trang chủ (Home Feed): Tìm kiếm thông minh nhận diện bí danh theo thói quen (`area_aliases`), danh mục phòng, mục phòng mới đăng và phòng đã xác minh uy tín.
  - Màn hình Tìm kiếm & Bộ lọc nâng cao (Search Feed): Lọc đa chiều theo khoảng giá, loại nhà, tiện nghi bắt buộc, phân trang/sắp xếp, hỗ trợ tìm kiếm không dấu (`unaccent`).
  - Màn hình Chi tiết phòng (Property Detail): Địa chỉ chuẩn 2 cấp, bảng biểu phí minh bạch (`CostCard`), tiện nghi đầy đủ, bảo vệ SĐT chủ trọ cho người chưa đăng nhập.
  - Màn hình Đăng tin cho chủ trọ (Landlord Post): Nhập địa chỉ 2 cấp, bắt buộc nhập minh bạch chi phí điện nước, gửi duyệt tin an toàn.
  - Màn hình Quản trị duyệt tin (Admin Moderation Queue): Danh sách tin chờ duyệt, thao tác Duyệt (xuất bản ngay ra tìm kiếm) / Từ chối kèm lý do.

## Phase tiếp theo
- **Phase 2 — Bản đồ, chi phí, tin cậy:** Map Search (Bản đồ tương tác), Total Cost Calculator nâng cao, Landlord Verification (L1–L2), Favorites (Lưu phòng trọ).

## Việc nợ
Xem [BACKLOG.md](file:///d:/File_Website/web_tmđt/docs/BACKLOG.md).
