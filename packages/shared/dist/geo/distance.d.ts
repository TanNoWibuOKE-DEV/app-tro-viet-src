/**
 * Trọ Việt - Geographic Calculations & Haversine Distance
 */
export interface Coordinates {
    latitude: number;
    longitude: number;
}
/**
 * Calculates the great-circle distance between two points on the Earth (in km)
 * using the Haversine formula.
 */
export declare function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number;
export interface MapCluster<T> {
    id: string;
    center: Coordinates;
    items: T[];
    count: number;
}
/**
 * Lightweight clustering for map points within a given radius (in km).
 */
export declare function clusterPoints<T extends {
    latitude: number;
    longitude: number;
    id: string;
}>(items: T[], clusterRadiusKm?: number): Array<MapCluster<T> | T>;
