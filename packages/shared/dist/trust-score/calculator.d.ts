/**
 * Trọ Việt - Explainable Trust Score Engine
 * Adheres strictly to SPEC Section 7 & 8:
 * - 100% explainable rule-based scoring (0-100).
 * - Every point added or deducted must be backed by transparent factors in CSDL.
 * - Duplicate listing detection to combat spam & scam clones.
 */
import { ListingSummary, Review } from '../types/index.js';
export interface TrustScoreFactor {
    factor: string;
    points: number;
    positive: boolean;
    description: string;
}
export type TrustScoreLevel = 'very_high' | 'high' | 'medium' | 'needs_verification';
export interface TrustScoreResult {
    score: number;
    level: TrustScoreLevel;
    levelLabel: string;
    summary: string;
    factors: TrustScoreFactor[];
}
/**
 * Calculates transparent, explainable Trust Score for a rental listing.
 */
export declare function calculateListingTrustScore(listing: ListingSummary, options?: {
    reviews?: Review[];
    pendingReportsCount?: number;
}): TrustScoreResult;
export interface DuplicateDetectionResult {
    isDuplicate: boolean;
    confidence: number;
    matchedListingId?: string;
    reason?: string;
}
/**
 * Detects duplicate or cloned listings in the same ward with identical address or footprint.
 */
export declare function detectDuplicateListing(target: Pick<ListingSummary, 'id' | 'wardCode' | 'street' | 'houseNumber' | 'areaSquareMeters' | 'monthlyRent' | 'landlordId'>, existingListings: ListingSummary[]): DuplicateDetectionResult;
