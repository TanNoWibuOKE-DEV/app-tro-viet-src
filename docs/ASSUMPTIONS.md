# Trọ Việt — Danh sách Giả định (Assumptions)

Tài liệu này ghi lại các giả định thiết kế và vận hành khi chưa có thông tin chính thức hoặc đang chờ xác nhận từ chủ dự án, tuân thủ nguyên tắc không bịa dữ liệu thật.

---

## Phase 0 — Nền móng

1. **Tech Stack:**
   - Sử dụng stack mặc định theo [SPEC.md](file:///d:/File_Website/web_tmđt/docs/SPEC.md): Expo (React Native + TypeScript + Expo Router) cho ứng dụng di động; Supabase (Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions) cho hạ tầng backend.
   - Cấu trúc thư mục dạng Monorepo (`apps/mobile`, `packages/shared`, `supabase/`).

2. **Thị trường ra mắt đầu tiên:**
   - Chọn **TP. Đà Nẵng** làm thị trường khởi động đầu tiên (phù hợp với các kịch bản mẫu: ĐH Duy Tân, khu vực Mỹ Khê, Hải Châu trong đặc tả).

3. **Danh mục đơn vị hành chính & Địa chỉ:**
   - Áp dụng triệt để mô hình hành chính 2 cấp hiện hành (Tỉnh/Thành phố → Xã/Phường/Đặc khu).
   - Trong quá trình phát triển dev cục bộ, sử dụng dữ liệu hành chính mẫu có gắn nhãn `[MẪU - DEV]` cho TP. Đà Nẵng, schema thiết kế có sẵn phiên bản và bảng `area_aliases` để hỗ trợ tìm kiếm theo tên quen thuộc.
   - Dữ liệu thực tế toàn quốc sẽ được import từ nguồn dữ liệu chính thức vào `docs/DATA_SOURCES.md` khi phát hành.

4. **Bản đồ (Maps):**
   - Trong Phase 0, thiết kế kiến trúc theo mẫu Adapter/Provider (`MapProvider`) để dễ dàng tích hợp hoặc chuyển đổi giữa Goong / VietMap / Mapbox / Google Maps mà không làm thay đổi logic ứng dụng.

5. **Xác thực OTP & Môi trường chạy thử:**
   - Phase 0 và Phase 1 ưu tiên dùng cơ chế Test OTP của Supabase Auth (số điện thoại test cố định) để tiết kiệm chi phí trước khi ký hợp đồng với đơn vị cung cấp SMS Brandname / Zalo ZNS.

---

## Phase 4 — Hoàn thiện & Thử nghiệm Beta

1. **Quyền riêng tư & Xóa tài khoản (Right to Erasure theo Luật 91/2025/QH15):**
   - Khi người dùng gửi yêu cầu xóa tài khoản, hệ thống sẽ thực hiện **ẩn danh hóa (Anonymization)**: xóa sạch số điện thoại, email, số CCCD, hình đại diện và họ tên thật khỏi hồ sơ.
   - Các đánh giá phòng và tin nhắn lịch sử được chuyển người gửi thành "Người dùng đã xóa tài khoản" nhằm bảo vệ tính toàn vẹn của dữ liệu tin cậy cộng đồng mà không lưu giữ dữ liệu định danh cá nhân.

2. **Kênh phân phối Beta kín tại Đà Nẵng:**
   - Đợt thử nghiệm Beta kín hỗ trợ cả phiên bản Web PWA (truy cập tức thời qua link web di động) và đóng gói Android APK để kiểm thử nội bộ trước khi nộp lên Google Play / App Store.

3. **Xử lý mất kết nối (Offline Resilience):**
   - Dữ liệu phòng đã lưu (Favorites) và thông tin cấu hình cá nhân được lưu trữ bền bỉ ở Local Storage để xem được ngay cả khi ngoại tuyến.
   - Các thao tác đòi hỏi kết nối mạng thời gian thực (gửi tin nhắn mới, gửi đánh giá, nộp báo cáo) sẽ hiển thị thông báo thân thiện "Yêu cầu kết nối mạng để tiếp tục".
