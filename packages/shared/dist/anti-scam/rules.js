"use strict";
/**
 * Trọ Việt - Anti-Scam Rule Engine (Explainable & Rule-based)
 * Strictly adheres to TroViet SPEC Section 7 & 8:
 * - Transparent, explainable signals (never black-box).
 * - Friendly phrasing: "Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc."
 * - Controlled review eligibility verification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RISKY_CHAT_KEYWORDS = void 0;
exports.checkListingPricingAnomaly = checkListingPricingAnomaly;
exports.analyzeChatMessageForRisks = analyzeChatMessageForRisks;
exports.checkReviewEligibility = checkReviewEligibility;
const index_js_1 = require("../formatters/index.js");
exports.RISKY_CHAT_KEYWORDS = [
    'chuyen coc',
    'coc truoc',
    'dat coc giu cho',
    'coc giu cho',
    'chuyen khoan truoc',
    'chuyen khoan gap',
    'ket ban zalo',
    'add zalo',
    'qua zalo noi chuyen',
    'nhan tin qua zalo',
    'so tai khoan',
    'stk',
];
/**
 * Checks for price anomalies in listings (e.g., unrealistically cheap rooms to lure tenants).
 */
function checkListingPricingAnomaly(monthlyRent, propertyType, areaSquareMeters) {
    const signals = [];
    // Minimum realistic rent threshold in Da Nang (1.000.000 VND for private room/apartment)
    if ((propertyType === 'room' || propertyType === 'apartment') && monthlyRent < 1000000) {
        signals.push({
            code: 'PRICE_ABNORMALLY_LOW',
            severity: 'high',
            title: 'Mức giá thấp bất thường',
            description: 'Giá phòng thấp hơn đáng kể so với mặt bằng chung khu vực. Bạn cần đến tận nơi kiểm tra phòng thực tế trước khi đặt cọc.',
        });
    }
    // Price per square meter anomaly check (< 35.000 VND / m² for apartment in urban areas)
    if (propertyType === 'apartment' && areaSquareMeters > 30) {
        const pricePerM2 = monthlyRent / areaSquareMeters;
        if (pricePerM2 < 35000) {
            signals.push({
                code: 'APARTMENT_PRICE_M2_LOW',
                severity: 'medium',
                title: 'Giá thuê trên diện tích thấp bất thường',
                description: 'Giá căn hộ trên diện tích sử dụng rất thấp. Vui lòng kiểm tra kỹ tình trạng cơ sở vật chất.',
            });
        }
    }
    return signals;
}
/**
 * Scans chat messages for early deposit demands or attempts to lure users outside app.
 */
function analyzeChatMessageForRisks(messageText) {
    const normText = (0, index_js_1.normalizeVietnameseText)(messageText);
    const detected = [];
    for (const kw of exports.RISKY_CHAT_KEYWORDS) {
        if (normText.includes(kw)) {
            detected.push(kw);
        }
    }
    if (detected.length > 0) {
        return {
            hasRisk: true,
            detectedKeywords: detected,
            warningMessage: 'Cảnh báo an toàn Trọ Việt: Tin nhắn có dấu hiệu đề cập chuyển cọc sớm hoặc chuyển sang ứng dụng khác. Tuyệt đối KHÔNG chuyển tiền cọc khi chưa xem phòng và đối chiếu giấy tờ trực tiếp.',
        };
    }
    return {
        hasRisk: false,
        detectedKeywords: [],
    };
}
/**
 * Strict Review Control (Anti-Fake Reviews):
 * - Landlord cannot review their own listing.
 * - Tenant must have interacted / initiated a conversation with the landlord.
 */
function checkReviewEligibility(userId, landlordId, hasChatHistory) {
    if (userId === landlordId) {
        return {
            canReview: false,
            reason: 'Chủ nhà không thể tự đánh giá tin đăng của chính mình.',
        };
    }
    if (!hasChatHistory) {
        return {
            canReview: false,
            reason: 'Chỉ người thuê đã từng liên hệ nhắn tin trao đổi với chủ trọ mới được gửi đánh giá phòng.',
        };
    }
    return {
        canReview: true,
    };
}
