"use strict";
/**
 * Trọ Việt - Explainable Trust Score Engine
 * Adheres strictly to SPEC Section 7 & 8:
 * - 100% explainable rule-based scoring (0-100).
 * - Every point added or deducted must be backed by transparent factors in CSDL.
 * - Duplicate listing detection to combat spam & scam clones.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateListingTrustScore = calculateListingTrustScore;
exports.detectDuplicateListing = detectDuplicateListing;
const index_js_1 = require("../formatters/index.js");
const rules_js_1 = require("../anti-scam/rules.js");
/**
 * Calculates transparent, explainable Trust Score for a rental listing.
 */
function calculateListingTrustScore(listing, options = {}) {
    let score = 0;
    const factors = [];
    // 1. Landlord Verification Level (up to 35 points)
    const level = listing.landlordVerificationLevel;
    if (level === 'L3') {
        score += 35;
        factors.push({
            factor: 'VERIFICATION_L3',
            points: 35,
            positive: true,
            description: 'Chủ trọ đã xác thực quyền cho thuê / Sổ hồng nhà đất chính thức (Cấp L3).',
        });
    }
    else if (level === 'L2') {
        score += 25;
        factors.push({
            factor: 'VERIFICATION_L2',
            points: 25,
            positive: true,
            description: 'Chủ trọ đã xác minh danh tính đối chiếu Căn cước công dân (Cấp L2).',
        });
    }
    else if (level === 'L1') {
        score += 15;
        factors.push({
            factor: 'VERIFICATION_L1',
            points: 15,
            positive: true,
            description: 'Chủ trọ đã xác thực số điện thoại qua mã OTP an toàn (Cấp L1).',
        });
    }
    else {
        factors.push({
            factor: 'VERIFICATION_NONE',
            points: 0,
            positive: false,
            description: 'Chưa hoàn thành xác thực danh tính.',
        });
    }
    // 2. Cost Transparency (up to 25 points) - TroViet Invariant
    const costs = listing.costs;
    const hasUnprovidedElectricity = costs.electricityBillingType === 'unprovided' || costs.electricityCostPerUnit === undefined;
    const hasUnprovidedWater = costs.waterBillingType === 'unprovided' || costs.waterCostPerUnit === undefined;
    if (!hasUnprovidedElectricity && !hasUnprovidedWater) {
        score += 25;
        factors.push({
            factor: 'COST_FULL_TRANSPARENCY',
            points: 25,
            positive: true,
            description: 'Biểu phí điện, nước và dịch vụ công khai minh bạch 100%.',
        });
    }
    else {
        score += 10;
        factors.push({
            factor: 'COST_PARTIAL_TRANSPARENCY',
            points: 10,
            positive: false,
            description: 'Một số khoản chi phí chưa được chủ nhà công bố đầy đủ.',
        });
    }
    // 3. Moderation & Listing Quality (up to 15 points)
    if (listing.status === 'published') {
        score += 15;
        factors.push({
            factor: 'LISTING_MODERATED',
            points: 15,
            positive: true,
            description: 'Tin đăng đã được Ban Kiểm Duyệt thẩm định địa chỉ và quy chuẩn hiển thị.',
        });
    }
    // 4. Community Reviews (up to 15 points)
    const approvedReviews = (options.reviews || []).filter((r) => r.listingId === listing.id && r.status === 'approved');
    if (approvedReviews.length > 0) {
        const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        if (avg >= 4.5) {
            score += 15;
            factors.push({
                factor: 'REVIEWS_EXCELLENT',
                points: 15,
                positive: true,
                description: `Đánh giá xuất sắc (${avg.toFixed(1)}/5 sao) từ người thuê thực tế.`,
            });
        }
        else if (avg >= 3.5) {
            score += 10;
            factors.push({
                factor: 'REVIEWS_GOOD',
                points: 10,
                positive: true,
                description: `Đánh giá tốt (${avg.toFixed(1)}/5 sao) từ người thuê thực tế.`,
            });
        }
        else {
            score += 5;
            factors.push({
                factor: 'REVIEWS_AVERAGE',
                points: 5,
                positive: false,
                description: `Đánh giá trung bình (${avg.toFixed(1)}/5 sao).`,
            });
        }
    }
    else {
        score += 5; // Neutral baseline for new listings
        factors.push({
            factor: 'REVIEWS_NEW',
            points: 5,
            positive: true,
            description: 'Phòng mới đăng, chưa có đánh giá nào từ người thuê.',
        });
    }
    // 5. Essential Amenities (up to 10 points)
    if (listing.amenities && listing.amenities.length >= 3) {
        score += 10;
        factors.push({
            factor: 'AMENITIES_COMPLETE',
            points: 10,
            positive: true,
            description: `Đầy đủ tiện ích sinh hoạt (${listing.amenities.length} tiện nghi).`,
        });
    }
    // 6. Anti-Scam Penalty (if pricing anomaly detected)
    const anomalies = (0, rules_js_1.checkListingPricingAnomaly)(listing.monthlyRent, listing.propertyType, listing.areaSquareMeters);
    if (anomalies.length > 0) {
        score -= 25;
        factors.push({
            factor: 'PRICE_ANOMALY_PENALTY',
            points: -25,
            positive: false,
            description: 'Mức giá thuê thấp bất thường so với mặt bằng khu vực.',
        });
    }
    // 7. Pending Reports Penalty
    const reportsCount = options.pendingReportsCount || 0;
    if (reportsCount > 0) {
        const penalty = Math.min(30, reportsCount * 15);
        score -= penalty;
        factors.push({
            factor: 'PENDING_REPORTS_PENALTY',
            points: -penalty,
            positive: false,
            description: `Đang có ${reportsCount} phản ánh vi phạm cần xác minh từ cộng đồng.`,
        });
    }
    // Clamp score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    let levelRating = 'medium';
    let levelLabel = 'Độ tin cậy Trung bình';
    let summary = 'Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc.';
    if (finalScore >= 85) {
        levelRating = 'very_high';
        levelLabel = 'Rất tin cậy';
        summary = 'Phòng có độ tin cậy rất cao, hồ sơ chủ nhà và biểu phí đầy đủ minh bạch.';
    }
    else if (finalScore >= 70) {
        levelRating = 'high';
        levelLabel = 'Tin cậy tốt';
        summary = 'Phòng có thông tin rõ ràng, chủ trọ đã xác thực đầy đủ.';
    }
    else if (finalScore >= 50) {
        levelRating = 'medium';
        levelLabel = 'Tin cậy trung bình';
        summary = 'Bạn nên liên hệ trao đổi chi tiết biểu phí trước khi đến xem phòng.';
    }
    else {
        levelRating = 'needs_verification';
        levelLabel = 'Cần đối chiếu thêm';
        summary = 'Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc.';
    }
    return {
        score: finalScore,
        level: levelRating,
        levelLabel: `${finalScore}/100 • ${levelLabel}`,
        summary,
        factors,
    };
}
/**
 * Detects duplicate or cloned listings in the same ward with identical address or footprint.
 */
