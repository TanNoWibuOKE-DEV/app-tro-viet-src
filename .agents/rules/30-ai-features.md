---
trigger: model_decision
description: Áp dụng khi làm tính năng AI của app (AI Search, phân tích phòng, phân tích hợp đồng, điểm tin cậy, phát hiện lừa đảo). Chỉ dùng từ Phase 5 trở đi.
---

# Quy tắc cho tính năng AI trong app

Chi tiết: `docs/SPEC.md` mục 7. **Không làm tính năng AI trước Phase 5.**

- Nguồn sự thật là CSDL. Mọi khẳng định về một phòng phải truy ngược được về một trường dữ liệu. Không có dữ liệu thì nói "chưa có thông tin". AI không được bịa thông tin về phòng.
- **AI Search:** chuyển câu tiếng Việt thành bộ lọc có cấu trúc (JSON theo schema cố định), validate chặt, chạy bằng query thường. Không để đầu ra của LLM chạy thẳng vào CSDL. Luôn hiển thị lại bộ lọc đã hiểu để người dùng sửa.
- **Điểm tin cậy / cảnh báo lừa đảo:** giai đoạn đầu dùng luật có thể giải thích. Không khẳng định "đây là lừa đảo"; hiển thị tín hiệu cụ thể và câu "Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc."
- **Phân tích hợp đồng:** giải thích, đánh dấu điều khoản đáng chú ý, luôn ghi rõ đây không phải tư vấn pháp lý.
- Che (redact) thông tin cá nhân trước khi gửi tới LLM bên ngoài. Log tối thiểu.
- AI lỗi hoặc chậm thì tìm kiếm thường vẫn chạy bình thường. Có bộ eval bằng câu truy vấn tiếng Việt thực tế (kể cả không dấu, viết tắt) trước khi bật cho người dùng, và bật bằng feature flag.
