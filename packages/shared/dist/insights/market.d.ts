/**
 * Trọ Việt - Da Nang Area Insights & Price History Engine
 * Strictly adheres to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Real, grounded ward-level rental market benchmarks for Da Nang.
 * - 6-month historical price trends to help tenants and landlords price fairly.
 * - Integer VND currency without speculation or hallucinated data.
 */
export interface MonthlyPricePoint {
    month: string;
    roomRentAvg: number;
    apartmentRentAvg: number;
}
export interface WardAreaInsight {
    wardCode: string;
    wardName: string;
    districtLegacyName: string;
    roomAvgRent: number;
    apartmentAvgRent: number;
    priceHistory: MonthlyPricePoint[];
    trend: 'stable' | 'increasing' | 'decreasing';
    changePercent: number;
    summary: string;
    highlights: string[];
}
export declare const DA_NANG_AREA_INSIGHTS: Record<string, WardAreaInsight>;
/**
 * Returns market insights for a specific ward in Vietnam.
 */
export declare function getWardAreaInsight(wardCode: string): WardAreaInsight;
/**
 * Returns all active ward market insights, optionally filtered by city code ('48', '01', '79').
 */
export declare function getAllAreaInsights(cityCode?: string): WardAreaInsight[];
