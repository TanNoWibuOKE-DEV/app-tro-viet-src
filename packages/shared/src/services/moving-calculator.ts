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
  specialItemsBreakdown: Array<{ name: string; cost: number }>;
  totalCostVnd: number;
  notes: string[];
}

export type ServiceType =
  | 'moving'
  | 'cleaning'
  | 'plumbing_electrical'
  | 'laundry'
  | 'ac_maintenance';

export type ServiceStatus =
  | 'pending'
  | 'quoted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

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

export const STAIR_FLOOR_SURCHARGE_VND = 50000;

export const VEHICLE_SPECS: Record<VehicleType, VehicleSpecification> = {
  ba_gac: {
    id: 'ba_gac',
    name: 'Xe ba gác máy chở trọ',
    shortName: 'Ba gác (Hẻm nhỏ)',
    maxCapacityKg: 500,
    dimensions: '2.0m x 1.2m x 1.2m',
    baseDistanceKm: 4,
    basePriceVnd: 150000,
    perKmRateVnd: 18000,
    porterBaseVnd: 100000,
    recommendedFor: 'Phòng trọ 1 người, ít đồ cồng kềnh, dễ luồn lách hẻm sâu',
    bestSuitedForAlleys: true,
  },
  truck_small_750kg: {
    id: 'truck_small_750kg',
    name: 'Xe tải nhỏ 750kg thùng kín',
    shortName: 'Xe tải 750kg',
    maxCapacityKg: 750,
    dimensions: '2.4m x 1.4m x 1.4m',
    baseDistanceKm: 4,
    basePriceVnd: 250000,
    perKmRateVnd: 22000,
    porterBaseVnd: 150000,
    recommendedFor: 'Phòng 1-2 người, có tủ lạnh mini, máy giặt, đệm gấp, quạt điện',
    bestSuitedForAlleys: false,
  },
  truck_large_1250kg: {
    id: 'truck_large_1250kg',
    name: 'Xe tải lớn 1.25 tấn',
    shortName: 'Xe tải 1.25 tấn',
    maxCapacityKg: 1250,
    dimensions: '3.2m x 1.6m x 1.7m',
    baseDistanceKm: 4,
    basePriceVnd: 380000,
    perKmRateVnd: 28000,
    porterBaseVnd: 200000,
    recommendedFor: 'Căn hộ mini, phòng trọ đông người, đồ gỗ nội thất lớn, tủ quần áo',
    bestSuitedForAlleys: false,
  },
};

export const SPECIAL_SURCHARGE_ITEMS: SpecialSurchargeItem[] = [
  {
    id: 'large_fridge',
    name: 'Tủ lạnh lớn (> 200L / Side-by-side)',
    surchargeVnd: 100000,
    description: 'Yêu cầu 2 người nâng đỡ, vận chuyển đứng an toàn cho block máy',
  },
  {
    id: 'washing_machine',
    name: 'Máy giặt cửa ngang',
    surchargeVnd: 80000,
    description: 'Tháo lắp ống nước, xả cặn an toàn',
  },
  {
    id: 'bed_wardrobe',
    name: 'Giường gỗ / Tủ quần áo tháo ráp',
    surchargeVnd: 120000,
    description: 'Công cụ tháo dỡ và lắp ráp hoàn chỉnh tại phòng mới',
  },
  {
    id: 'safe_box_piano',
    name: 'Két sắt nặng hoặc đàn Piano điện',
    surchargeVnd: 200000,
    description: 'Thiết bị nặng cồng kềnh, bọc chống sốc chuyên dụng',
  },
];

/**
 * Calculates accurate moving costs based on distance, floor access, and vehicle capacity.
 */
