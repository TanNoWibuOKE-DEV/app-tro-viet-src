"use strict";
/**
 * Room Transfer & Student Pass-Item Marketplace Engine (Phase 13: Student Ecosystem)
 * Strictly adheres to 00-core.md: Integer VND, Vietnamese localization, Law 91/2025/QH15.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoomTransfer = createRoomTransfer;
exports.calculateTransferSavings = calculateTransferSavings;
exports.createStudentPassItem = createStudentPassItem;
exports.markPassItemSold = markPassItemSold;
exports.filterPassItems = filterPassItems;
/**
 * Creates a valid room transfer listing.
 */
function createRoomTransfer(params) {
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
function calculateTransferSavings(params) {
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
function createStudentPassItem(params) {
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
function markPassItemSold(item) {
    return {
        ...item,
        status: 'sold',
        updatedAt: new Date().toISOString(),
    };
}
/**
 * Filters pass items by category, campus, and maximum price.
 */
function filterPassItems(items, filter) {
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
