# Trọ Việt — Tiến độ

**Phase hiện tại:** Phase 7 — Ở ghép, Bàn giao thực địa & Tự động hóa (Roommates, Property Handovers & Automation)
**Trạng thái:** Đã hoàn thành toàn diện (Toàn bộ 37 modules theo SPEC.md đã hoàn tất)

## Quyết định đã chốt (Sau Phase 7)
- **Ghép người ở ghép minh bạch & bảo vệ quyền riêng tư (Roommate Matching):** Chấm điểm tương thích minh bạch (`CompatibilityScore` 0–100%) dựa trên thói quen sinh hoạt (giờ giấc, hút thuốc, thú cưng, mức độ sạch sẽ, giới tính, ngân sách); bảo vệ quyền riêng tư bằng cách chỉ hiển thị tên thân mật và kết nối ban đầu hoàn toàn qua In-App Chat.
- **Biên bản Bàn giao phòng thực địa điện tử (Property Handover):** Lưu trữ chính xác chỉ số công tơ điện và nước ban đầu (kWh, m³) làm căn cứ mốc tính hóa đơn tháng đầu tiên; checklist 10 hạng mục trang thiết bị cơ sở vật chất; cả chủ trọ và người thuê cùng ký xác nhận điện tử.
- **Tự động hóa lịch nhắc thuê & hóa đơn (Automated Reminders Scheduler):** Tự động phát hiện hóa đơn tiền phòng sắp đến hạn (trước 3 ngày, đúng ngày, quá hạn) kèm liên kết VietQR thanh toán nhanh; tự động nhắc hợp đồng sắp hết hạn trước 30 ngày để hai bên chủ động tái ký hoặc bàn giao phòng.

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
  - Bộ kiểm thử luồng trọn vẹn E2E (`packages/shared/test/e2e-journey.test.ts`): Kiểm tra 4 hành trình người dùng toàn diện; 100% test pass.
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
- **Phase 7 — Ở ghép, Bàn giao thực địa & Tự động hóa vận hành:**
  - Migration v6 (`20260924000006_phase7_roommates_handovers.sql` & rollback script): Bảng `roommate_profiles`, bảng `property_handovers`, các enum thói quen sinh hoạt và trạng thái bàn giao kèm đầy đủ RLS policies.
  - Bộ máy Ghép người ở ghép AI (`calculateRoommateCompatibility`): Đánh giá tương thích theo 5 tiêu chí thói quen sinh hoạt cốt lõi, ngân sách chia sẻ, giới tính và cảnh báo xung đột lối sống.
  - Bộ máy Biên bản bàn giao thực địa (`validateHandoverRecord`, `STANDARD_HANDOVER_ITEMS`): Ghi nhận chỉ số điện/nước đầu kỳ, 10 hạng mục cơ sở vật chất và xác nhận ký điện tử hai bên.
  - Bộ máy Lịch nhắc tự động (`checkRentInvoiceReminders`, `checkContractExpiryReminders`): Tự động phát hiện hóa đơn sắp đến hạn (trước 3 ngày) và hợp đồng sắp hết hạn (trước 30 ngày) sinh thông báo In-App Notifications kèm liên kết VietQR thanh toán nhanh.
  - Giao diện Ghép bạn cùng phòng (`RoommateMatchingScreen.tsx`, `RoommateProfileModal.tsx`): Bộ lọc đa chiều, danh sách ứng viên có điểm hòa hợp %, đối chiếu thói quen sinh hoạt trực quan.
  - Giao diện Biên bản bàn giao phòng thực địa (`ViewingHandoverModal.tsx`): Giao diện ký biên bản bàn giao, nhập chỉ số công tơ điện nước đầu vào, checklist thiết bị, tích hợp vào luồng hợp đồng.
  - Tích hợp điểm chạm và thông báo: Nút "Tìm bạn ở ghép" tại `HomeScreen.tsx` và `Profile`, hiển thị thông báo nhắc hạn tự động trên `NotificationsModal.tsx`.
  - Bộ kiểm thử trọn vẹn: Đạt **63/63 tests pass across 22 test suites**, typecheck TypeScript và lint 100% sạch sẽ.

## Trạng thái dự án
Toàn bộ **37/37 modules** trong kế hoạch đặc tả [docs/SPEC.md](file:///d:/File_Website/web_tmđt/docs/SPEC.md) đã được hoàn thành đầy đủ, đạt chuẩn kiến trúc sản phẩm thương mại cho người dùng Việt Nam.

## Việc nợ & Đề xuất tương lai
Xem [BACKLOG.md](file:///d:/File_Website/web_tmđt/docs/BACKLOG.md).


