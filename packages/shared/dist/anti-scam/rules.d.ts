/**
 * Trọ Việt - Anti-Scam Rule Engine (Explainable & Rule-based)
 * Strictly adheres to TroViet SPEC Section 7 & 8:
 * - Transparent, explainable signals (never black-box).
 * - Friendly phrasing: "Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc."
 * - Controlled review eligibility verification.
 */
import { PropertyType } from '../types/index.js';
export interface AntiScamSignal {
    code: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
}
export declare const RISKY_CHAT_KEYWORDS: string[];
/**
 * Checks for price anomalies in listings (e.g., unrealistically cheap rooms to lure tenants).
 */
export declare function checkListingPricingAnomaly(monthlyRent: number, propertyType: PropertyType, areaSquareMeters: number): AntiScamSignal[];
export interface ChatKeywordAnalysisResult {
    hasRisk: boolean;
    detectedKeywords: string[];
    warningMessage?: string;
}
/**
 * Scans chat messages for early deposit demands or attempts to lure users outside app.
 */
export declare function analyzeChatMessageForRisks(messageText: string): ChatKeywordAnalysisResult;
export interface ReviewEligibilityResult {
    canReview: boolean;
    reason?: string;
}
/**
 * Strict Review Control (Anti-Fake Reviews):
 * - Landlord cannot review their own listing.
 * - Tenant must have interacted / initiated a conversation with the landlord.
 */
export declare function checkReviewEligibility(userId: string, landlordId: string, hasChatHistory: boolean): ReviewEligibilityResult;
