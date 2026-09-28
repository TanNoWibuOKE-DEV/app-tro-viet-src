/**
 * Urban Flood Risk & Monsoon Safety Engine (Phase 13: Campus Hub & Neighborhood Safety)
 * Grounded in Vietnamese metropolitan topography: Da Nang, Hanoi, Ho Chi Minh City.
 */
export type FloodSeverity = 'light' | 'moderate' | 'severe';
export type FloodSafetyLevel = 'very_safe' | 'low_risk' | 'moderate_risk' | 'high_risk';
export interface FloodReport {
    id: string;
    cityCode: 'danang' | 'hanoi' | 'hcm';
    wardSlug: string;
    streetName: string;
    latitude: number;
    longitude: number;
    severity: FloodSeverity;
    depthCm: number;
    description: string;
    upvotes: number;
    verified: boolean;
    createdAt: string;
}
export interface FloodRiskAssessment {
    hasNearbyFloodWarning: boolean;
    highestSeverity: FloodSeverity | 'none';
    safetyScore: number;
    safetyLevel: FloodSafetyLevel;
    nearestReportDistanceMeters?: number;
    advisoryMessage: string;
    nearbyReports: FloodReport[];
    recommendations: string[];
}
export declare const HISTORICAL_FLOOD_HOTSPOTS: FloodReport[];
/**
 * Assesses the urban flood safety index for a given rental property.
 */
export declare function assessPropertyFloodRisk(params: {
    latitude?: number;
    longitude?: number;
    street?: string;
    wardSlug?: string;
    cityCode?: 'danang' | 'hanoi' | 'hcm';
    floorNumber?: number;
    customReports?: FloodReport[];
}): FloodRiskAssessment;
/**
 * Creates a new crowdsourced flood incident report.
 */
export declare function createFloodReport(params: {
    cityCode: 'danang' | 'hanoi' | 'hcm';
    wardSlug: string;
    streetName: string;
    latitude: number;
    longitude: number;
    severity: FloodSeverity;
    depthCm: number;
    description: string;
}): FloodReport;
/**
 * Upvotes a community flood report. Marks verified when reaching threshold (>= 2).
 */
export declare function upvoteFloodReport(report: FloodReport): FloodReport;
