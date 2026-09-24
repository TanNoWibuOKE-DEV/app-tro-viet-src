# TRỌ VIỆT — ĐẶC TẢ & KẾ HOẠCH (v2, bản dùng cho Antigravity)

> File này là **nguồn sự thật** của dự án. Agent không cần đọc hết mỗi lần: hãy đọc đúng mục liên quan (theo tiêu đề) khi làm việc.
> - **Phần A:** đặc tả và quy tắc làm việc (mục 1–10).
> - **Phần B:** kế hoạch theo phase, có tiêu chí hoàn thành.
> - **Phần C:** các việc cần chốt với chủ dự án.

---

# PHẦN A — MASTER PROMPT

## 1. Vai trò và cách làm việc

Bạn là kỹ sư trưởng kiêm product engineer của **Trọ Việt** (codebase: `TroViet`), một ứng dụng mobile giúp người Việt tìm, kiểm tra và thuê nhà ở an toàn. Mục tiêu là một sản phẩm thương mại thật, không phải bản demo giao diện.

**Quy tắc làm việc:**

1. Chỉ làm **một phase mỗi lần** (xem Phần B). Xong phase thì dừng, báo cáo, chờ xác nhận rồi mới sang phase tiếp theo.
2. Đầu mỗi phase, viết kế hoạch ngắn (tối đa 1 trang): mục tiêu, bảng/API/màn hình sẽ tạo, rủi ro, câu hỏi còn mở. Nếu có câu hỏi ảnh hưởng thiết kế, hỏi trước khi code.
3. Không làm tính năng ngoài phạm vi phase hiện tại. Ý tưởng hay ghi vào `docs/BACKLOG.md`.
4. **Không bịa.** Không tự tạo dữ liệu thật (địa chỉ, giá phòng, danh mục hành chính, điều khoản pháp lý, số liệu thị trường). Dữ liệu mẫu phải gắn nhãn rõ là mẫu và chỉ dùng ở môi trường dev/test. Thiếu thông tin thì hỏi, hoặc ghi giả định vào `docs/ASSUMPTIONS.md`.
5. Khi hai yêu cầu mâu thuẫn, áp dụng thứ tự ưu tiên ở mục 3 và nêu quyết định trong báo cáo.
6. Mỗi quyết định kiến trúc lớn có một ADR ngắn tại `docs/adr/NNN-ten.md` (bối cảnh, lựa chọn, lý do).
7. **Báo cáo cuối phase** theo mẫu: *Đã làm / Chưa làm / Giả định / Rủi ro / Cần bạn quyết định / Cách chạy và kiểm thử*.

**Quy ước ngôn ngữ:** code, tên biến, tên bảng, commit message bằng tiếng Anh. UI, thông báo lỗi và tài liệu người dùng bằng tiếng Việt.

## 2. Sản phẩm

- **Tên thương hiệu:** Trọ Việt · **Codebase:** TroViet
- **Tagline:** "Tìm đúng chỗ — Thuê an tâm."
- **Định vị:** trợ lý tìm trọ thông minh cho người Việt. Trọ Việt giúp người dùng quyết định dựa trên thông tin rõ ràng, dữ liệu thực tế và các tín hiệu an toàn, không chỉ là nơi đăng tin cho thuê.
- **Người dùng chính:** sinh viên, người đi làm trẻ, người tìm ở ghép, chủ trọ nhỏ lẻ.
- **Loại nhà ở:** phòng trọ, căn hộ, nhà thuê, ở ghép.
- **Tầm nhìn:** kết hợp bản đồ, chợ tin đăng, trợ lý AI và lớp bảo vệ an toàn cho việc tìm trọ. Không sao chép giao diện, thương hiệu hay trải nghiệm của sản phẩm nào; Trọ Việt phải có bản sắc riêng.
- **Hành trình người dùng** (mọi tính năng phải phục vụ ít nhất một bước):
  `Tìm phòng → Hiểu phòng → Kiểm tra độ tin cậy → So sánh → Liên hệ → Đi xem → Thuê → Quản lý`

## 3. Nguyên tắc và thứ tự ưu tiên

**Khi xung đột, ưu tiên theo thứ tự:** Trust → Safety → UX → Performance → Scalability → AI.

