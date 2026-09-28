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
    monthlyRent: number;
    depositAmount: number;
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
    priceVnd: number;
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
export declare function createRoomTransfer(params: {
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
}): RoomTransferRecord;
/**
 * Calculates financial benefits and savings for both parties during room transfer.
 */
export declare function calculateTransferSavings(params: {
    depositAmount: number;
    incentiveDiscountVnd?: number;
}): {
    depositReclaimedVnd: number;
    incentiveDiscountVnd: number;
    netTransferCostVnd: number;
};
/**
 * Creates a new student pass-item for second-hand student exchange.
 */
export declare function createStudentPassItem(params: {
    sellerId: string;
    title: string;
    category: PassItemCategory;
    priceVnd: number;
    condition: PassItemCondition;
    campusNear?: string;
    description: string;
    pickupLocation: string;
    contactPhone: string;
}): StudentPassItemRecord;
/**
 * Marks a student pass-item as successfully sold / transferred.
 */
export declare function markPassItemSold(item: StudentPassItemRecord): StudentPassItemRecord;
/**
 * Filters pass items by category, campus, and maximum price.
 */
export declare function filterPassItems(items: StudentPassItemRecord[], filter: {
    category?: PassItemCategory;
    campusNear?: string;
    maxPriceVnd?: number;
    availableOnly?: boolean;
}): StudentPassItemRecord[];
