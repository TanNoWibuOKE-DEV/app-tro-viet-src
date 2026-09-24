# Trọ Việt — Nguồn dữ liệu chính thức (Data Sources)

Tài liệu này ghi lại nguồn gốc, ngày thu thập và hiện trạng của tất cả các tập dữ liệu thực tế được sử dụng trong hệ thống Trọ Việt theo nguyên tắc: **Không tự bịa dữ liệu**.

---

## 1. Danh mục địa giới hành chính Việt Nam

- **Mô hình hành chính:** 2 cấp (Cấp 1: Tỉnh / Thành phố trực thuộc Trung ương; Cấp 2: Xã / Phường / Thị trấn / Đặc khu).
- **Cơ sở pháp lý & Chuẩn:** Nghị quyết của Ủy ban Thường vụ Quốc hội và cổng thông tin Tổng cục Thống kê (GSO).
- **Thị trường thử nghiệm ban đầu:** TP. Đà Nẵng.
- **Tình trạng hiện tại:**
  - Môi trường Dev/Test: Sử dụng dữ liệu mẫu được gắn nhãn rõ ràng `[MẪU - DEV]` tại `supabase/seed.sql`.
  - Môi trường Production: Sẽ nhập khẩu (import) từ cơ sở dữ liệu quốc gia về danh mục đơn vị hành chính khi triển khai staging/production.

## 2. Bí danh khu vực (Area Aliases) & Điểm mốc (Landmarks)

- **Mục đích:** Hỗ trợ người dùng tìm kiếm theo thói quen (tên quận huyện cũ, tên trường học, khu vực bãi biển, tên khu phố).
- **Nguồn tổng hợp ban đầu (TP. Đà Nẵng):**
  - Các trường Đại học: ĐH Bách Khoa, ĐH Kinh Tế, ĐH Sư Phạm, ĐH Duy Tân, ĐH FPT...
  - Khu vực dân cư quen thuộc: Khu Mỹ Khê, Khu An Thượng, Cầu Rồng, Cầu Sông Hàn, Bến xe Trung tâm...
  - Nhãn: `[MẪU - DEV]` phục vụ kiểm thử Phase 0–2.