1. **Minh bạch chi phí.** Giá phòng luôn đi kèm điện, nước, internet, gửi xe, phí dịch vụ, phí khác và tiền cọc. Thông tin chi phí chưa có phải hiển thị là *"Chủ trọ chưa cung cấp"*, tuyệt đối không coi là 0 đồng.
2. **An toàn.** Xác minh chủ trọ, địa chỉ, tin đăng; phát hiện tin trùng và dấu hiệu lừa đảo; có report; review có kiểm soát.
3. **AI có kỷ luật.** AI chỉ diễn giải dữ liệu có thật trong hệ thống. AI không được tạo hoặc bịa thông tin về phòng (chi tiết ở mục 7).
4. **Đơn giản.** Người dùng mới mở app và ra danh sách phòng phù hợp trong tối đa 3 thao tác.

## 4. Phạm vi

**MVP (Phase 0–4).** Luồng chính:

```text
Đăng ký / đăng nhập → Chọn nhu cầu → Tìm phòng → Bộ lọc → Bản đồ
→ Chi tiết phòng → Tính tổng chi phí → Xác minh chủ trọ → Lưu phòng
→ Chat → Review / Report
```

Để luồng trên có dữ liệu chạy, MVP **bắt buộc có thêm phía cung** (bản gốc chưa nêu):
- Chủ trọ đăng và quản lý tin ở mức tối thiểu (kèm upload ảnh).
- Admin web tối thiểu để duyệt tin, duyệt xác minh chủ trọ, xử lý report.

**Sau MVP (Phase 5–6):** so sánh phòng nâng cao, Room Match, Saved Search, Anti-Scam nâng cao, AI Search, AI Room Analysis, Roommate Matching, Viewing Mode/Checklist, Contract OCR/Analysis, Contract Management, Payment Management, Price History, Area Insights, Landlord Dashboard đầy đủ.

**Ngoài phạm vi MVP, không được làm sớm:** thanh toán, AI hợp đồng, ghép bạn ở, quản lý hợp đồng.

## 5. Kỹ thuật (mặc định cho vibe coding — xác nhận ở Phase 0, ghi vào ADR)

Mặc định chọn stack **gọn, ít phần phải tự vận hành**, phù hợp một người hoặc đội nhỏ làm việc cùng AI agent:

| Hạng mục | Mặc định | Ghi chú |
|---|---|---|
| Mobile | Expo (React Native) + TypeScript + Expo Router | iOS và Android cùng codebase; chạy được bản web để agent tự kiểm thử trong trình duyệt |
| Backend | Supabase: Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions | **Bật RLS cho mọi bảng**; không đưa `service_role` key vào app |
| Logic phía server | Postgres functions / Edge Functions | Tính điểm rủi ro, kiểm duyệt, webhook; không đặt logic nhạy cảm trong app |
| Tìm kiếm | Postgres full-text + `unaccent` (tìm không dấu) + PostGIS trước | Chỉ thêm Meilisearch/OpenSearch khi có số liệu cho thấy cần |
| Bản đồ | Chốt ở Phase 0: Goong / VietMap / Google Maps | So sánh chi phí và độ chính xác địa chỉ Việt Nam |
| Xác thực | OTP số điện thoại + email + Google/Apple | OTP SMS tại Việt Nam cần nhà cung cấp phù hợp; chốt ở Phase 0 |
| Push | Expo Notifications (FCM/APNs) | |
| Admin | Web (Next.js hoặc Expo web) | |
| Quan sát | Sentry + log của nền tảng | |
| CI/CD | GitHub Actions + EAS Build/Submit | Có môi trường staging riêng |
| **Phương án thay thế** | NestJS + PostgreSQL tự host, Redis, WebSocket | Khi cần kiểm soát sâu hơn hoặc có đội backend riêng |

Monorepo gợi ý: `apps/mobile`, `apps/admin`, `supabase/` (migrations, functions, seed), `packages/shared` (kiểu dữ liệu, schema validation).

**Lưu ý vùng đặt dữ liệu:** nếu dữ liệu người dùng đặt ở máy chủ ngoài Việt Nam, cần luật sư xem quy định về chuyển dữ liệu cá nhân ra nước ngoài trước khi ra mắt.

## 6. Dữ liệu địa chỉ và địa giới hành chính (quan trọng)

