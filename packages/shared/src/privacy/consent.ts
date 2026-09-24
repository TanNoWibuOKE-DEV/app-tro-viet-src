/**
 * Trọ Việt - User Consent Management
 * Strictly adheres to Vietnam Personal Data Protection Law No. 91/2025/QH15 (Effective 01/01/2026)
 * and .agents/rules/10-security-privacy.md
 */

export type ConsentPurpose =
  | 'service_operation'        // Bắt buộc: Cung cấp dịch vụ tìm kiếm và liên hệ phòng trọ
  | 'anti_scam_protection'     // Bắt buộc: Quét tín hiệu phòng chống lừa đảo tiền cọc
  | 'analytics_improvement'    // Tùy chọn: Thống kê ẩn danh để cải tiến chất lượng ứng dụng
  | 'marketing_notifications'; // Tùy chọn: Nhận thông báo gợi ý phòng mới qua email/push

export interface ConsentPurposeDetail {
  code: ConsentPurpose;
  title: string;
  description: string;
  isRequired: boolean;
}

export const CONSENT_PURPOSES_CONFIG: ConsentPurposeDetail[] = [
  {
    code: 'service_operation',
    title: 'Vận hành dịch vụ tìm & thuê phòng',
    description: 'Xử lý thông tin tìm kiếm, khu vực quan tâm và kết nối liên hệ giữa người thuê và chủ trọ.',
    isRequired: true,
  },
  {
    code: 'anti_scam_protection',
    title: 'Bảo vệ an toàn & Chống lừa đảo tiền cọc',
    description: 'Rà soát tin đăng bất thường, cảnh báo từ khóa rủi ro trong hội thoại để bảo vệ tài sản người dùng.',
    isRequired: true,
  },
  {
    code: 'analytics_improvement',
    title: 'Thống kê trải nghiệm ẩn danh',
    description: 'Thu thập chỉ số hiệu năng và tần suất sử dụng ẩn danh nhằm nâng cao độ ổn định của ứng dụng.',
    isRequired: false,
  },
  {
    code: 'marketing_notifications',
    title: 'Gợi ý phòng mới phù hợp',
    description: 'Gửi thông báo khi có phòng trọ mới được duyệt tại khu vực bạn đang quan tâm.',
    isRequired: false,
  },
];

export interface UserConsentRecord {
  userId: string;
  consents: Record<ConsentPurpose, boolean>;
  updatedAt: string;
  version: string;
}

export const CURRENT_PRIVACY_POLICY_VERSION = '2026.1';

/**
 * Checks whether user has accepted all mandatory consent purposes.
 */
export function hasRequiredConsents(record?: UserConsentRecord | null): boolean {
  if (!record) return false;
  return record.consents.service_operation === true && record.consents.anti_scam_protection === true;
}

/**
 * Creates a default consent record for a new user.
 */
export function createDefaultConsentRecord(
  userId: string,
  acceptOptional: boolean = false
): UserConsentRecord {
  return {
    userId,
    consents: {
      service_operation: true,
      anti_scam_protection: true,
      analytics_improvement: acceptOptional,
      marketing_notifications: acceptOptional,
    },
    updatedAt: new Date().toISOString(),
    version: CURRENT_PRIVACY_POLICY_VERSION,
  };
}
