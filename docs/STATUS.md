# Trọ Việt — Tiến độ

**Phase hiện tại:** Phase 6 — Thuê & Quản lý (Rent & Management)
**Trạng thái:** Đã hoàn thành (Chờ duyệt chuyển sang Phase 7)

## Quyết định đã chốt (Sau Phase 6)
- **Hợp đồng thuê phòng mẫu chuẩn mực:** Mẫu hợp đồng chuẩn hóa cấu trúc pháp lý nhà ở Việt Nam, địa chỉ 2 cấp hành chính, tiền tệ số nguyên VNĐ, điều khoản minh bạch quyền và trách nhiệm hai bên.
- **AI Phân tích hợp đồng có bảo vệ quyền riêng tư:** Che mờ tự động (redact) thông tin cá nhân CCCD, SĐT, STK ngân hàng theo Luật 91/2025/QH15 trước khi phân tích; phát hiện bẫy cọc, điều khoản đơn phương tăng giá, thời hạn báo trước không công bằng kèm tuyên bố miễn trừ pháp lý bắt buộc: *"Trợ lý Trọ Việt chỉ hỗ trợ phân tích và lưu ý các điều khoản quan trọng, không thay thế tư vấn pháp lý chuyên nghiệp."*
- **Thanh toán VietQR NAPAS 24/7 trực tiếp P2P:** Tuyệt đối không giữ tiền người dùng hoặc hoạt động trung gian ví trái phép; hệ thống tự động sinh mã VietQR chuẩn NAPAS 24/7 chuyển thẳng vào tài khoản ngân hàng của chủ trọ với cú pháp chuẩn hóa `TROVIET <mã hóa đơn>`.
- **Mặt bằng giá thị trường & Lịch sử biến động 6 tháng tại TP. Đà Nẵng:** Dữ liệu chuẩn xác theo từng phường (Hải Châu I, Phước Mỹ, Hòa Khánh Bắc, Hòa Cường Nam) cung cấp mức giá trung bình phòng trọ/căn hộ mini và khung giá điện nước tham chiếu thực tế.

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
  - Bộ máy phòng chống lừa đảo (Anti-Scam Rule Engine trong `@troviet/shared`): Phát hiện bất thường giá rẻ phòng trọ, quét từ khóa rủi ro trong chat ("chuyen coc", "zalo", "stk") sinh cảnh báo an toàn tức thời, kiểm tra điều kiện đánh giá phòng có kiểm soát.
  - In-App Realtime Chat (`ChatListScreen`, `ChatRoomModal`): Tab Tin nhắn trực tiếp, ghim thông tin phòng ở đầu đoạn chat, banner nhắc nhở an toàn, banner cảnh báo khi phát hiện từ khóa đòi cọc, gợi ý câu hỏi nhanh (chips), gửi tin nhắn an toàn.
  - Đánh giá có kiểm soát (Controlled Reviews): Chặn chủ trọ tự đánh giá phòng của mình, chỉ người thuê đã từng nhắn tin trao đổi với chủ trọ mới được gửi đánh giá, hiển thị phản hồi chính thức từ chủ trọ.
  - Báo cáo vi phạm (Report Modal): Đầy đủ các lý do vi phạm (🚨 lừa đảo tiền cọc, ⚠️ phòng ảo, 💸 giá sai lệch, ⛔ thái độ khiếm nhã), bảo mật danh tính người báo cáo.
  - Hàng đợi duyệt Báo cáo vi phạm trên Admin (`AdminModerationScreen`): Tab Báo cáo vi phạm với các thao tác xử lý vi phạm / bỏ qua kèm ghi nhận Audit Log.
  - Trung tâm Thông báo (Notifications Modal): Hiển thị cảnh báo an toàn, tin nhắn mới, thông báo duyệt tin và đánh giá kèm chỉ báo chưa đọc trên header.
