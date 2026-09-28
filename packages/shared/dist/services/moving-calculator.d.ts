/**
 * Moving Calculator & Service Booking Engine (Phase 12: Tenant Life Hub)
 * Adheres to 00-core.md: Integer VND, Vietnamese localization, Law 91/2025/QH15.
 */
export type VehicleType = 'ba_gac' | 'truck_small_750kg' | 'truck_large_1250kg';
export interface VehicleSpecification {
    id: VehicleType;
    name: string;
    shortName: string;
    maxCapacityKg: number;
    dimensions: string;
    baseDistanceKm: number;
    basePriceVnd: number;
    perKmRateVnd: number;
    porterBaseVnd: number;
    recommendedFor: string;
    bestSuitedForAlleys: boolean;
}
export interface SpecialSurchargeItem {
    id: string;
    name: string;
    surchargeVnd: number;
    description: string;
}
export interface MovingCalculatorInput {
    distanceKm: number;
    vehicleType: VehicleType;
    floorPickup?: number;
    hasElevatorPickup?: boolean;
    floorDropoff?: number;
    hasElevatorDropoff?: boolean;
    includePorter?: boolean;
    specialItemIds?: string[];
}
export interface MovingCostBreakdown {
    vehicle: VehicleSpecification;
    distanceKm: number;
    distanceCost: number;
    stairsSurchargePickup: number;
    stairsSurchargeDropoff: number;
    totalStairsSurcharge: number;
    porterCost: number;
    specialItemsCost: number;
    specialItemsBreakdown: Array<{
        name: string;
        cost: number;
    }>;
    totalCostVnd: number;
    notes: string[];
}
export type ServiceType = 'moving' | 'cleaning' | 'plumbing_electrical' | 'laundry' | 'ac_maintenance';
export type ServiceStatus = 'pending' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export interface ServiceRequestRecord {
    id: string;
    requestCode: string;
    tenantId: string;
    serviceType: ServiceType;
    status: ServiceStatus;
    pickupAddress?: string;
    destinationAddress?: string;
    scheduledDate: string;
    estimatedCost: number;
    finalCost?: number;
    details: Record<string, unknown>;
    partnerName?: string;
    partnerPhone?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export declare const STAIR_FLOOR_SURCHARGE_VND = 50000;
export declare const VEHICLE_SPECS: Record<VehicleType, VehicleSpecification>;
export declare const SPECIAL_SURCHARGE_ITEMS: SpecialSurchargeItem[];
/**
 * Calculates accurate moving costs based on distance, floor access, and vehicle capacity.
 */
export declare function calculateMovingCost(input: MovingCalculatorInput): MovingCostBreakdown;
/**
 * Recommends an optimal vehicle type based on room scale and alley conditions.
 */
export declare function recommendVehicle(params: {
    roomAreaSqm?: number;
    hasLargeAppliances?: boolean;
    isInNarrowAlley?: boolean;
}): VehicleType;
/**
 * Generates a standard service booking request payload for local partners.
 */
export declare function createServiceRequest(params: {
    tenantId: string;
    serviceType: ServiceType;
    pickupAddress?: string;
    destinationAddress?: string;
    scheduledDate: string;
    estimatedCost: number;
    details?: Record<string, unknown>;
    notes?: string;
}): ServiceRequestRecord;
