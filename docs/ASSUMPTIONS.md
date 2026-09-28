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

---

## Phase 5 — Tin cậy nâng cao & AI

1. **AI Natural Language Search (Cơ chế Hybrid):**
   - AI Search phân tích câu truy vấn tự nhiên tiếng Việt (kể cả không dấu, viết tắt) thành bộ lọc có cấu trúc (khoảng giá, tiện nghi, khu vực/trường học), đồng thời hiển thị thẻ *"🤖 Trợ lý AI đã hiểu..."* cho người dùng xem và bấm chỉnh sửa/xóa nhanh.
   - Nếu AI không phân tích được hoặc có lỗi, hệ thống tự động fallback về tìm kiếm từ khóa unaccent truyền thống để đảm bảo tính sẵn sàng cao.

2. **Điểm tin cậy (Explainable Trust Score):**
   - Áp dụng thang điểm 0–100 kèm phân loại rõ ràng (ví dụ: "95/100 • Rất tin cậy") và liệt kê các lý do giải thích minh bạch (cấp độ L1/L2/L3, chi phí minh bạch 100%, đánh giá tốt). Tuyệt đối không dùng mô hình hộp đen.

3. **Hồ sơ xác minh Cấp L3 (Quyền cho thuê bất động sản):**
   - Chấp nhận Giấy chứng nhận quyền sử dụng đất (Sổ hồng/Sổ đỏ) đối với chủ nhà sở hữu trực tiếp HOẶC Hợp đồng ủy quyền/cho thuê lại hợp pháp đối với đơn vị quản lý vận hành căn hộ mini.

---

## Phase 6 — Thuê & Quản lý

1. **Tuân thủ pháp lý thanh toán P2P VietQR:**
   - Trọ Việt tuyệt đối không nắm giữ tiền của khách thuê hoặc làm đơn vị trung gian thanh toán thu hộ. Tiền được chuyển khoản trực tiếp 24/7 từ tài khoản người thuê đến tài khoản ngân hàng chủ trọ thông qua chuẩn VietQR NAPAS 24/7.

2. **Bảo vệ quyền riêng tư trong Hợp đồng (Luật 91/2025/QH15):**
   - Trước khi gửi nội dung hợp đồng qua các mô hình phân tích tự động, toàn bộ thông tin định danh cá nhân nhạy cảm (số CCCD, SĐT cá nhân, số tài khoản ngân hàng) bắt buộc phải được che mờ tự động.
   - Mọi phân tích điều khoản hợp đồng đều hiển thị rõ ràng khuyến cáo pháp lý rằng ứng dụng không cung cấp dịch vụ tư vấn pháp luật chuyên nghiệp.

---

## Phase 7 — Ở ghép, Chế độ thực địa & Vận hành tự động

1. **Thuật toán ghép người ở ghép (Roommate Matching):**
   - Đánh giá độ tương thích dựa trên các tiêu chí sinh hoạt cốt lõi: thói quen giờ giấc (ngủ sớm/thức khuya), lối sống (hút thuốc/không), thú cưng, ngân sách chia tiền phòng và trường học/nơi làm việc.
   - Điểm số hòa hợp (Compatibility Score 0–100%) luôn giải thích rõ các điểm tương đồng lớn và các điểm cần người dùng tự trao đổi thêm.

2. **Chế độ đi xem phòng thực địa & Bàn giao phòng (Viewing Mode):**
   - Hỗ trợ lưu trữ ngoại tuyến chỉ số công tơ điện và nước ban đầu làm căn cứ pháp lý minh bạch cho các kỳ tính hóa đơn tiền phòng sau này.

---

## Phase 9 — Vận hành Thực tế Toàn quốc (Production Scale & Full Operational Suite)

1. **Thông báo đẩy ngoại tuyến (Offline Push Notifications):**
   - Đăng ký và lưu trữ Expo Push Token trên hồ sơ người dùng.
   - Khi thiết bị ở chế độ nền hoặc tắt màn hình, hệ thống kích hoạt thông báo hệ điều hành (OS Push Notification) cho các sự kiện: tin nhắn mới, hóa đơn tiền phòng sắp đến hạn, hợp đồng sắp hết hạn và thông báo duyệt tin.
   - Trong môi trường dev/offline, hệ thống tích hợp fallback cơ chế Local Scheduled Notifications mượt mà.

2. **Tự động hóa đối soát thanh toán VietQR (Automated VietQR Reconciliation Webhook):**
   - Nội dung chuyển khoản gắn mã hóa đơn chuẩn hóa `TRV<invoice_id_ngan>` (ví dụ `TRV1029`).
   - Webhook Engine tiếp nhận payload chuẩn ngân hàng (SePAY / Open Banking), đối soát số tiền khớp 100% với số tiền hóa đơn (`integer VND`), tự động chuyển trạng thái hóa đơn sang `paid` và gửi thông báo xác nhận cho cả hai bên.
   - Tích hợp Sandbox Test Trigger trên giao diện hóa đơn để người dùng thử nghiệm luồng đối soát ngay lập tức mà không cần tài khoản ngân hàng thật.

3. **Mở rộng đa thị trường (Hà Nội, TP. Hồ Chí Minh):**
   - Áp dụng mô hình địa giới hành chính 2 cấp hiện hành cho TP. Hà Nội (Cầu Giấy, Đống Đa, Hai Bà Trưng, Nam Từ Liêm...) và TP. Hồ Chí Minh (Quận 1, Bình Thạnh, Thủ Đức - Làng Đại học...).
   - Bổ sung dữ liệu mặt bằng giá thực tế cho các phường sinh viên trọng điểm tại Hà Nội và TP.HCM vào Area Insights Engine.
   - Cho phép người dùng chuyển đổi thị trường linh hoạt ngay tại Header `📍 Đà Nẵng | Hà Nội | TP. Hồ Chí Minh`.

---

## Phase 10 — Nền tảng Doanh nghiệp & Vận hành Chuyên sâu (Enterprise Operations & Identity Intelligence)

1. **Hạ tầng CSDL v7 & Rollback Script:**
   - Bổ sung các bảng lưu trữ bền vững: `push_tokens`, `bank_transactions`, `ekyc_verifications`.
   - Bật RLS tuyệt đối cho tất cả các bảng mới; người dùng chỉ có quyền xem/sửa token và hồ sơ eKYC của chính mình; chủ trọ chỉ xem được giao dịch thanh toán liên quan đến hóa đơn của mình.

2. **Quy trình eKYC & Bảo vệ dữ liệu CCCD (Luật 91/2025/QH15):**
   - Số định danh cá nhân 12 số được kiểm tra tính hợp lệ cấu trúc (mã tỉnh/thành khai sinh, mã thế kỷ & giới tính, năm sinh), kiểm tra đủ 18 tuổi.
   - Dữ liệu CCCD được băm an toàn (`id_card_number_hash`) khi lưu trữ; không lưu ảnh khuôn mặt thô chưa mã hóa.
   - Hỗ trợ mô phỏng luồng quét chip NFC và nhận diện chuyển động (liveness detection) để nâng cấp hồ sơ L2 tức thời.

3. **Phân tích Tài chính & Dòng tiền Chủ trọ (Landlord Financial Analytics):**
   - Tự động tổng hợp doanh thu từ dữ liệu thực tế hóa đơn tháng: Tiền phòng, điện, nước, dịch vụ.
   - Tính toán tỷ lệ lấp đầy phòng (Occupancy Rate %) và tỷ lệ thu tiền đúng hạn (On-Time Collection Rate %).



