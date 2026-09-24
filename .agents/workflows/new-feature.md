---
description: Thêm một tính năng nhỏ nằm trong phase hiện tại (spec ngắn → task → code → test).
---

# /new-feature

Người dùng mô tả tính năng bằng vài câu.

1. Kiểm tra tính năng có nằm trong phase hiện tại (`docs/STATUS.md`) không. Nếu không, ghi vào `docs/BACKLOG.md`, báo tôi và dừng.
2. Viết spec 5 dòng: mục đích, người dùng nào, hành vi chính, trường hợp lỗi/rỗng, cách đo (analytics event).
3. Liệt kê file sẽ chạm tới. Nếu chạm tới hơn 8 file hoặc đổi schema CSDL, hỏi tôi trước.
4. Làm, kèm test cho logic nghiệp vụ. Chuỗi UI tuân theo quy tắc giao diện tiếng Việt.
5. Cập nhật tài liệu liên quan và tóm tắt thay đổi trong 5 dòng.
