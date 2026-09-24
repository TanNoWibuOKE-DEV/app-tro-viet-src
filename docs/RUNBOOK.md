# Trọ Việt — Runbook Vận hành & Phục hồi Thảm họa (Disaster Recovery)

Tài liệu hướng dẫn đội ngũ kỹ thuật vận hành, sao lưu và xử lý sự cố cho hệ thống Trọ Việt (`TroViet`).

---

## 1. Kiến trúc Hạ tầng

- **Mobile Client:** Expo React Native (iOS, Android, Web PWA).
- **Backend Core:** Supabase Managed Platform:
  - **Database:** PostgreSQL v15+ với PostGIS extension và pg_trgm/unaccent.
  - **Security:** 100% Row Level Security (RLS) trên tất cả các bảng.
  - **Storage:** Supabase Storage (Buckets: `listing-media`, `verification-docs` [Private]).
  - **Realtime:** Supabase WebSockets cho In-App Chat và Notifications.

---

## 2. Quy trình Sao lưu Dữ liệu (Backup Runbook)

### 2.1. Sao lưu tự động (Automated Backups)
- Nền tảng Supabase thực hiện sao lưu hàng ngày (Daily Physical & Logical Backups) với chế độ Point-in-time Recovery (PITR) lưu giữ trong 7 ngày đối với môi trường Staging/Production.

### 2.2. Sao lưu thủ công trước khi Migration lớn (Manual Snapshot)
Trước mỗi đợt deploy migration cấu trúc CSDL mới:
```bash
# Xuất toàn bộ schema và dữ liệu
pg_dump -h db.troviet.internal -U postgres -d postgres -F c -b -v -f "./backups/troviet_backup_$(date +%Y%m%d_%H%M%S).dump"

# Hoặc qua Supabase CLI
supabase db dump -f "./backups/supabase_dump_$(date +%Y%m%d_%H%M%S).sql"
```

---

## 3. Kịch bản Phục hồi Thảm họa (Disaster Recovery Simulation)

### 3.1. Phục hồi từ Snapshot Dump
Khi xảy ra sự cố hỏng dữ liệu hoặc migration lỗi:
1. Thông báo tạm dừng bảo trì qua Cloudflare / Reverse Proxy (`503 Maintenance Mode`).
2. Khởi tạo một cơ sở dữ liệu tạm thời hoặc rollback migration:
   ```bash
   # Chạy script rollback tương ứng (ví dụ migration v3 down)
   psql -h db.troviet.internal -U postgres -d postgres -f "supabase/migrations/20260924000003_phase3_chat_reviews_reports_down.sql"
   ```
3. Phục hồi từ tệp dump gần nhất:
   ```bash
   pg_restore -h db.troviet.internal -U postgres -d postgres -v -c "./backups/troviet_backup_latest.dump"
   ```
4. Chạy kiểm tra tính toàn vẹn (Integrity Check):
   - Kiểm tra các bảng cốt lõi: `users`, `listings`, `listing_costs`, `conversations`.
   - Kiểm tra RLS đang được kích hoạt:
     ```sql
     SELECT relname, relrowsecurity FROM pg_class WHERE oid IN (SELECT to_regclass(tablename) FROM pg_tables WHERE schemaname = 'public');
     ```
5. Mở lại ứng dụng và theo dõi log trong 30 phút.

---

## 4. Xử lý Sự cố Vận hành Thường gặp (Troubleshooting)

### 4.1. Phát hiện dấu hiệu lừa đảo hàng loạt hoặc tin rác (Scam Surge)
- **Triệu chứng:** Xuất hiện nhiều tin đăng có giá bất thường (< 1.000.000đ tại khu trung tâm) hoặc tài khoản liên tục gửi tin nhắn có từ khóa chuyển cọc/STK.
- **Biện pháp khẩn cấp:**
  1. Vào màn hình **Quản trị & Kiểm duyệt (Admin Moderation)** -> Tab **Báo cáo vi phạm**.
  2. Bấm **"✓ Xử lý vi phạm"** để tự động gỡ tin đăng và gửi cảnh báo đến tài khoản vi phạm.
  3. Nếu cần chặn ngay lập tức qua DB:
     ```sql
     UPDATE listings SET status = 'hidden' WHERE landlord_id = '<MALICIOUS_USER_ID>';
     INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES ('<ADMIN_ID>', 'EMERGENCY_TAKEDOWN', 'listing', '<LISTING_ID>', '{"reason": "Takedown deposit scam"}'::jsonb);
     ```

### 4.2. Người dùng yêu cầu thực hiện Quyền xóa dữ liệu (Right to Erasure)
- **Căn cứ:** Điều 16 Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15.
- **Thực hiện:**
  - Hệ thống cho phép người dùng tự thực hiện tại tab **Cá nhân** -> **Quyền dữ liệu cá nhân** -> **Xóa tài khoản vĩnh viễn**.
  - Script ẩn danh hóa tự động xóa số điện thoại, email, CCCD và chuyển tên thành *"Người dùng đã xóa tài khoản"*, bảo tồn đánh giá cộng đồng dưới dạng ẩn danh.

---

## 5. Giám sát & Cảnh báo (Monitoring & Alerting)

- **Crash Reporting:** Tích hợp Sentry với ngưỡng cảnh báo Crash-free sessions ≥ 99.5%.
- **SLA xử lý Báo cáo vi phạm:** Kiểm duyệt viên cam kết thẩm định và xử lý mọi báo cáo vi phạm trong vòng **24 giờ làm việc**.
