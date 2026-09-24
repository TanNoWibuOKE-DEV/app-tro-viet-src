---
description: Kết thúc phase — kiểm tra Definition of Done, cập nhật STATUS, báo cáo và dừng.
---

# /phase-report

1. Chạy toàn bộ lint, typecheck, test. Ghi kết quả thật, không suy đoán.
2. Đối chiếu từng mục "Hoàn thành khi" của phase trong `docs/SPEC.md` và mục 10 (Định nghĩa Hoàn thành chung). Đánh dấu đạt / chưa đạt, kèm bằng chứng (lệnh đã chạy, ảnh chụp, đường dẫn file).
3. Chạy `/security-check` cho các thay đổi của phase.
4. Cập nhật `docs/STATUS.md`, `docs/ASSUMPTIONS.md`, `docs/BACKLOG.md`, README.
5. Báo cáo theo mẫu, ngắn gọn:
   - **Đã làm**
   - **Chưa làm**
   - **Giả định**
   - **Rủi ro**
   - **Cần bạn quyết định**
   - **Cách chạy và kiểm thử**
6. **Dừng.** Không bắt đầu phase tiếp theo.
