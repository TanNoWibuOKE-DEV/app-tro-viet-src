# Trọ Việt — Backlog & Ý tưởng ngoài phạm vi

Tài liệu này lưu lại các ý tưởng, tính năng hoặc cải tiến nảy sinh trong quá trình phát triển nhưng nằm ngoài phạm vi của Phase hiện tại.

---

## Tính năng đã hoàn thành (Phase 5 - Phase 8)
- [x] **Hệ thống so sánh phòng chuyên sâu (Phase 2 & UI Refactor):** Đã hoàn tất (`PropertyComparisonModal.tsx`).
- [x] **AI Roommate Matching (Phase 7):** Đã hoàn tất (`RoommateMatchingScreen.tsx`, `calculateRoommateCompatibility`).
- [x] **Phân tích hợp đồng thuê & cảnh báo bẫy pháp lý (Phase 6):** Đã hoàn tất (`analyzeContractTerms`, `ContractDetailModal.tsx`).
- [x] **Hóa đơn tiền phòng & VietQR NAPAS 24/7 (Phase 6):** Đã hoàn tất (`calculateMonthlyInvoice`, `generateVietQRLink`, `InvoiceDetailModal.tsx`).
- [x] **Biên bản bàn giao phòng thực địa & Lịch nhắc tự động (Phase 7):** Đã hoàn tất (`ViewingHandoverModal.tsx`, `checkRentInvoiceReminders`).
- [x] **Chuẩn bị phát hành Store & EAS Production (Phase 8):** Đã hoàn tất (`app.json`, `eas.json`, `STORE_METADATA.md`).

## Ý tưởng tính năng & Đề xuất sau khi phát hành (Post-Launch)
1. **Push Notifications với APNs & Firebase Cloud Messaging (FCM):**
   - Đăng ký chứng chỉ Apple APNs và tài khoản Google Cloud FCM để đẩy thông báo ngoại tuyến thời gian thực đến điện thoại khi đóng ứng dụng.
2. **eKYC CCCD gắn chip bằng NFC:**
   - Tích hợp SDK eKYC đối tác được Bộ Công An cấp phép (VNPT eKYC / FPT.AI) đọc chip CCCD trực tiếp trên thiết bị di động để nâng cấp tự động lên L2.
3. **Webhook Đối soát ngân hàng tự động (Auto Bank Reconciliation):**
   - Kết nối cổng Open Banking của ngân hàng đối tác hoặc Casso / SePAY để tự động gạch nợ hóa đơn khi người thuê quét mã VietQR thành công.
4. **Mở rộng địa bàn hoạt động:**
   - Mở rộng tập dữ liệu mặt bằng giá và danh mục hành chính 2 cấp ra Hà Nội, TP. Hồ Chí Minh sau khi vận hành ổn định tại TP. Đà Nẵng.
