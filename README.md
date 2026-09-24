# Bộ khởi động Trọ Việt cho Antigravity

Bộ file này biến đặc tả Trọ Việt thành cấu hình mà Antigravity đọc được: **rules** (luôn áp dụng), **workflows** (lệnh `/` gọi khi cần) và **tài liệu** để agent làm việc theo từng phase.

## Cấu trúc

```text
.agents/
├── rules/
│   ├── 00-core.md              # luôn bật: cách làm việc, ràng buộc bất biến
│   ├── 10-security-privacy.md  # bật khi liên quan bảo mật / dữ liệu
│   ├── 20-vietnamese-ui.md     # bật khi làm giao diện / văn bản hiển thị
│   └── 30-ai-features.md       # bật khi làm tính năng AI (từ Phase 5)
└── workflows/
    ├── phase-start.md          # /phase-start   lập kế hoạch, chờ duyệt
    ├── phase-build.md          # /phase-build   làm theo kế hoạch đã duyệt
    ├── phase-report.md         # /phase-report  kiểm tra & báo cáo
    ├── new-feature.md          # /new-feature   thêm tính năng nhỏ
    ├── security-check.md       # /security-check
    └── fix.md                  # /fix           sửa lỗi có quy trình
docs/
├── SPEC.md                     # đặc tả + kế hoạch đầy đủ (nguồn sự thật)
├── PHASE_PROMPTS.md            # câu lệnh gợi ý cho từng phase
└── STATUS.md                   # tiến độ (agent cập nhật)
```

## Cài đặt (5 bước)

1. Tạo thư mục dự án rỗng (ví dụ `TroViet`), chạy `git init`.
2. Chép `.agents/` và `docs/` từ bộ này vào **gốc** thư mục dự án.
3. Trong Antigravity: **File → Open Folder** và chọn đúng thư mục dự án (không phải thư mục cha).
4. Kiểm tra agent đã nhận cấu hình: hỏi *"Which rules and workflows are installed?"*. Phải thấy 4 rules và 6 workflows. Nếu không thấy, xem mục "Nếu Antigravity không nhận" bên dưới.
5. Mở `docs/PHASE_PROMPTS.md`, điền phần `[...]` của Phase 0 và bắt đầu.

## Vòng lặp mỗi phase

```text
/phase-start  →  bạn đọc & nhận xét kế hoạch  →  /phase-build  →  bạn chạy thử  →  /phase-report  →  commit  →  phase kế tiếp
```

- **Luôn duyệt kế hoạch trước khi cho code.** Đây là chỗ rẻ nhất để sửa hướng đi.
- **Commit git trước và sau mỗi phase** để hoàn tác được khi agent làm hỏng.
- **Đừng gộp nhiều phase vào một lượt.** Agent làm dài dễ trôi khỏi đặc tả.
- **Tự chạy thử app**, đừng chỉ tin báo cáo của agent. Với Expo có thể chạy bản web để agent tự kiểm thử trong trình duyệt; kiểm tra cảm giác trên máy thật bằng Expo Go hoặc trình giả lập.
- Dùng model mạnh nhất bạn có quyền dùng cho bước lập kế hoạch và thiết kế CSDL; model nhanh cho việc nhỏ.
- Trong phần cài đặt quyền của agent, **đừng cho tự chạy mọi lệnh terminal** khi có migration, xoá dữ liệu hoặc lệnh chạm tới hạ tầng thật.

## Việc agent không làm thay bạn

- **Pháp lý:** điều khoản, chính sách quyền riêng tư, chuyển dữ liệu ra nước ngoài, giấy phép thanh toán, nhãn hiệu "Trọ Việt". Cần luật sư.
- **Dữ liệu thật:** danh mục hành chính lấy từ nguồn chính thức; tin đăng thật cần chủ trọ thật.
- **Tài khoản và chi phí:** đăng ký bản đồ, OTP SMS, eKYC, App Store, Google Play.
- **Đánh giá cảm giác sản phẩm:** chỉ bạn biết luồng nào "đúng".

## Nếu Antigravity không nhận cấu hình

Cấu trúc thư mục trong bộ này theo tài liệu công khai vào giữa năm 2026: rules ở `.agents/rules/`, workflows ở `.agents/workflows/`. Bản Antigravity của bạn có thể khác (một số phiên bản cũ dùng `.agent/`, hoặc đọc thêm `GEMINI.md`).

- Thử đổi tên `.agents/` thành `.agent/` (hoặc ngược lại) rồi mở lại thư mục.
- Hoặc vào menu `...` ở khung agent → **Customizations**, tạo từng rule / workflow bằng giao diện và dán nội dung file tương ứng. Với rule, đặt kiểu kích hoạt: `00-core` là **Always On**, ba rule còn lại là **Model Decision** (dùng phần `description` làm mô tả).
- Phương án dự phòng: dán nội dung `00-core.md` vào file `GEMINI.md` ở gốc dự án (một số phiên bản đọc file này). Chưa chắc bản của bạn có đọc, nên vẫn nên kiểm tra bằng câu hỏi ở bước 4.

## Chỉnh cho hợp với bạn

- **Đổi stack:** sửa mục 5 trong `docs/SPEC.md` và dòng "Stack mặc định" trong `00-core.md`. Phase 0 sẽ chốt lại bằng ADR.
- **Rules nên ngắn.** `00-core.md` luôn được nạp mỗi lượt nên đừng nhét thêm dài dòng; thêm chi tiết vào `docs/SPEC.md` và để rule trỏ tới.