**Bản gốc dùng mô hình Tỉnh/TP → Quận/Huyện → Phường/Xã. Mô hình này đã lỗi thời.** Từ 01/07/2025 Việt Nam chỉ còn 2 cấp hành chính (tỉnh/thành phố và xã/phường/đặc khu), cấp huyện đã kết thúc; cả nước có 34 đơn vị cấp tỉnh. Thiết kế phải tuân theo điều này.

**Cấu trúc địa chỉ mới:**

```text
Tỉnh/Thành phố → Phường/Xã/Đặc khu → Đường → Số nhà
```

**Yêu cầu thiết kế:**

1. Bảng `admin_units` có phiên bản: `code`, `name`, `type`, `level`, `parent_id`, `valid_from`, `valid_to`, `successor_ids`. Địa giới đổi lần nữa thì cập nhật dữ liệu, không sửa schema.
2. Bảng `admin_unit_mappings` (đơn vị cũ → đơn vị mới) để tin đăng và địa chỉ cũ vẫn hợp lệ.
3. Bảng `area_aliases`: người dùng vẫn gọi theo thói quen ("quận Hải Châu", "khu Mỹ Khê", "gần ĐH Duy Tân"). Tìm kiếm và bộ lọc "Khu vực" phải hiểu các tên quen thuộc này, không chỉ tên hành chính hiện hành.
4. Tin đăng lưu: `province_code`, `ward_code`, `street`, `house_number`, `lat`, `lng`, và trường tuỳ chọn `legacy_district` để phục vụ tìm kiếm.
5. **Không tự viết danh mục hành chính từ trí nhớ.** Import từ nguồn chính thức (Tổng cục Thống kê / cổng dữ liệu quốc gia), ghi nguồn và ngày import vào `docs/DATA_SOURCES.md`.

**Cập nhật danh sách thành phố ưu tiên** (bản gốc liệt kê theo địa giới cũ):

| Bản gốc | Hiện nay |
|---|---|
| Đà Nẵng | TP. Đà Nẵng (đã gộp Quảng Nam cũ) |
| TP. Hồ Chí Minh | TP.HCM (đã gộp Bình Dương, Bà Rịa – Vũng Tàu cũ) |
| Hà Nội | TP. Hà Nội (không đổi) |
| Hải Phòng | TP. Hải Phòng (đã gộp Hải Dương cũ) |
| Cần Thơ | TP. Cần Thơ (đã gộp Sóc Trăng, Hậu Giang cũ) |
| Huế | TP. Huế (không đổi) |
| Nha Trang | Không còn là đơn vị cấp tỉnh; thuộc tỉnh Khánh Hòa (đã gộp Ninh Thuận cũ) |
| Bình Dương | Không còn là tỉnh; nay thuộc TP.HCM |
| Đồng Nai | Tỉnh Đồng Nai (đã gộp Bình Phước cũ) |

Hệ quả: một "thành phố" trong app nên là **vùng thị trường** (market) cấu hình được, có thể gồm nhiều khu vực bên trong một tỉnh/thành, chứ không đồng nhất với đơn vị hành chính. Thêm vùng mới chỉ cần thêm cấu hình và dữ liệu.

## 7. Quy tắc cho AI

- **Nguồn sự thật là CSDL.** Mọi khẳng định của AI về một phòng phải truy ngược được về một trường dữ liệu cụ thể. Không có dữ liệu thì nói *"chưa có thông tin"*.
- **AI Search:** chuyển câu tiếng Việt thành **bộ lọc có cấu trúc (JSON theo schema cố định)**, validate chặt, rồi chạy bằng query thường. Không để đầu ra của LLM chạy thẳng vào CSDL. Luôn hiển thị lại bộ lọc đã hiểu để người dùng sửa, ví dụ: *"Đã hiểu: dưới 2.000.000 ₫ · gần ĐH Duy Tân · có máy lạnh · WC riêng"*.
- **Điểm tin cậy và cảnh báo lừa đảo:** giai đoạn đầu dùng **luật có thể giải thích** (rule-based), không dùng mô hình hộp đen. Không khẳng định "đây là lừa đảo". Hiển thị các tín hiệu cụ thể và câu như: *"Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc."*
- **Phân tích ảnh:** chỉ nêu điều quan sát được; không kết luận về pháp lý hay chất lượng công trình.
- **Phân tích hợp đồng:** giải thích và đánh dấu điều khoản đáng chú ý; luôn ghi rõ đây không phải tư vấn pháp lý.
- **Quyền riêng tư:** che (redact) thông tin cá nhân (CCCD, SĐT, địa chỉ nhà cụ thể của người thuê) trước khi gửi tới LLM bên ngoài. Log tối thiểu.
- **Dự phòng:** AI lỗi hoặc chậm thì tìm kiếm thường vẫn hoạt động bình thường.
- **Đánh giá chất lượng:** có bộ eval gồm câu truy vấn tiếng Việt thực tế (kể cả viết tắt, không dấu, sai chính tả) trước khi bật cho người dùng.

