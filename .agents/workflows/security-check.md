---
description: Tự kiểm tra bảo mật và quyền riêng tư cho các thay đổi hiện tại.
---

# /security-check

Xem `git diff` (hoặc các file đã đổi trong phase) và kiểm tra:

1. **Phân quyền:** mỗi bảng / endpoint mới có kiểm soát quyền ở tầng dữ liệu (RLS nếu dùng Supabase)? Có test thử truy cập trái quyền chưa?
2. **Secrets:** không có key, token, mật khẩu trong code, log hoặc bundle mobile. `.env*` nằm trong `.gitignore`.
3. **Dữ liệu cá nhân:** thu thập có cần thiết không? Có ghi rõ mục đích và thời hạn lưu? Có bị ghi ra log thô không?
4. **Upload:** kiểm tra MIME, giới hạn dung lượng, xoá EXIF, quyền truy cập tệp.
5. **Đầu vào:** validate ở server; chống injection; rate limit cho OTP, tìm kiếm, chat.
6. **Lộ thông tin:** người chưa đăng nhập không thấy SĐT chủ trọ hay dữ liệu riêng tư.
7. **Ghi lại kết quả** dưới dạng bảng: mục / trạng thái (đạt, chưa đạt, không áp dụng) / ghi chú. Sửa các mục "chưa đạt" trong phạm vi task, nếu ngoài phạm vi thì báo tôi.
