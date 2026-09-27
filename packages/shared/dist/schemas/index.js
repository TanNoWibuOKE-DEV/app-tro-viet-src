"use strict";
/**
 * Trọ Việt - Zod Validation Schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesSchema = exports.SearchFilterSchema = exports.AdminUnitCreateSchema = exports.ListingCostsSchema = exports.VietnamesePhoneSchema = void 0;
const zod_1 = require("zod");
exports.VietnamesePhoneSchema = zod_1.z
    .string()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ (phải gồm 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09)');
exports.ListingCostsSchema = zod_1.z.object({
    monthlyRent: zod_1.z.number().int().positive('Giá thuê phòng phải là số nguyên dương'),
    deposit: zod_1.z.number().int().nonnegative('Tiền cọc không được là số âm'),
    electricityBillingType: zod_1.z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
    electricityCostPerUnit: zod_1.z.number().int().nonnegative().optional(),
    waterBillingType: zod_1.z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
    waterCostPerUnit: zod_1.z.number().int().nonnegative().optional(),
    internetBillingType: zod_1.z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
    internetCost: zod_1.z.number().int().nonnegative().optional(),
    parkingBillingType: zod_1.z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
    parkingCost: zod_1.z.number().int().nonnegative().optional(),
    serviceFeeBillingType: zod_1.z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
    serviceCost: zod_1.z.number().int().nonnegative().optional(),
    otherFeesNotes: zod_1.z.string().optional(),
});
exports.AdminUnitCreateSchema = zod_1.z.object({
    code: zod_1.z.string().min(2),
    name: zod_1.z.string().min(2),
    type: zod_1.z.enum(['province', 'centrally_run_city', 'ward', 'commune', 'special_zone']),
    level: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2)]),
    parentId: zod_1.z.string().nullable().optional(),
    validFrom: zod_1.z.string(),
    validTo: zod_1.z.string().nullable().optional(),
});
exports.SearchFilterSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    propertyType: zod_1.z.enum(['room', 'apartment', 'house', 'shared']).optional(),
    minRent: zod_1.z.number().int().nonnegative().optional(),
    maxRent: zod_1.z.number().int().nonnegative().optional(),
    wardCode: zod_1.z.string().optional(),
    amenityCodes: zod_1.z.array(zod_1.z.string()).optional(),
    sortBy: zod_1.z.enum(['newest', 'price_asc', 'price_desc', 'area_desc']).optional(),
});
exports.UserPreferencesSchema = zod_1.z.object({
    preferredPropertyTypes: zod_1.z.array(zod_1.z.enum(['room', 'apartment', 'house', 'shared'])).min(1, 'Chọn ít nhất 1 loại phòng mong muốn'),
    minPrice: zod_1.z.number().int().nonnegative().optional(),
    maxPrice: zod_1.z.number().int().positive('Ngân sách tối đa phải lớn hơn 0'),
    preferredWardCodes: zod_1.z.array(zod_1.z.string()).optional(),
    preferredAmenityCodes: zod_1.z.array(zod_1.z.string()).optional(),
});
