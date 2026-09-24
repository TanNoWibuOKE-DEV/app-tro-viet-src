---
trigger: always_on
---

# Trọ Việt (TroViet) — Quy tắc cốt lõi

**Dự án:** app mobile giúp người Việt tìm trọ thông minh và an toàn. Tagline: "Tìm đúng chỗ — Thuê an tâm."
**Nguồn sự thật:** `docs/SPEC.md` (đọc đúng mục cần, không đọc cả file). Tiến độ: `docs/STATUS.md`.

## Cách làm việc
1. Mỗi lần chỉ làm **một phase** trong `docs/SPEC.md` Phần B. Xong thì dừng, báo cáo, chờ tôi xác nhận.
2. Trước khi code phase mới: viết kế hoạch ngắn (Implementation Plan + Task List), hỏi các câu còn mở, **chờ tôi duyệt**.
3. Không làm tính năng ngoài phạm vi phase. Ý tưởng hay ghi vào `docs/BACKLOG.md`.
4. **Không bịa dữ liệu thật** (địa chỉ, giá phòng, danh mục hành chính, điều khoản pháp lý). Dữ liệu mẫu phải gắn nhãn mẫu, chỉ dùng cho dev/test. Thiếu thông tin thì hỏi hoặc ghi vào `docs/ASSUMPTIONS.md`.
5. Quyết định kiến trúc lớn ghi ADR ngắn ở `docs/adr/NNN-ten.md`.
6. Commit nhỏ, thông điệp rõ. Không sửa file ngoài phạm vi task.

## Thứ tự ưu tiên khi xung đột
Trust → Safety → UX → Performance → Scalability → AI.

## Ràng buộc bất biến
- Giá phòng luôn đi kèm chi phí liên quan. Chi phí chưa có = "Chủ trọ chưa cung cấp", **không bao giờ coi là 0 đồng**.
- Tiền lưu dạng **số nguyên đồng**. Thời gian lưu UTC, hiển thị giờ Việt Nam.
- Địa chỉ theo mô hình **hai cấp hiện hành** (Tỉnh/Thành phố → Phường/Xã/Đặc khu). **Không dùng Quận/Huyện làm cấu trúc chính.** Chi tiết: `docs/SPEC.md` mục 6.
- Code, tên biến, bảng, commit bằng tiếng Anh. UI và tài liệu người dùng bằng tiếng Việt.
- Không bao giờ để secrets, API key, `service_role` key trong repo hoặc trong bundle mobile.

## Stack mặc định (xác nhận ở Phase 0, ghi ADR)
Expo (React Native) + TypeScript + Supabase (Postgres/PostGIS, Auth, Storage, Realtime). Xem `docs/SPEC.md` mục 5.

## Xong một việc nghĩa là
Chạy được, có test cho logic nghiệp vụ, lint/typecheck sạch, tài liệu cập nhật. Không báo "xong" khi chưa chạy thử.
