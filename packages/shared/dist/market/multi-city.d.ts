/**
 * Trọ Việt - Multi-City Administrative & Market Configuration
 * Strictly adheres to 2-tier administrative model (Province/City -> Ward/Commune)
 * under Vietnamese Law 91/2025/QH15 and SPEC Section 6.
 * Covers 3 core metropolitan markets: TP. Đà Nẵng, TP. Hà Nội, TP. Hồ Chí Minh.
 */
export interface WardReference {
    code: string;
    name: string;
    districtLegacy: string;
    studentHubs?: string[];
    approxCoords: {
        latitude: number;
        longitude: number;
    };
}
export interface SupportedCity {
    code: string;
    name: string;
    shortName: string;
    defaultCoordinates: {
        latitude: number;
        longitude: number;
    };
    popularWards: WardReference[];
}
export declare const SUPPORTED_CITIES: Record<string, SupportedCity>;
/**
 * Returns supported cities as an array for UI dropdowns and pickers.
 */
export declare function getSupportedCityList(): SupportedCity[];
/**
 * Finds a city by code ('48', '01', '79') or normalized name.
 */
export declare function findSupportedCity(query: string): SupportedCity | undefined;
