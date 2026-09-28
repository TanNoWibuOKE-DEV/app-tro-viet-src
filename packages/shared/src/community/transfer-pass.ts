/**
 * Room Transfer & Student Pass-Item Marketplace Engine (Phase 13: Student Ecosystem)
 * Strictly adheres to 00-core.md: Integer VND, Vietnamese localization, Law 91/2025/QH15.
 */

export interface RoomTransferRecord {
  id: string;
  transferCode: string;
  tenantId: string;
  listingId?: string;
  title: string;
  monthlyRent: number; // Integer VND
  depositAmount: number; // Integer VND
  roomAddress: string;
  wardSlug: string;
  cityCode: 'danang' | 'hanoi' | 'hcm';
  availableDate: string;
  contractMonthsLeft: number;
  landlordConsent: boolean;
  incentiveNote?: string;
  contactPhone: string;
  status: 'active' | 'transferred' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type PassItemCategory = 'appliances' | 'furniture' | 'kitchen' | 'study' | 'other';
export type PassItemCondition = 'like_new' | 'good' | 'fair';

export interface StudentPassItemRecord {
  id: string;
  itemCode: string;
  sellerId: string;
  title: string;
  category: PassItemCategory;
  priceVnd: number; // 0 = free pass
  condition: PassItemCondition;
  campusNear?: string;
  description: string;
  status: 'available' | 'sold' | 'hidden';
  pickupLocation: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Creates a valid room transfer listing.
 */
export function createRoomTransfer(params: {
  tenantId: string;
  listingId?: string;
  title: string;
  monthlyRent: number;
  depositAmount: number;
  roomAddress: string;
  wardSlug: string;
  cityCode: 'danang' | 'hanoi' | 'hcm';
  availableDate: string;
  contractMonthsLeft: number;
  landlordConsent?: boolean;
  incentiveNote?: string;
  contactPhone: string;
}): RoomTransferRecord {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  return {
    id: `trf-${Date.now()}-${randomSuffix}`,
    transferCode: `TRF${randomSuffix}`,
    tenantId: params.tenantId,
    listingId: params.listingId,
    title: params.title,
    monthlyRent: Math.max(1, Math.round(params.monthlyRent)),
    depositAmount: Math.max(0, Math.round(params.depositAmount)),
    roomAddress: params.roomAddress,
    wardSlug: params.wardSlug,
    cityCode: params.cityCode,
    availableDate: params.availableDate,
    contractMonthsLeft: Math.max(1, params.contractMonthsLeft),
    landlordConsent: params.landlordConsent ?? true,
    incentiveNote: params.incentiveNote,
    contactPhone: params.contactPhone,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculates financial benefits and savings for both parties during room transfer.
 */
export function calculateTransferSavings(params: {
  depositAmount: number;
  incentiveDiscountVnd?: number;
}): {
  depositReclaimedVnd: number;
  incentiveDiscountVnd: number;
  netTransferCostVnd: number;
} {
  const depositReclaimedVnd = Math.max(0, Math.round(params.depositAmount));
  const incentiveDiscountVnd = Math.max(0, Math.round(params.incentiveDiscountVnd || 0));
  const netTransferCostVnd = Math.max(0, depositReclaimedVnd - incentiveDiscountVnd);

  return {
    depositReclaimedVnd,
    incentiveDiscountVnd,
    netTransferCostVnd,
  };
}

/**
 * Creates a new student pass-item for second-hand student exchange.
 */
export function createStudentPassItem(params: {
  sellerId: string;
  title: string;
  category: PassItemCategory;
  priceVnd: number;
  condition: PassItemCondition;
  campusNear?: string;
  description: string;
  pickupLocation: string;
  contactPhone: string;
}): StudentPassItemRecord {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const now = new Date().toISOString();

  return {
    id: `pass-${Date.now()}-${randomSuffix}`,
    itemCode: `PASS${randomSuffix}`,
    sellerId: params.sellerId,
    title: params.title,
    category: params.category,
    priceVnd: Math.max(0, Math.round(params.priceVnd)),
    condition: params.condition,
    campusNear: params.campusNear,
    description: params.description,
    status: 'available',
    pickupLocation: params.pickupLocation,
    contactPhone: params.contactPhone,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Marks a student pass-item as successfully sold / transferred.
 */
export function markPassItemSold(item: StudentPassItemRecord): StudentPassItemRecord {
  return {
    ...item,
    status: 'sold',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Filters pass items by category, campus, and maximum price.
 */
export function filterPassItems(
  items: StudentPassItemRecord[],
  filter: {
    category?: PassItemCategory;
    campusNear?: string;
    maxPriceVnd?: number;
    availableOnly?: boolean;
  }
): StudentPassItemRecord[] {
  return items.filter((item) => {
    if (filter.availableOnly && item.status !== 'available') {
      return false;
    }
    if (filter.category && item.category !== filter.category) {
      return false;
    }
    if (filter.campusNear && item.campusNear && !item.campusNear.includes(filter.campusNear)) {
      return false;
    }
    if (filter.maxPriceVnd !== undefined && item.priceVnd > filter.maxPriceVnd) {
      return false;
    }
    return true;
  });
}