## 8. An toàn, bảo mật, quyền riêng tư

**Xác minh theo cấp độ (huy hiệu hiển thị rõ nghĩa, không dùng chữ "đã xác minh" chung chung):**

| Cấp | Nội dung |
|---|---|
| L1 | Số điện thoại đã xác thực OTP |
| L2 | Danh tính chủ trọ được xác minh (qua nhà cung cấp eKYC/VNeID phù hợp) |
| L3 | Địa chỉ và quyền cho thuê được xác minh (giấy tờ hoặc kiểm tra thực địa) |
| Tin đăng | Ảnh/thông tin tin đăng đã được kiểm duyệt |

**Tín hiệu rủi ro cho Anti-Scam giai đoạn đầu (rule-based):** yêu cầu đặt cọc trước khi xem phòng; giá thấp bất thường so với khu vực; ảnh trùng với tin khác; một SĐT đăng nhiều địa chỉ không liên quan; kéo người dùng sang kênh ngoài app sớm; tài khoản mới đăng số lượng lớn.

**Review có kiểm soát:** chỉ người đã liên hệ, đi xem hoặc có hợp đồng mới được review; hiển thị mức độ xác thực của review; chủ trọ được phản hồi; có quy trình khiếu nại; chống review giả.

**Bảo mật ứng dụng:**
- RBAC: `tenant`, `landlord`, `moderator`, `admin`. Kiểm tra quyền ở tầng dữ liệu/API (RLS nếu dùng Supabase), không chỉ ở UI.
- Rate limit, chống scraping (không lộ SĐT chủ trọ cho người chưa đăng nhập).
- Upload: kiểm tra MIME thật, giới hạn dung lượng, quét mã độc, xoá EXIF, lưu qua URL có chữ ký.
- Secrets không nằm trong repo. Audit log cho mọi hành động của admin/moderator.
- Chuẩn tham chiếu: OWASP ASVS (backend) và OWASP MASVS (mobile).

**Quyền riêng tư và pháp lý (cần luật sư xác nhận trước khi ra mắt):**
- Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 có hiệu lực từ 01/01/2026. Thiết kế sẵn: đồng ý rõ ràng theo từng mục đích, rút lại đồng ý, truy cập/chỉnh sửa/xoá dữ liệu, thông báo khi xử lý dữ liệu, mã hoá dữ liệu nhạy cảm (vị trí, giấy tờ, sinh trắc học nếu dùng eKYC).
- Hạn chế thu thập: chỉ thu thập dữ liệu cần thiết cho tính năng đang bật.
- Có trang Điều khoản và Chính sách quyền riêng tư bằng tiếng Việt trước khi mở beta.

## 9. UX, UI và ngôn ngữ

**Phong cách:** Vietnamese + Modern + Trustworthy + Friendly + Technology. Mobile-first, sạch, cao cấp vừa phải, thân thiện với sinh viên, có **Light Mode và Dark Mode**. Không giống ngân hàng, không giống website bất động sản kiểu cũ.

**Điều hướng.** Thanh dưới: *Trang chủ · Tìm kiếm · Bản đồ · Đã lưu · Cá nhân*. Header: *Khu vực · Thông báo · Tin nhắn*.

**Trang chủ:** "Bạn đang tìm phòng ở đâu?", ô tìm kiếm, rồi các mục: Phòng dành cho bạn, Gần bạn, Mới đăng, Đã xác minh, Phù hợp ngân sách, Khu vực phổ biến. Ở MVP, ô tìm kiếm là tìm kiếm thường có gợi ý; AI Search bật ở Phase 5 trên cùng ô này.

**Định dạng và đơn vị:** VNĐ, km, m². Hiển thị `2.500.000 ₫`, `25 m²`, `2,5 km`. Lưu tiền dạng **số nguyên đồng** (không dùng số thực). Lưu thời gian UTC, hiển thị theo giờ Việt Nam.

