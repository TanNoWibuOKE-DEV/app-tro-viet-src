"use strict";
/**
 * Trọ Việt - Landlord VIP Listing & Monetization Engine (Phase 11)
 * Manages listing promotion tiers, VietQR package payment codes,
 * search ranking boosts, and subscription lifecycle.
 * Integer VND and UTC timestamps with Vietnam display.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_PLANS = void 0;
exports.generatePackagePaymentCode = generatePackagePaymentCode;
exports.createSubscriptionOrder = createSubscriptionOrder;
exports.checkSubscriptionActive = checkSubscriptionActive;
exports.activateSubscriptionPayment = activateSubscriptionPayment;
exports.calculateListingRankingScore = calculateListingRankingScore;
exports.SUBSCRIPTION_PLANS = {
    free: {
        tier: 'free',
        name: 'Tin thường',
        badge: 'Miễn phí',
        badgeIcon: '📝',
        color: '#64748B',
        priceVND: 0,
        durationDays: 30,
        searchRankingMultiplier: 1.0,
        features: [
            'Hiển thị trong kết quả tìm kiếm thông thường',
            'Đầy đủ thông tin chi phí và vị trí bản đồ',
            'Nhận tin nhắn chat in-app từ người thuê',
        ],
        homepagePinned: false,
        autoPushSavedSearches: false,
    },
    vip_bronze: {
        tier: 'vip_bronze',
        name: 'VIP 1 (Nổi bật khu vực)',
        badge: 'VIP Đồng',
        badgeIcon: '🥉',
        color: '#B45309', // Bronze/Amber
        priceVND: 50000,
        durationDays: 30,
        searchRankingMultiplier: 1.3,
        features: [
            'Viền đồng nổi bật trên thẻ phòng',
            'Ưu tiên hiển thị trên kết quả tìm kiếm cùng Phường/Xã',
            'Huy hiệu VIP Đồng uy tín',
            'Tự động làm mới vị trí tin hàng tuần',
        ],
        homepagePinned: false,
        autoPushSavedSearches: false,
    },
    vip_silver: {
        tier: 'vip_silver',
        name: 'VIP 2 (Top danh mục)',
        badge: 'VIP Bạc',
        badgeIcon: '🥈',
        color: '#6B7280', // Silver/Chrome
        priceVND: 120000,
        durationDays: 30,
        searchRankingMultiplier: 1.8,
        features: [
            'Viền bạc sang trọng trên thẻ phòng',
            'Đứng đầu danh mục loại phòng (Phòng trọ / Căn hộ / Ở ghép)',
            'Tăng gấp đôi lượt tiếp cận người tìm phòng',
            'Tự động làm mới vị trí tin 3 ngày/lần',
        ],
        homepagePinned: false,
        autoPushSavedSearches: false,
    },
    vip_diamond: {
        tier: 'vip_diamond',
        name: 'VIP Kim Cương (Trang chủ & Push)',
        badge: 'VIP Kim Cương',
        badgeIcon: '💎',
        color: '#3B82F6', // Diamond Royal Blue
        priceVND: 250000,
        durationDays: 30,
        searchRankingMultiplier: 2.6,
        features: [
            'Ghim vị trí danh dự tại mục "Nổi bật" Trang chủ',
            'Viền vi tinh thể Kim Cương lấp lánh',
            'Tự động gửi thông báo đẩy (Push) tới người dùng có Saved Search phù hợp',
            'Hỗ trợ đăng tin đa nền tảng và ưu tiên xét duyệt siêu tốc',
        ],
        homepagePinned: true,
        autoPushSavedSearches: true,
    },
};
/**
 * Generates a unique package code for VietQR transfer memo (e.g. "PKG829104")
 */
function generatePackagePaymentCode() {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    return `PKG${randomSuffix}`;
}
/**
 * Creates an order to upgrade a listing to a VIP subscription tier.
 */
function createSubscriptionOrder(params) {
    const plan = exports.SUBSCRIPTION_PLANS[params.tier];
    if (!plan) {
        throw new Error(`Gói dịch vụ "${params.tier}" không hợp lệ.`);
    }
    const now = new Date();
    const days = params.durationDays ?? plan.durationDays;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const packageCode = generatePackagePaymentCode();
    return {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        landlordId: params.landlordId,
        listingId: params.listingId,
        listingTitle: params.listingTitle,
        tier: params.tier,
        pricePaid: plan.priceVND,
        packageCode,
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: plan.tier === 'free', // Free is active instantly; paid is activated upon payment reconciliation
        autoRefresh: params.autoRefresh ?? false,
        paymentReference: packageCode,
        activatedAt: plan.tier === 'free' ? now.toISOString() : undefined,
    };
}
/**
 * Checks whether a subscription is still active and calculates remaining days.
 */
function checkSubscriptionActive(sub, referenceDate) {
    if (!sub.isActive) {
        return { isActive: false, daysRemaining: 0, hoursRemaining: 0 };
    }
    const refMs = referenceDate ? new Date(referenceDate).getTime() : Date.now();
    const expiresMs = new Date(sub.expiresAt).getTime();
    const diffMs = expiresMs - refMs;
    if (diffMs <= 0) {
        return { isActive: false, daysRemaining: 0, hoursRemaining: 0 };
    }
    const hoursRemaining = Math.floor(diffMs / (3600 * 1000));
    const daysRemaining = Math.floor(hoursRemaining / 24);
    return {
        isActive: true,
        daysRemaining,
        hoursRemaining,
    };
}
/**
 * Activates a paid subscription upon VietQR webhook payment match.
 */
function activateSubscriptionPayment(sub) {
    const now = new Date();
    const plan = exports.SUBSCRIPTION_PLANS[sub.tier];
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    return {
        ...sub,
        isActive: true,
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        activatedAt: now.toISOString(),
    };
}
/**
 * Calculates a consolidated ranking score for sorting listings.
 * Integrates base trust score (trust/safety first) with subscription promotion boost.
 */
function calculateListingRankingScore(baseTrustScore, tier = 'free', createdAtIso) {
    const plan = exports.SUBSCRIPTION_PLANS[tier] || exports.SUBSCRIPTION_PLANS.free;
    // Base freshness factor (tin mới đăng trong 7 ngày được cộng điểm)
    let freshnessScore = 0;
    if (createdAtIso) {
        const ageDays = (Date.now() - new Date(createdAtIso).getTime()) / (24 * 3600 * 1000);
        if (ageDays <= 2)
            freshnessScore = 15;
        else if (ageDays <= 7)
            freshnessScore = 8;
    }
    // Multiply trust & freshness by the tier multiplier
    const totalBase = Math.max(10, baseTrustScore) + freshnessScore;
    const finalScore = Math.round(totalBase * plan.searchRankingMultiplier);
    return finalScore;
}
