/**
 * Trọ Việt - Total Cost Calculator
 * Implements strict transparent pricing rules:
 * - Never treat missing costs as 0 VND.
 * - Separates "Mỗi tháng (ước tính)" and "Cần chuẩn bị khi vào ở".
 * - Clearly lists unprovided costs.
 */
import { ListingCosts, CostCalculationResult } from '../types/index.js';
export interface ConsumptionAssumptions {
    monthlyElectricityUnitsKwh?: number;
    monthlyWaterUnitsM3?: number;
    vehiclesCount?: number;
    peopleCount?: number;
}
export declare const DEFAULT_CONSUMPTION: ConsumptionAssumptions;
export declare function calculateTotalCosts(costs: ListingCosts, assumptions?: ConsumptionAssumptions): CostCalculationResult;