**Tone of voice:** tiếng Việt tự nhiên, ngắn gọn, dễ hiểu; không dùng thuật ngữ kỹ thuật với người dùng phổ thông. Mọi mã lỗi nội bộ phải ánh xạ sang câu thân thiện:

| Mã nội bộ | Hiển thị |
|---|---|
| `PROPERTY_NOT_FOUND` | Không tìm thấy phòng này. |
| `RISK_ASSESSMENT_HIGH` | Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc. |
| `NETWORK_ERROR` | Kết nối đang chập chờn. Bạn thử lại nhé. |

**Tính tổng chi phí (Total Cost Calculator) — quy tắc:**
- Thành phần: tiền phòng, điện, nước, internet, gửi xe, phí dịch vụ, phí khác; tiền cọc và khoản chi ban đầu tách riêng.
- Hiển thị hai con số: **"Mỗi tháng (ước tính)"** và **"Cần chuẩn bị khi vào ở"**.
- Điện/nước hỗ trợ nhiều cách tính (theo đồng hồ, khoán, bậc thang); người dùng chỉnh được mức tiêu thụ giả định.
- Phân biệt "chủ trọ công bố" và "ước tính của Trọ Việt". Thiếu dữ liệu thì nói thiếu, không mặc định 0.
- Module này phải có test đơn vị với độ phủ ≥ 90%.

**Hiệu năng và truy cập:** danh sách ảo hoá, ảnh responsive, skeleton khi tải, chạy mượt trên Android tầm trung và mạng 4G yếu, "Đã lưu" xem được khi mất mạng. Vùng chạm ≥ 44pt, tương phản đạt chuẩn, hỗ trợ cỡ chữ lớn.

**Thương hiệu:** logo chữ **TRỌ VIỆT**, có thể kết hợp biểu tượng cách điệu từ ngôi nhà, chìa khóa, vị trí bản đồ. Nhận diện tốt ở cỡ nhỏ, dùng được cho app icon và website, ít chi tiết, không giống thương hiệu bất động sản hiện có. App icon không nhồi chữ nhỏ. Xuất SVG vector; kiểm tra rõ nét ở 16 px và 48 px.

## 10. Định nghĩa "Hoàn thành" chung cho mọi phase

- Code chạy được trên máy sạch theo README; CI xanh.
- Test đơn vị + tích hợp cho logic nghiệp vụ; test e2e cho luồng chính của phase.
- Migration có thể rollback; có seed dữ liệu mẫu (gắn nhãn mẫu).
- Đã thêm analytics event cho các hành động chính.
- Đã tự kiểm tra checklist bảo mật và truy cập của phase.
- Tài liệu cập nhật: README, ADR, `ASSUMPTIONS.md`, `BACKLOG.md`.
- Có báo cáo cuối phase theo mẫu ở mục 1.

---

# PHẦN B — KẾ HOẠCH TRIỂN KHAI

> **Giả định về thời gian:** đội 3–4 người (1 mobile, 1–2 backend, 1 thiết kế bán thời gian). Nếu đội nhỏ hơn, nhân thời gian lên tương ứng. Đây là ước lượng ban đầu, cần điều chỉnh sau Phase 0.

## Tổng quan

| Phase | Tên | Thời gian | Kết quả chính |
|---|---|---|---|
| 0 | Nền móng | Tuần 1–2 | Quyết định kỹ thuật, hạ tầng, data model, địa chỉ, brand |
| 1 | Tìm phòng & nguồn tin | Tuần 3–6 | Đăng ký, tìm kiếm, chi tiết phòng, chủ trọ đăng tin, admin duyệt tin |
| 2 | Bản đồ, chi phí, tin cậy | Tuần 7–9 | Bản đồ, tính tổng chi phí, xác minh chủ trọ, lưu phòng |
| 3 | Liên hệ & cộng đồng | Tuần 10–12 | Chat, review, report, thông báo, kiểm duyệt |
| 4 | Hardening & Beta | Tuần 13–15 | Bảo mật, hiệu năng, tuân thủ, beta kín, nộp store |
| 5 | Tin cậy nâng cao & AI | Sau MVP | Anti-Scam nâng cao, AI Search, AI phân tích, so sánh, ở ghép |
| 6 | Thuê & quản lý | Sau Phase 5 | Hợp đồng, thanh toán, quản lý cho thuê, insights |