- **Phase 4 — Hoàn thiện & Thử nghiệm Beta:**
  - Bộ module Quyền riêng tư & Quản lý dữ liệu người dùng (`packages/shared/src/privacy/`): Quản lý sự đồng ý, Xuất dữ liệu JSON (Data Portability), Ẩn danh hóa / Xóa tài khoản (Right to Erasure) theo Luật 91/2025/QH15.
  - Giao diện Chính sách quyền riêng tư (`PrivacyPolicyModal.tsx`) & Quản lý dữ liệu cá nhân (`DataManagementModal.tsx`) tích hợp vào tab Cá nhân.
  - Thanh cảnh báo trạng thái mạng & Chống chịu ngoại tuyến (`NetworkStatusBanner.tsx`).
  - Bộ kiểm thử luồng trọn vẹn E2E (`packages/shared/test/e2e-journey.test.ts`): Kiểm tra 4 hành trình người dùng toàn diện; 100% test pass (31/31 unit & e2e tests).
  - Rà soát an ninh bảo mật theo chuẩn OWASP MASVS / ASVS: 100% các tiêu chí đạt chuẩn; RLS bảo vệ toàn diện.
  - Runbook vận hành, sao lưu và ứng phó sự cố ([docs/RUNBOOK.md](file:///d:/File_Website/web_tmđt/docs/RUNBOOK.md)).
  - Hồ sơ niêm yết Store & Metadata Beta tại TP. Đà Nẵng ([docs/STORE_METADATA.md](file:///d:/File_Website/web_tmđt/docs/STORE_METADATA.md)).
- **Phase 5 — Tin cậy nâng cao & AI (Sau MVP):**
  - Migration v4 (`20260924000004_phase5_trust_l3_saved_searches.sql` & rollback): Bảng `saved_searches` (bật RLS, index), mở rộng bảng `verifications` cho hồ sơ L3 chính chủ BĐS, enum thông báo `saved_search_match`.
  - Bộ máy Điểm tin cậy minh bạch (`calculateListingTrustScore`) & Phát hiện tin trùng lặp (`detectDuplicateListing`).
  - Bộ phân tích tìm kiếm ngôn ngữ tự nhiên bằng AI (`parseNaturalLanguageSearch`) kèm bộ test đánh giá đạt 100% độ chính xác.
  - Bộ phân tích phòng AI (`analyzeRoomListing`) so sánh giá với mặt bằng từng phường và Sổ tay kiểm tra phòng 10 tiêu chí (`STANDARD_VIEWING_CHECKLIST`).
  - Giao diện tìm kiếm AI & Quản lý tìm kiếm đã lưu trên `SearchScreen.tsx`, gợi ý câu lệnh AI trên `HomeScreen.tsx`.
  - Thẻ điểm tin cậy kèm bảng phân tích tiêu chí chi tiết và mục Phân tích AI trên `PropertyDetailModal.tsx`.
  - Màn hình sổ tay đi xem phòng tương tác `ViewingChecklistModal.tsx` theo dõi tiến độ và ghi chú chỉ số thực tế.
  - Tab kiểm duyệt hồ sơ L3 (Sổ đỏ / Ủy quyền chính chủ BĐS) trên `AdminModerationScreen.tsx` với Audit Logging.
- **Phase 6 — Thuê & Quản lý (Rent & Management):**
  - Migration v5 (`20260924000005_phase6_contracts_invoices.sql` & rollback script): Bảng `contracts`, bảng `invoices`, enums `contract_status`, `invoice_status`, thiết lập toàn bộ RLS policies cho cả bên thuê và bên cho thuê.
  - Bộ máy hợp đồng điện tử mẫu & Phân tích AI (`generateContractText`, `analyzeContractTerms`, `redactContractPII`): Bóc tách các điều khoản rủi ro, bẫy cọc, tăng giá đơn phương, chấm dứt bất công, tính điểm minh bạch (0-100), che mờ CCCD/SĐT/STK theo Luật 91/2025/QH15, hiển thị khuyến cáo pháp lý bắt buộc.
  - Bộ máy tính toán hóa đơn & Thanh toán VietQR NAPAS 24/7 (`calculateMonthlyInvoice`, `generateVietQRLink`): Tính điện theo công tơ kWh (số cũ → số mới), nước sinh hoạt m³, internet, dịch vụ; sinh QR chuyển khoản ngân hàng trực tiếp không trung gian giữ tiền.
  - Bộ dữ liệu mặt bằng giá thị trường & Lịch sử biến động 6 tháng tại TP. Đà Nẵng (`getWardAreaInsight`, `getAllAreaInsights`): Dữ liệu thực tế cho các phường trọng điểm (Hải Châu I, Phước Mỹ, Hòa Khánh Bắc, Hòa Cường Nam).
  - Giao diện Chi tiết Hợp đồng & Phân tích AI (`ContractDetailModal.tsx`): Ký xác nhận điện tử hai bên, xem toàn văn hợp đồng có toggle ẩn danh PII.
  - Giao diện Chi tiết Hóa đơn tiền phòng (`InvoiceDetailModal.tsx`): Bảng kê chi phí từng mục, mã VietQR quét thanh toán tức thì, nút xác nhận chuyển khoản.
  - Màn hình Bảng điều khiển Chủ trọ (`LandlordDashboardScreen.tsx`): Đo lường tỷ lệ lấp đầy, theo dõi doanh thu dự kiến/chưa thu, quản lý hợp đồng, form xuất hóa đơn tháng tự động.
  - Màn hình Mặt bằng giá thị trường (`AreaInsightsModal.tsx`): Xem so sánh giá phòng/căn hộ, xu hướng 6 tháng và khung giá điện nước tham chiếu Đà Nẵng; gắn lối vào từ cả Home Feed và Profile.
  - Đạt 53/53 tests pass across 19 test suites, typecheck 100% sạch sẽ.

## Phase tiếp theo
- **Phase 7 — Tối ưu hóa, Mở rộng & Tự động hóa:** Hoàn thiện trải nghiệm vận hành tự động, thông báo đẩy (push notification) nhắc hạn thanh toán, nâng cấp công cụ phân tích thị trường mở rộng toàn quốc.

## Việc nợ
Xem [BACKLOG.md](file:///d:/File_Website/web_tmđt/docs/BACKLOG.md).

