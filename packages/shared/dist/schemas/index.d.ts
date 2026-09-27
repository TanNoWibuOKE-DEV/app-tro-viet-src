/**
 * Trọ Việt - Zod Validation Schemas
 */
import { z } from 'zod';
export declare const VietnamesePhoneSchema: z.ZodString;
export declare const ListingCostsSchema: z.ZodObject<{
    monthlyRent: z.ZodNumber;
    deposit: z.ZodNumber;
    electricityBillingType: z.ZodEnum<["meter", "fixed_monthly", "tiered", "unprovided"]>;
    electricityCostPerUnit: z.ZodOptional<z.ZodNumber>;
    waterBillingType: z.ZodEnum<["meter", "fixed_monthly", "tiered", "unprovided"]>;
    waterCostPerUnit: z.ZodOptional<z.ZodNumber>;
    internetBillingType: z.ZodEnum<["meter", "fixed_monthly", "tiered", "unprovided"]>;
    internetCost: z.ZodOptional<z.ZodNumber>;
    parkingBillingType: z.ZodEnum<["meter", "fixed_monthly", "tiered", "unprovided"]>;
    parkingCost: z.ZodOptional<z.ZodNumber>;
    serviceFeeBillingType: z.ZodEnum<["meter", "fixed_monthly", "tiered", "unprovided"]>;
    serviceCost: z.ZodOptional<z.ZodNumber>;
    otherFeesNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    monthlyRent: number;
    deposit: number;
    electricityBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    waterBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    internetBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    parkingBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    serviceFeeBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    electricityCostPerUnit?: number | undefined;
    waterCostPerUnit?: number | undefined;
    internetCost?: number | undefined;
    parkingCost?: number | undefined;
    serviceCost?: number | undefined;
    otherFeesNotes?: string | undefined;
}, {
    monthlyRent: number;
    deposit: number;
    electricityBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    waterBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    internetBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    parkingBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    serviceFeeBillingType: "meter" | "fixed_monthly" | "tiered" | "unprovided";
    electricityCostPerUnit?: number | undefined;
    waterCostPerUnit?: number | undefined;
    internetCost?: number | undefined;
    parkingCost?: number | undefined;
    serviceCost?: number | undefined;
    otherFeesNotes?: string | undefined;
}>;
export declare const AdminUnitCreateSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["province", "centrally_run_city", "ward", "commune", "special_zone"]>;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    validFrom: z.ZodString;
    validTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "province" | "centrally_run_city" | "ward" | "commune" | "special_zone";
    name: string;
    level: 1 | 2;
    validFrom: string;
    parentId?: string | null | undefined;
    validTo?: string | null | undefined;
}, {
    code: string;
    type: "province" | "centrally_run_city" | "ward" | "commune" | "special_zone";
    name: string;
    level: 1 | 2;
    validFrom: string;
    parentId?: string | null | undefined;
    validTo?: string | null | undefined;
}>;
export declare const SearchFilterSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    propertyType: z.ZodOptional<z.ZodEnum<["room", "apartment", "house", "shared"]>>;
    minRent: z.ZodOptional<z.ZodNumber>;
    maxRent: z.ZodOptional<z.ZodNumber>;
    wardCode: z.ZodOptional<z.ZodString>;
    amenityCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sortBy: z.ZodOptional<z.ZodEnum<["newest", "price_asc", "price_desc", "area_desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string | undefined;
    propertyType?: "room" | "apartment" | "house" | "shared" | undefined;
    minRent?: number | undefined;
    maxRent?: number | undefined;
    wardCode?: string | undefined;
    amenityCodes?: string[] | undefined;
    sortBy?: "newest" | "price_asc" | "price_desc" | "area_desc" | undefined;
}, {
    query?: string | undefined;
    propertyType?: "room" | "apartment" | "house" | "shared" | undefined;
    minRent?: number | undefined;
    maxRent?: number | undefined;
    wardCode?: string | undefined;
    amenityCodes?: string[] | undefined;
    sortBy?: "newest" | "price_asc" | "price_desc" | "area_desc" | undefined;
}>;
export declare const UserPreferencesSchema: z.ZodObject<{
    preferredPropertyTypes: z.ZodArray<z.ZodEnum<["room", "apartment", "house", "shared"]>, "many">;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodNumber;
    preferredWardCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferredAmenityCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    preferredPropertyTypes: ("room" | "apartment" | "house" | "shared")[];
    maxPrice: number;
    minPrice?: number | undefined;
    preferredWardCodes?: string[] | undefined;
    preferredAmenityCodes?: string[] | undefined;
}, {
    preferredPropertyTypes: ("room" | "apartment" | "house" | "shared")[];
    maxPrice: number;
    minPrice?: number | undefined;
    preferredWardCodes?: string[] | undefined;
    preferredAmenityCodes?: string[] | undefined;
}>;
