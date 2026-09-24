---
trigger: model_decision
description: Áp dụng khi viết giao diện, văn bản hiển thị cho người dùng, thông báo lỗi, định dạng số/tiền/đơn vị, hoặc thiết kế màn hình.
---

# Giao diện tiếng Việt

Chi tiết: `docs/SPEC.md` mục 9.

- **Phong cách:** Vietnamese + Modern + Trustworthy + Friendly + Technology. Mobile-first, sạch, có Light Mode và Dark Mode. Không giống ngân hàng, không giống website bất động sản kiểu cũ.
- **Điều hướng dưới:** Trang chủ · Tìm kiếm · Bản đồ · Đã lưu · Cá nhân. **Header:** Khu vực · Thông báo · Tin nhắn.
- **Định dạng:** `2.500.000 ₫`, `25 m²`, `2,5 km` (dùng `Intl` với `vi-VN`).
- **Toàn bộ chuỗi UI nằm trong file ngôn ngữ**, không rải cứng trong component.
- **Giọng văn:** tiếng Việt tự nhiên, ngắn gọn, dễ hiểu, không thuật ngữ kỹ thuật. Không bao giờ hiển thị mã lỗi nội bộ cho người dùng.
  - `PROPERTY_NOT_FOUND` → "Không tìm thấy phòng này."
  - `RISK_ASSESSMENT_HIGH` → "Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc."
- **Trạng thái đầy đủ cho mọi màn hình:** đang tải (skeleton), rỗng, lỗi (có nút thử lại), mất mạng.
- **Truy cập:** vùng chạm ≥ 44pt, tương phản đạt chuẩn, hỗ trợ cỡ chữ lớn.
- **Hiệu năng:** danh sách ảo hoá, ảnh responsive, chạy mượt trên Android tầm trung và mạng 4G yếu.
- **Tính tổng chi phí:** hiển thị hai con số "Mỗi tháng (ước tính)" và "Cần chuẩn bị khi vào ở"; phân biệt "chủ trọ công bố" với "ước tính"; thiếu dữ liệu thì nói thiếu.