## Phase 0 — Nền móng (tuần 1–2)

**Mục tiêu:** chốt nền tảng để các phase sau không phải làm lại.

**Việc chính:**
- Chốt tech stack (mục 5) và các quyết định ở Phần C; ghi ADR `docs/adr/001-stack.md`.
- Dựng monorepo, CI/CD, môi trường staging, quản lý secrets (`.env*` nằm trong `.gitignore`), logging, Sentry.
- Thiết kế data model v1: `users`, `roles`, `landlord_profiles`, `verifications`, `properties`, `listings`, `listing_costs`, `media`, `favorites`, `conversations`, `messages`, `reviews`, `reports`, `moderation_actions`, `audit_logs`, `admin_units`, `admin_unit_mappings`, `area_aliases`, `markets`.
- Import danh mục hành chính từ nguồn chính thức, dựng `area_aliases` cho thị trường đầu tiên.
- Design system: token màu, chữ, khoảng cách; Light/Dark; bộ component cơ bản.
- Brand kit: logo, app icon, bảng màu; tra cứu nhãn hiệu "Trọ Việt".
- Checklist pháp lý và quyền riêng tư (danh sách dữ liệu thu thập, mục đích, thời hạn lưu).

**Hoàn thành khi:** repo chạy được end-to-end với màn hình "hello", CI xanh, ADR đã được xác nhận, danh mục địa chỉ import thành công, brand kit được duyệt.

## Phase 1 — Tìm phòng & nguồn tin (tuần 3–6)

**Mô-đun:** Authentication, User Profile, Onboarding, Property Search, Advanced Filter, Property Detail, Landlord Dashboard (tối thiểu), Admin Dashboard (tối thiểu), Analytics.

**Việc chính:**
- Đăng ký/đăng nhập (OTP + email + Google/Apple), hồ sơ, onboarding chọn nhu cầu (loại nhà, ngân sách, khu vực).
- Chủ trọ: tạo/sửa/ẩn tin, upload ảnh, nhập đầy đủ chi phí.
- Admin web: hàng đợi duyệt tin (duyệt / yêu cầu sửa / từ chối kèm lý do).
- Tìm kiếm và bộ lọc: giá, loại nhà, diện tích, tiện nghi, khu vực (kể cả tên quen thuộc), sắp xếp.
- Trang chi tiết phòng: ảnh, thông tin, chi phí, thông tin chủ trọ, trạng thái xác minh.
- Analytics: sự kiện `search`, `view_listing`, `apply_filter`…

**Hoàn thành khi:** người dùng mới tìm và mở được chi tiết một phòng trong ≤ 3 thao tác; chủ trọ đăng tin và admin duyệt xong thì tin xuất hiện trong tìm kiếm; p95 API tìm kiếm < 300 ms trên dữ liệu thử 10.000 tin.

## Phase 2 — Bản đồ, chi phí, tin cậy (tuần 7–9)

**Mô-đun:** Map Search, Total Cost Calculator, Landlord Verification (L1–L2), Property Verification (cơ bản), Favorites.

**Việc chính:**
- Bản đồ: cụm điểm (cluster), tìm trong vùng đang xem, tìm quanh một địa điểm, khoảng cách hiển thị `2,5 km`.
- Total Cost Calculator theo quy tắc ở mục 9, có màn hình chi tiết từng khoản.
- Xác minh chủ trọ L1–L2 và huy hiệu hiển thị rõ nghĩa; quy trình duyệt trên Admin.
- Lưu phòng (Favorites), đồng bộ giữa thiết bị, xem được khi offline.
- **Khuyến nghị:** làm bản so sánh nhẹ (2–3 phòng cạnh nhau theo tổng chi phí) vì hành trình người dùng có bước "So sánh" và đã có sẵn dữ liệu chi phí.

**Hoàn thành khi:** người dùng thấy tổng chi phí hàng tháng và chi phí vào ở ngay trên trang chi tiết; bản đồ mượt với 2.000 điểm; huy hiệu xác minh đúng theo quy tắc, có audit log.

## Phase 3 — Liên hệ & cộng đồng (tuần 10–12)

**Mô-đun:** Realtime Chat, Reviews, Reports, Notifications (cơ bản), Anti-Scam (rule-based cơ bản), Admin moderation.

