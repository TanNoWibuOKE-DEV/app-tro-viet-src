/**
 * Trọ Việt - AI Natural Language Search Parser (Disciplined AI)
 * Adheres strictly to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Converts raw Vietnamese queries into structured SearchFilterParams (JSON validated).
 * - Handles unaccented, abbreviation, and colloquial expressions of Vietnamese students & workers.
 * - Always generates a friendly human-readable explanation of understood criteria.
 * - Never hallucinates criteria outside system-supported schema.
 */
import { SearchFilterParams } from '../types/index.js';
export interface AISearchDetectedCriterion {
    type: 'budget' | 'property_type' | 'ward_or_landmark' | 'amenities';
    label: string;
    value: unknown;
}
export interface AISearchParseResult {
    parsedFilter: SearchFilterParams;
    explanation: string;
    detectedCriteria: AISearchDetectedCriterion[];
    confidence: number;
}
/**
 * Parses a natural language Vietnamese search query into structured search filter parameters.
 */
export declare function parseNaturalLanguageSearch(rawQuery: string): AISearchParseResult;
