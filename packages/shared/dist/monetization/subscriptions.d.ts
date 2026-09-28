/**
 * Trọ Việt - Landlord VIP Listing & Monetization Engine (Phase 11)
 * Manages listing promotion tiers, VietQR package payment codes,
 * search ranking boosts, and subscription lifecycle.
 * Integer VND and UTC timestamps with Vietnam display.
 */
export type SubscriptionTier = 'free' | 'vip_bronze' | 'vip_silver' | 'vip_diamond';
export interface SubscriptionPlanConfig {
    tier: SubscriptionTier;
    name: string;
    badge: string;
    badgeIcon: string;
    color: string;
    priceVND: number;
    durationDays: number;
    searchRankingMultiplier: number;
    features: string[];
    homepagePinned: boolean;
    autoPushSavedSearches: boolean;
}
export declare const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanConfig>;
export interface LandlordSubscriptionRecord {
    id: string;
    landlordId: string;
    listingId: string;
    listingTitle: string;
    tier: SubscriptionTier;
    pricePaid: number;
    packageCode: string;
    startsAt: string;
    expiresAt: string;
    isActive: boolean;
    autoRefresh: boolean;
    paymentReference?: string;
    activatedAt?: string;
}
/**
 * Generates a unique package code for VietQR transfer memo (e.g. "PKG829104")
 */
export declare function generatePackagePaymentCode(): string;
/**
 * Creates an order to upgrade a listing to a VIP subscription tier.
 */
export declare function createSubscriptionOrder(params: {
    landlordId: string;
    listingId: string;
    listingTitle: string;
    tier: SubscriptionTier;
    durationDays?: number;
    autoRefresh?: boolean;
}): LandlordSubscriptionRecord;
/**
 * Checks whether a subscription is still active and calculates remaining days.
 */
export declare function checkSubscriptionActive(sub: LandlordSubscriptionRecord, referenceDate?: string | Date): {
    isActive: boolean;
    daysRemaining: number;
    hoursRemaining: number;
};
/**
 * Activates a paid subscription upon VietQR webhook payment match.
 */
export declare function activateSubscriptionPayment(sub: LandlordSubscriptionRecord): LandlordSubscriptionRecord;
/**
 * Calculates a consolidated ranking score for sorting listings.
 * Integrates base trust score (trust/safety first) with subscription promotion boost.
 */
export declare function calculateListingRankingScore(baseTrustScore: number, tier?: SubscriptionTier, createdAtIso?: string): number;
