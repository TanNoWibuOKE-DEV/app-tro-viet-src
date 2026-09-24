# ADR 001: Lựa chọn Tech Stack và Kiến trúc nền tảng cho Trọ Việt

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-24
- **Người quyết định:** Ban kỹ thuật Trọ Việt

## 1. Bối cảnh (Context)
Trọ Việt là sản phẩm ứng dụng di động hỗ trợ người Việt tìm, kiểm tra và thuê nhà ở an toàn, minh bạch chi phí. Sản phẩm hướng tới người dùng thực tế với quy mô ban đầu tinh gọn, cần tốc độ phát triển nhanh, an toàn dữ liệu, tính năng định vị không gian (PostGIS/bản đồ) và khả năng kiểm thử liên tục trên cả mobile và web.

## 2. Quyết định (Decision)

1. **Ứng dụng Mobile:**
   - Sử dụng **Expo (React Native) + TypeScript + Expo Router**.
   - Hỗ trợ cả iOS, Android và chạy thử nghiệm trên Web để phục vụ kiểm thử giao diện tự động.
   - Quản lý trạng thái và dữ liệu dùng React Hooks và Supabase Client.

2. **Hạ tầng Backend & Dữ liệu:**
   - Sử dụng **Supabase**: PostgreSQL kết hợp phần mở rộng không gian **PostGIS**, Auth (hỗ trợ OTP SĐT, OAuth), Realtime (chat, thông báo) và Storage (lưu ảnh phòng, tài liệu kiểm duyệt).
   - **Bắt buộc bật Row Level Security (RLS)** trên toàn bộ các bảng trong cơ sở dữ liệu.
   - Tuyệt đối không để `service_role` key xuất hiện trong ứng dụng client mobile hay trong source control.

3. **Cấu trúc Monorepo:**
   - `apps/mobile`: Mã nguồn ứng dụng di động Expo Router.
   - `packages/shared`: Chứa các định nghĩa kiểu dữ liệu (TypeScript types), bộ xác thực (Zod schemas), tiện ích định dạng tiền tệ và logic tính toán chi phí dùng chung.
   - `supabase/`: Quản lý các file SQL migration, seed data và database functions.

4. **Địa giới hành chính và Dữ liệu địa chỉ:**
   - Triệt để tuân thủ mô hình hành chính 2 cấp hiện hành tại Việt Nam (Tỉnh/Thành phố → Xã/Phường/Đặc khu).
   - Hỗ trợ bảng định danh bí danh khu vực (`area_aliases`) để xử lý các tên gọi theo thói quen của người thuê phòng ("quận Hải Châu cũ", "khu Mỹ Khê", "gần ĐH Duy Tân").

5. **Thị trường khởi động (Pilot Market):**
   - Chọn **TP. Đà Nẵng** làm thị trường kiểm thử và phát hành ban đầu.

## 3. Hệ quả (Consequences)
- Đảm bảo tính nhất quán dữ liệu và bảo mật ở tầng CSDL thông qua RLS policies.
- Giảm thiểu độ phức tạp vận hành máy chủ nhờ dịch vụ managed của Supabase.
- Giữ logic định dạng và nghiệp vụ chi phí (không coi chi phí chưa biết là 0 đồng) tập trung tại `packages/shared`.
