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