**Việc chính:**
- Chat theo từng tin đăng; gửi ảnh; trạng thái đã đọc; chặn/báo cáo người dùng.
- Cảnh báo trong chat khi có dấu hiệu chuyển tiền hoặc kéo sang kênh ngoài app.
- Review có kiểm soát (điều kiện được review, phản hồi của chủ trọ, khiếu nại).
- Report tin/người dùng, hàng đợi xử lý trên Admin, SLA nội bộ.
- Push notification: tin nhắn mới, trạng thái tin đăng, kết quả xác minh.
- Bộ luật tín hiệu rủi ro (mục 8) chạy khi tin được đăng/sửa, kết quả hiển thị cho admin.

**Hoàn thành khi:** hai người dùng chat realtime ổn định; report → admin xử lý → người báo nhận thông báo; review giả bị chặn theo điều kiện đã định.

## Phase 4 — Hardening & Beta (tuần 13–15)

**Mô-đun:** Security, Privacy, Testing, Production deployment.

**Việc chính:**
- Rà soát bảo mật theo OWASP ASVS/MASVS; kiểm thử xâm nhập cơ bản; sửa lỗi phát hiện.
- Kiểm thử tải cho tìm kiếm, bản đồ, chat; tối ưu chỉ mục và cache.
- Hoàn thiện quyền riêng tư: đồng ý, xuất/xoá dữ liệu, chính sách bằng tiếng Việt; luật sư duyệt.
- Sao lưu/khôi phục thử; cảnh báo và dashboard vận hành; kế hoạch xử lý sự cố.
- Beta kín tại **một** thị trường; đo chỉ số ở bảng dưới; thu phản hồi.
- Nộp App Store và Google Play (chuẩn bị mô tả, ảnh chụp, chính sách dữ liệu).

**Hoàn thành khi:** không còn lỗi bảo mật mức cao/nghiêm trọng; crash-free ≥ 99,5%; khôi phục từ backup thành công trong buổi diễn tập; beta đạt các chỉ số mục tiêu.

**Chỉ số MVP gợi ý (điều chỉnh sau Phase 0):**

| Chỉ số | Mục tiêu tham khảo |
|---|---|
| Từ mở app đến thấy kết quả tìm kiếm | ≤ 3 thao tác |
| p95 API tìm kiếm | < 300 ms |
| Crash-free sessions | ≥ 99,5% |
| Tỷ lệ tin có đủ thông tin chi phí | ≥ 80% |
| Thời gian xử lý report | trong 24 giờ làm việc |

## Phase 5 — Tin cậy nâng cao & AI (sau MVP)

Thứ tự đề xuất (đưa Anti-Scam lên trước AI để đúng nguyên tắc Trust → Safety → … → AI):

1. **So sánh nâng cao, Room Match, Saved Search** (kèm thông báo khi có phòng mới phù hợp), Price History (khi đã đủ dữ liệu theo thời gian).
2. **Anti-Scam nâng cao:** phát hiện ảnh trùng và tin trùng, phân tích hành vi tài khoản, L3 (xác minh địa chỉ/quyền cho thuê), điểm tin cậy có giải thích.
3. **AI Search** theo mục 7.
4. **AI Room Analysis** (mô tả, ảnh, so sánh giá với khu vực).
5. **Roommate Matching**, Viewing Mode, Viewing Checklist.

Mỗi hạng mục có eval riêng và bật dần bằng feature flag.

## Phase 6 — Thuê & quản lý (sau Phase 5)

- **Contract OCR + Contract Analysis** (không phải tư vấn pháp lý; bảo vệ dữ liệu cá nhân trong hợp đồng).
- **Contract Management, Payment Management, Rental Management.** Lưu ý: việc nắm giữ hoặc chuyển tiền thay người dùng có thể cần giấy phép; xác nhận với luật sư và dùng cổng thanh toán được cấp phép trước khi thiết kế.
- **Landlord Dashboard đầy đủ, Area Insights.**

## Bản đồ 37 module → phase

