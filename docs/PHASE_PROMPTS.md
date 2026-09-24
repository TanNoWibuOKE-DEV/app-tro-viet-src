# Câu lệnh gợi ý cho từng phase

Cách dùng: gõ `/phase-start` trước, rồi dán nội dung tương ứng. Sau khi duyệt kế hoạch thì gõ `/phase-build`, và cuối cùng `/phase-report`.
Các chỗ `[...]` là chỗ bạn điền.

---

## Phase 0 — Nền móng

```text
/phase-start Phase 0.

Bối cảnh của tôi:
- Tôi làm [một mình / đội X người], kinh nghiệm code [ít / vừa / nhiều].
- Thị trường ra mắt đầu tiên: [ví dụ Đà Nẵng].
- Ưu tiên iOS / Android: [cả hai / Android trước].
- Ngân sách hạ tầng mỗi tháng: khoảng [số] VNĐ.

Hãy đề xuất stack (mặc định Expo + Supabase; nêu rõ một phương án thay thế và đánh đổi), đề xuất 2–3 nhà cung cấp bản đồ và OTP SMS phù hợp Việt Nam kèm ưu nhược, rồi lập kế hoạch dựng nền móng theo docs/SPEC.md. Chưa viết code. Chờ tôi duyệt.
```

Sau khi duyệt: `/phase-build`. Với việc import danh mục hành chính, **bắt buộc dùng nguồn chính thức** và ghi vào `docs/DATA_SOURCES.md`; không tự viết danh sách từ trí nhớ.

---

## Phase 1 — Tìm phòng và nguồn tin

```text
/phase-start Phase 1.

Ưu tiên luồng: đăng ký → chọn nhu cầu → tìm phòng có bộ lọc → xem chi tiết.
Song song làm phía cung tối thiểu: chủ trọ đăng tin (kèm ảnh) và admin web duyệt tin.
Tìm kiếm phải hiểu không dấu và tên khu vực quen thuộc (ví dụ "quận Hải Châu").
Chuẩn bị seed dữ liệu mẫu gắn nhãn mẫu để thử tìm kiếm với khoảng 10.000 tin.
```

---

## Phase 2 — Bản đồ, chi phí, tin cậy

```text
/phase-start Phase 2.

Làm bản đồ (cluster, tìm trong vùng đang xem, tìm quanh một địa điểm), Total Cost Calculator theo docs/SPEC.md mục 9, xác minh chủ trọ L1–L2 với huy hiệu rõ nghĩa, và lưu phòng.
Total Cost Calculator phải có test đơn vị phủ ≥ 90%.
Đề xuất thêm bản so sánh nhẹ 2–3 phòng nếu còn trong phạm vi.
```

---

## Phase 3 — Liên hệ và cộng đồng

```text
/phase-start Phase 3.

Làm chat theo từng tin đăng, review có kiểm soát, report và hàng đợi xử lý cho admin, push notification cơ bản, và bộ luật tín hiệu rủi ro rule-based.
Cảnh báo trong chat khi có dấu hiệu chuyển tiền hoặc kéo sang kênh ngoài app.
Mỗi tính năng phải qua /security-check.
```

---

## Phase 4 — Hardening và Beta

```text
/phase-start Phase 4.

Rà soát bảo mật toàn hệ thống (đặc biệt phân quyền và RLS), kiểm thử tải cho tìm kiếm, bản đồ, chat, hoàn thiện quyền riêng tư (đồng ý, xuất / xoá dữ liệu, chính sách tiếng Việt), diễn tập sao lưu và khôi phục, chuẩn bị nộp App Store và Google Play.
Lập checklist các việc cần luật sư xác nhận, không tự kết luận về pháp lý.
```

---

## Sau MVP (Phase 5–6)

Chỉ bắt đầu khi MVP đã chạy ổn với người dùng thật. Thứ tự: so sánh nâng cao và Saved Search → Anti-Scam nâng cao → AI Search → AI Room Analysis → Roommate → hợp đồng, thanh toán, quản lý cho thuê. Xem `docs/SPEC.md` Phần B.

---

## Câu dùng khi agent đi lệch hướng

```text
Dừng lại. Đọc lại .agents/rules/00-core.md và docs/STATUS.md. Nói cho tôi biết phase hiện tại là gì, việc bạn đang làm có nằm trong phạm vi không, và nếu không thì hoàn tác phần ngoài phạm vi.
```