function detectDuplicateListing(target, existingListings) {
    const normTargetStreet = (0, index_js_1.normalizeVietnameseText)(target.street);
    const normTargetNumber = (0, index_js_1.normalizeVietnameseText)(target.houseNumber);
    for (const item of existingListings) {
        if (item.id === target.id)
            continue;
        const normItemStreet = (0, index_js_1.normalizeVietnameseText)(item.street);
        const normItemNumber = (0, index_js_1.normalizeVietnameseText)(item.houseNumber);
        // Exact ward and exact address match
        if (item.wardCode === target.wardCode &&
            normItemStreet === normTargetStreet &&
            normItemNumber === normTargetNumber) {
            const areaDiff = Math.abs(item.areaSquareMeters - target.areaSquareMeters);
            const priceDiff = Math.abs(item.monthlyRent - target.monthlyRent);
            if (areaDiff <= 3 && priceDiff <= 200000) {
                return {
                    isDuplicate: true,
                    confidence: 0.95,
                    matchedListingId: item.id,
                    reason: `Trùng khớp địa chỉ (${target.houseNumber} ${target.street}), diện tích (~${item.areaSquareMeters}m²) và mức giá với tin đăng #${item.id}.`,
                };
            }
        }
    }
    return {
        isDuplicate: false,
        confidence: 0,
    };
}