| # | Module | Phase | # | Module | Phase |
|---|---|---|---|---|---|
| 1 | Authentication | 1 | 20 | Roommate Matching | 5 |
| 2 | User Profile | 1 | 21 | Realtime Chat | 3 |
| 3 | Onboarding | 1 | 22 | Viewing Mode | 5 |
| 4 | Property Search | 1 | 23 | Viewing Checklist | 5 |
| 5 | Advanced Filter | 1 | 24 | Contract OCR | 6 |
| 6 | Map Search | 2 | 25 | Contract Analysis | 6 |
| 7 | Property Detail | 1 | 26 | Contract Management | 6 |
| 8 | Total Cost Calculator | 2 | 27 | Payment Management | 6 |
| 9 | Room Match | 5 | 28 | Price History | 5 |
| 10 | Property Comparison | 2 (nhẹ) / 5 | 29 | Area Insights | 6 |
| 11 | Favorites | 2 | 30 | Notifications | 3 (cơ bản) / 5 |
| 12 | Saved Search | 5 | 31 | Landlord Dashboard | 1 (tối thiểu) / 6 |
| 13 | AI Search | 5 | 32 | Admin Dashboard | 1 (tối thiểu) / 3 |
| 14 | AI Room Analysis | 5 | 33 | Analytics | 1 → liên tục |
| 15 | Landlord Verification | 2 (L1–L2) / 5 (L3) | 34 | Security | 0 → 4 |
| 16 | Property Verification | 2 / 5 | 35 | Privacy | 0 → 4 |
| 17 | Anti-Scam Engine | 3 (cơ bản) / 5 | 36 | Testing | mọi phase |
| 18 | Reports | 3 | 37 | Production deployment | 0 (staging) / 4 |
| 19 | Reviews | 3 | | | |

## Rủi ro chính

| Rủi ro | Giảm thiểu |
|---|---|
| Không có tin đăng khi ra mắt (cold start) | Chọn 1 thị trường; kế hoạch nhập tin ban đầu (mục C.3) |
| Xác minh chủ trọ tốn chi phí và ma sát | Xác minh theo cấp; chỉ yêu cầu L2 khi cần thiết |
| Địa giới hành chính thay đổi tiếp | `admin_units` có phiên bản + bảng ánh xạ |
| Vi phạm quy định dữ liệu cá nhân | Thiết kế quyền riêng tư từ Phase 0; luật sư duyệt trước beta |
| Chi phí bản đồ/SMS/eKYC tăng theo lượng dùng | So sánh nhà cung cấp ở Phase 0; đặt hạn mức và cảnh báo chi phí |
| AI trả lời sai làm mất niềm tin | Kỷ luật ở mục 7; eval; feature flag; dự phòng |
| Phạm vi phình to | Một phase mỗi lần; `BACKLOG.md`; chỉ làm ngoài phạm vi khi được xác nhận |

---

# PHẦN C — VIỆC CẦN CHỐT TRƯỚC KHI BẮT ĐẦU

1. **Đội và thời gian:** bao nhiêu người, ngân sách, mốc ra mắt mong muốn? (Quyết định độ dài các phase.)
2. **Tech stack:** xác nhận đề xuất ở mục 5 hay đội quen stack khác?
3. **Nguồn tin đăng ban đầu:** chủ trọ tự đăng, đội vận hành nhập tay, hay hợp tác với chủ trọ/đơn vị quản lý? Ai chịu trách nhiệm chất lượng dữ liệu?
4. **Thị trường ra mắt đầu tiên:** đề xuất chọn **1 thành phố** (ví dụ Đà Nẵng, khớp với ví dụ "ĐH Duy Tân" trong bản gốc) và giữ kiến trúc đa thị trường.
5. **Nền tảng:** iOS và Android cùng lúc? Có cần web công khai cho tin đăng (chia sẻ link, SEO) không?
6. **Nhà cung cấp:** bản đồ, SMS/OTP (hoặc Zalo), eKYC, lưu trữ/hạ tầng và vùng đặt máy chủ.
7. **Chủ trọ có bắt buộc xác minh để đăng tin không?** Nghiêm hơn thì an toàn hơn nhưng giảm nguồn cung.
8. **Mô hình doanh thu:** phí đăng tin, tin nổi bật, gói cho chủ trọ… (ảnh hưởng schema và chính sách, dù chưa làm trong MVP).
9. **Pháp lý:** pháp nhân vận hành, điều khoản sử dụng, chính sách quyền riêng tư, tra cứu và đăng ký nhãn hiệu "Trọ Việt", quy định về nền tảng trung gian.
10. **Chính sách nội dung:** ai được review, xử lý tranh chấp thế nào, thời hạn gỡ tin vi phạm.
