# Trọ Việt — Tiến độ

**Phase hiện tại:** Phase 3 — Liên hệ & cộng đồng
**Trạng thái:** Đã hoàn thành (Chờ xác nhận để chuyển sang Phase 4)

## Quyết định đã chốt (Sau Phase 3)
- **Tech Stack:** Monorepo (`apps/mobile`, `packages/shared`, `supabase/`), Expo (React Native + TypeScript + Expo Router) + Supabase (Postgres, PostGIS, Auth, Storage, Realtime). Chi tiết tại [001-stack.md](file:///d:/File_Website/web_tmđt/docs/adr/001-stack.md).
- **Thị trường ra mắt đầu tiên:** TP. Đà Nẵng (áp dụng mô hình địa giới 2 cấp hiện hành và bảng `area_aliases`).
- **Bản đồ & Khoảng cách:** Tính toán khoảng cách địa lý theo công thức Haversine, hỗ trợ lọc phòng quanh mốc quen thuộc (ĐH Duy Tân, ĐH Bách Khoa, Mỹ Khê, Cầu Rồng); hiển thị khoảng cách định dạng Việt Nam (`2,5 km`, `800 m`).
- **Máy tính chi phí cá nhân:** Cho phép người dùng tùy biến số người, số xe máy, mức điện (kWh) và nước (m³) để ra ước tính chính xác theo nhu cầu ở thực tế.
- **Xác minh L2:** Quy trình nộp CCCD và phê duyệt trên Admin có ghi nhận Audit Log.
- **Anti-Scam có giải thích (Explainable Rule Engine):** Cảnh báo văn minh, minh bạch khi phát hiện giá thấp bất thường hoặc từ khóa đòi chuyển cọc sớm/kéo ra ngoài app ("chuyen coc", "zalo", "stk").
- **Đánh giá có kiểm soát (Controlled Reviews):** Chống đánh giá ảo triệt để bằng việc chỉ cho phép người thuê đã từng nhắn tin liên hệ chủ trọ gửi đánh giá; hỗ trợ phản hồi chính thức từ chủ trọ.

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
- **Phase 2 — Bản đồ, chi phí, tin cậy:**
  - Màn hình Bản đồ tìm trọ (Map Search Tab): Định vị ghim giá tiền (`2.5tr`, `4.8tr`), chọn mốc tiện ích tính tự động khoảng cách `2,5 km`, xem nhanh phòng trọ.
  - Modal Máy tính tổng chi phí tương tác (Interactive Cost Calculator): Người dùng tự kéo chỉnh số người, số xe, kWh điện, m³ nước.
  - Tính năng Lưu phòng (Favorites): Nút thả tim trên mọi thẻ phòng, danh sách phòng đã lưu ngoại tuyến (offline ready).
  - Màn hình So sánh phòng (Property Comparison Modal): Đặt 2–3 phòng cạnh nhau đối chiếu giá thuê, cọc, tổng chi phí tháng, chi phí vào ở, diện tích, tiện nghi và cấp độ xác minh.
  - Quy trình Xác minh danh tính chủ trọ L2: Form nộp CCCD tại tab Cá nhân, giao diện duyệt L2 trên Admin có ghi nhận Audit Log.
- **Phase 3 — Liên hệ & cộng đồng:**
  - Migration v3 (`20260924000003_phase3_chat_reviews_reports.sql` & rollback script): Bảng `notifications`, RLS policies cho `conversations`, `reviews` landlord reply, `reports`.
  - Bộ máy phòng chống lừa đảo (Anti-Scam Rule Engine trong `@troviet/shared`): Phát hiện bất thường giá rẻ phòng trọ, quét từ khóa rủi ro trong chat ("chuyen coc", "zalo", "stk") sinh cảnh báo an toàn tức thời, kiểm tra điều kiện đánh giá phòng có kiểm soát. Đạt 100% test pass (22 tests).
  - In-App Realtime Chat (`ChatListScreen`, `ChatRoomModal`): Tab Tin nhắn trực tiếp, ghim thông tin phòng ở đầu đoạn chat, banner nhắc nhở an toàn, banner cảnh báo khi phát hiện từ khóa đòi cọc, gợi ý câu hỏi nhanh (chips), gửi tin nhắn an toàn.
  - Đánh giá có kiểm soát (Controlled Reviews): Chặn chủ trọ tự đánh giá phòng của mình, chỉ người thuê đã từng nhắn tin trao đổi với chủ trọ mới được gửi đánh giá, hiển thị phản hồi chính thức từ chủ trọ.
  - Báo cáo vi phạm (Report Modal): Đầy đủ các lý do vi phạm (🚨 lừa đảo tiền cọc, ⚠️ phòng ảo, 💸 giá sai lệch, ⛔ thái độ khiếm nhã), bảo mật danh tính người báo cáo.
  - Hàng đợi duyệt Báo cáo vi phạm trên Admin (`AdminModerationScreen`): Tab Báo cáo vi phạm với các thao tác xử lý vi phạm / bỏ qua kèm ghi nhận Audit Log.
  - Trung tâm Thông báo (Notifications Modal): Hiển thị cảnh báo an toàn, tin nhắn mới, thông báo duyệt tin và đánh giá kèm chỉ báo chưa đọc trên header.

## Phase tiếp theo
- **Phase 4 — Hoàn thiện & Thử nghiệm Beta (Tuần 13–15):** Kiểm thử luồng trọn vẹn (End-to-End Test), tối ưu hiệu năng mobile, tinh chỉnh trải nghiệm mạng yếu/offline cache, chuẩn bị bản thử nghiệm Beta đóng cho sinh viên & người đi làm tại Đà Nẵng.

## Việc nợ
Xem [BACKLOG.md](file:///d:/File_Website/web_tmđt/docs/BACKLOG.md).
