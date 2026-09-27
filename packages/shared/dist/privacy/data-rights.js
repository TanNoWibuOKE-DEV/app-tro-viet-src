"use strict";
/**
 * Trọ Việt - Data Subject Rights Implementation
 * Implements Right to Access, Right to Portability and Right to Erasure
 * pursuant to Vietnam Law on Personal Data Protection No. 91/2025/QH15.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportUserDataAsJson = exportUserDataAsJson;
exports.anonymizeUserProfile = anonymizeUserProfile;
exports.anonymizeUserReviews = anonymizeUserReviews;
/**
 * Packages all collected user data into a portable machine-readable JSON string.
 */
function exportUserDataAsJson(user, options = {}) {
    const bundle = {
        exportMetadata: {
            platform: 'Trọ Việt (TroViet)',
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            lawReference: 'Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15',
        },
        userProfile: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            verificationLevel: user.verificationLevel,
            createdAt: user.createdAt,
        },
        preferences: options.preferences || null,
        favoriteListingIds: options.favoriteListingIds || [],
        reviewsCount: options.reviews?.length || 0,
        reviews: options.reviews || [],
        conversationsCount: options.conversations?.length || 0,
    };
    return JSON.stringify(bundle, null, 2);
}
/**
 * Anonymizes user profile upon account deletion request (Right to Erasure).
 * Removes all PII while leaving the account deactivated.
 */
function anonymizeUserProfile(user) {
    return {
        ...user,
        fullName: 'Người dùng đã xóa tài khoản',
        phoneNumber: null,
        email: null,
        avatarUrl: null,
        verificationLevel: 'none',
    };
}
/**
 * Anonymizes tenant names on existing reviews to preserve community trust data
 * without keeping personal identifiable information.
 */
function anonymizeUserReviews(userId, reviews) {
    return reviews.map((r) => {
        if (r.tenantId === userId) {
            return {
                ...r,
                tenantName: 'Người dùng ẩn danh [Đã xóa tài khoản]',
            };
        }
        return r;
    });
}
