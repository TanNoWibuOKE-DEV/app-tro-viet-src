/**
 * Trọ Việt - Zod Validation Schemas
 */

import { z } from 'zod';

export const VietnamesePhoneSchema = z
  .string()
  .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ (phải gồm 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09)');

export const ListingCostsSchema = z.object({
  monthlyRent: z.number().int().positive('Giá thuê phòng phải là số nguyên dương'),
  deposit: z.number().int().nonnegative('Tiền cọc không được là số âm'),
  electricityBillingType: z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
  electricityCostPerUnit: z.number().int().nonnegative().optional(),
  waterBillingType: z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
  waterCostPerUnit: z.number().int().nonnegative().optional(),
  internetBillingType: z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
  internetCost: z.number().int().nonnegative().optional(),
  parkingBillingType: z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
  parkingCost: z.number().int().nonnegative().optional(),
  serviceFeeBillingType: z.enum(['meter', 'fixed_monthly', 'tiered', 'unprovided']),
  serviceCost: z.number().int().nonnegative().optional(),
  otherFeesNotes: z.string().optional(),
});

export const AdminUnitCreateSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  type: z.enum(['province', 'centrally_run_city', 'ward', 'commune', 'special_zone']),
  level: z.union([z.literal(1), z.literal(2)]),
  parentId: z.string().nullable().optional(),
  validFrom: z.string(),
  validTo: z.string().nullable().optional(),
});

export const SearchFilterSchema = z.object({
  query: z.string().optional(),
  propertyType: z.enum(['room', 'apartment', 'house', 'shared']).optional(),
  minRent: z.number().int().nonnegative().optional(),
  maxRent: z.number().int().nonnegative().optional(),
  wardCode: z.string().optional(),
  amenityCodes: z.array(z.string()).optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'area_desc']).optional(),
});

export const UserPreferencesSchema = z.object({
  preferredPropertyTypes: z.array(z.enum(['room', 'apartment', 'house', 'shared'])).min(1, 'Chọn ít nhất 1 loại phòng mong muốn'),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().positive('Ngân sách tối đa phải lớn hơn 0'),
  preferredWardCodes: z.array(z.string()).optional(),
  preferredAmenityCodes: z.array(z.string()).optional(),
});

