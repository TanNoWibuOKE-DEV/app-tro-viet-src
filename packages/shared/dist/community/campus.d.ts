/**
 * Campus Community Hub Engine (Phase 13: Student Ecosystem)
 * Grounded campus locations in Da Nang, Hanoi, and Ho Chi Minh City.
 */
export interface CampusProfile {
    id: string;
    code: string;
    name: string;
    shortName: string;
    cityCode: 'danang' | 'hanoi' | 'hcm';
    address: string;
    latitude: number;
    longitude: number;
    popularWards: string[];
    averageStudentRent: number;
    studentTips: string[];
}
export declare const CAMPUS_PROFILES: CampusProfile[];
/**
 * Returns campuses located within a specific city.
 */
export declare function getCampusesByCity(cityCode: 'danang' | 'hanoi' | 'hcm'): CampusProfile[];
/**
 * Finds the nearest university campus given geographical coordinates.
 */
export declare function findNearestCampus(latitude: number, longitude: number): {
    campus: CampusProfile;
    distanceKm: number;
} | null;
