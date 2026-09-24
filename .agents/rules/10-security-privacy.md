---
trigger: model_decision
description: Áp dụng khi làm việc với dữ liệu người dùng, xác thực, phân quyền, upload, chat, xác minh, thanh toán hoặc bất kỳ thay đổi nào liên quan đến bảo mật và quyền riêng tư.
---

# Bảo mật và quyền riêng tư

Chi tiết đầy đủ: `docs/SPEC.md` mục 8.

- **Phân quyền ở tầng dữ liệu, không chỉ ở UI.** Vai trò: `tenant`, `landlord`, `moderator`, `admin`.
- **Nếu dùng Supabase:** bật RLS cho mọi bảng ngay khi tạo; viết policy theo nguyên tắc từ chối mặc định; có test cho policy; không dùng `service_role` key trong app; Storage bucket có policy riêng.
- **Upload:** kiểm tra MIME thật, giới hạn dung lượng, xoá EXIF/GPS, dùng URL có chữ ký cho tệp riêng tư.
- **Không lộ SĐT chủ trọ** cho người chưa đăng nhập. Có rate limit cho tìm kiếm, OTP, chat.
- **Dữ liệu nhạy cảm** (giấy tờ, vị trí chính xác, hợp đồng): mã hoá, thu thập tối thiểu, có mục đích và thời hạn lưu rõ ràng.
- **Đồng ý và quyền dữ liệu:** người dùng đồng ý theo mục đích, rút được đồng ý, xem/sửa/xoá được dữ liệu. Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 có hiệu lực từ 01/01/2026; mọi điều khoản pháp lý cần luật sư xác nhận, không tự suy diễn.
- **Audit log** cho hành động của admin/moderator.
- Không log dữ liệu cá nhân ở dạng thô. Không gửi dữ liệu cá nhân tới dịch vụ AI bên ngoài khi chưa che (redact).
- Trước khi kết thúc task có động chạm tới các mục trên, tự chạy `/security-check`.
