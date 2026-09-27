"use strict";
/**
 * Trọ Việt - User Consent Management
 * Strictly adheres to Vietnam Personal Data Protection Law No. 91/2025/QH15 (Effective 01/01/2026)
 * and .agents/rules/10-security-privacy.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_PRIVACY_POLICY_VERSION = exports.CONSENT_PURPOSES_CONFIG = void 0;
exports.hasRequiredConsents = hasRequiredConsents;
exports.createDefaultConsentRecord = createDefaultConsentRecord;
exports.CONSENT_PURPOSES_CONFIG = [
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
exports.CURRENT_PRIVACY_POLICY_VERSION = '2026.1';
/**
 * Checks whether user has accepted all mandatory consent purposes.
 */
function hasRequiredConsents(record) {
    if (!record)
        return false;
    return record.consents.service_operation === true && record.consents.anti_scam_protection === true;
}
/**
 * Creates a default consent record for a new user.
 */
function createDefaultConsentRecord(userId, acceptOptional = false) {
    return {
        userId,
        consents: {
            service_operation: true,
            anti_scam_protection: true,
            analytics_improvement: acceptOptional,
            marketing_notifications: acceptOptional,
        },
        updatedAt: new Date().toISOString(),
        version: exports.CURRENT_PRIVACY_POLICY_VERSION,
    };
}
