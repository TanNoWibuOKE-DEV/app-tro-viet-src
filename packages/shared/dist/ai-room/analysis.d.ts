/**
 * Trọ Việt - AI Room Insights Engine (Disciplined & Fact-backed)
 * Strictly adheres to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Backed 100% by fields in database (no hallucinated room features).
 * - Transparent price comparison against ward/district benchmarks.
 * - Actionable viewing advice tailored to the room's facilities.
 */
import { ListingSummary } from '../types/index.js';
export interface AIRoomAnalysisResult {
    summary: string;
    priceAssessment: {
        comparisonPercent: number;
        label: string;
        details: string;
    };
    transparencyAssessment: {
        isFullyTransparent: boolean;
        label: string;
        missingCosts: string[];
    };
    keyAdvantages: string[];
    viewingAdvice: string[];
}
/**
 * Generates grounded AI insights for a specific room listing.
 */
export declare function analyzeRoomListing(listing: ListingSummary): AIRoomAnalysisResult;