export function calculateMovingCost(input: MovingCalculatorInput): MovingCostBreakdown {
  const safeDistance = Math.max(0.1, input.distanceKm);
  const vehicle = VEHICLE_SPECS[input.vehicleType] || VEHICLE_SPECS.ba_gac;
  const notes: string[] = [];

  // 1. Distance Cost
  let distanceCost = vehicle.basePriceVnd;
  if (safeDistance > vehicle.baseDistanceKm) {
    const extraKm = Math.ceil(safeDistance - vehicle.baseDistanceKm);
    distanceCost += extraKm * vehicle.perKmRateVnd;
    notes.push(`Đã tính cự ly vượt: +${extraKm} km × ${vehicle.perKmRateVnd.toLocaleString('vi-VN')} ₫/km`);
  } else {
    notes.push(`Cự ly trong gói cơ bản (≤ ${vehicle.baseDistanceKm} km)`);
  }

  // 2. Stairs Surcharge (Khiêng vác thang bộ)
  const floorPickup = Math.max(1, input.floorPickup ?? 1);
  const hasElevatorPickup = input.hasElevatorPickup ?? true;
  let stairsSurchargePickup = 0;
  if (!hasElevatorPickup && floorPickup > 1) {
    stairsSurchargePickup = (floorPickup - 1) * STAIR_FLOOR_SURCHARGE_VND;
    notes.push(`Điểm đi tầng ${floorPickup} không thang máy: +${stairsSurchargePickup.toLocaleString('vi-VN')} ₫`);
  }

  const floorDropoff = Math.max(1, input.floorDropoff ?? 1);
  const hasElevatorDropoff = input.hasElevatorDropoff ?? true;
  let stairsSurchargeDropoff = 0;
  if (!hasElevatorDropoff && floorDropoff > 1) {
    stairsSurchargeDropoff = (floorDropoff - 1) * STAIR_FLOOR_SURCHARGE_VND;
    notes.push(`Điểm đến tầng ${floorDropoff} không thang máy: +${stairsSurchargeDropoff.toLocaleString('vi-VN')} ₫`);
  }

  const totalStairsSurcharge = stairsSurchargePickup + stairsSurchargeDropoff;

  // 3. Porter Cost (Bốc xếp trọn gói)
  let porterCost = 0;
  if (input.includePorter) {
    porterCost = vehicle.porterBaseVnd;
    notes.push(`Bốc xếp trọn gói 2 đầu: +${porterCost.toLocaleString('vi-VN')} ₫`);
  }

  // 4. Special Items Surcharges
  let specialItemsCost = 0;
  const specialItemsBreakdown: Array<{ name: string; cost: number }> = [];

  if (input.specialItemIds && input.specialItemIds.length > 0) {
    for (const itemId of input.specialItemIds) {
      const item = SPECIAL_SURCHARGE_ITEMS.find((s) => s.id === itemId);
      if (item) {
        specialItemsCost += item.surchargeVnd;
        specialItemsBreakdown.push({ name: item.name, cost: item.surchargeVnd });
      }
    }
  }

  const totalCostVnd = distanceCost + totalStairsSurcharge + porterCost + specialItemsCost;

  return {
    vehicle,
    distanceKm: safeDistance,
    distanceCost,
    stairsSurchargePickup,
    stairsSurchargeDropoff,
    totalStairsSurcharge,
    porterCost,
    specialItemsCost,
    specialItemsBreakdown,
    totalCostVnd,
    notes,
  };
}

/**
 * Recommends an optimal vehicle type based on room scale and alley conditions.
 */
export function recommendVehicle(params: {
  roomAreaSqm?: number;
  hasLargeAppliances?: boolean;
  isInNarrowAlley?: boolean;
}): VehicleType {
  const { roomAreaSqm = 20, hasLargeAppliances = false, isInNarrowAlley = false } = params;

  if (isInNarrowAlley) {
    return 'ba_gac';
  }

  if (roomAreaSqm > 35 || (roomAreaSqm >= 25 && hasLargeAppliances)) {
    return 'truck_large_1250kg';
  }

  if (roomAreaSqm >= 20 || hasLargeAppliances) {
    return 'truck_small_750kg';
  }

  return 'ba_gac';
}

/**
 * Generates a standard service booking request payload for local partners.
 */
export function createServiceRequest(params: {
  tenantId: string;
  serviceType: ServiceType;
  pickupAddress?: string;
  destinationAddress?: string;
  scheduledDate: string;
  estimatedCost: number;
  details?: Record<string, unknown>;
  notes?: string;
}): ServiceRequestRecord {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  return {
    id: `srv-${Date.now()}-${randomSuffix}`,
    requestCode: `SRV${randomSuffix}`,
    tenantId: params.tenantId,
    serviceType: params.serviceType,
    status: 'pending',
    pickupAddress: params.pickupAddress,
    destinationAddress: params.destinationAddress,
    scheduledDate: params.scheduledDate,
    estimatedCost: params.estimatedCost,
    details: params.details || {},
    notes: params.notes,
    createdAt: now,
    updatedAt: now,
  };
}
