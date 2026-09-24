---
description: Sửa lỗi có quy trình — tái hiện, tìm nguyên nhân gốc, sửa, thêm test hồi quy.
---

# /fix

Người dùng mô tả lỗi.

1. **Tái hiện** lỗi (test hoặc các bước chạy). Nếu không tái hiện được, hỏi thêm thông tin, không đoán.
2. Tìm **nguyên nhân gốc**, nói rõ nguyên nhân trong 2–3 câu trước khi sửa.
3. Sửa tối thiểu, không dọn dẹp lan man ngoài phạm vi lỗi.
4. Thêm test hồi quy fail trước khi sửa và pass sau khi sửa.
5. Chạy lại lint, typecheck, test. Tóm tắt: nguyên nhân, cách sửa, file đã đổi.
