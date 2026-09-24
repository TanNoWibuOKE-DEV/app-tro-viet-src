---
description: Thực hiện phase đã được duyệt, từng task một, có kiểm thử.
---

# /phase-build

Chỉ chạy sau khi tôi đã duyệt kế hoạch của phase.

1. Làm theo Task List đã duyệt, **từng task một**. Sau mỗi task: chạy lint, typecheck và test liên quan; commit nhỏ.
2. Không mở rộng phạm vi. Việc phát sinh ghi vào `docs/BACKLOG.md`.
3. Với thay đổi CSDL: viết migration có thể rollback, kèm seed mẫu (gắn nhãn mẫu).
4. Với giao diện: kiểm tra đủ trạng thái tải / rỗng / lỗi / mất mạng, Light và Dark Mode. Nếu chạy được bản web, mở trong trình duyệt và xác nhận luồng chính hoạt động.
5. Nếu gặp quyết định ảnh hưởng thiết kế mà kế hoạch chưa nói, **dừng và hỏi**, không tự chọn.
6. Khi hết task, chạy `/phase-report`.
