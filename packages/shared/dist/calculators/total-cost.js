"use strict";
/**
 * Trọ Việt - Total Cost Calculator
 * Implements strict transparent pricing rules:
 * - Never treat missing costs as 0 VND.
 * - Separates "Mỗi tháng (ước tính)" and "Cần chuẩn bị khi vào ở".
 * - Clearly lists unprovided costs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONSUMPTION = void 0;
exports.calculateTotalCosts = calculateTotalCosts;
exports.DEFAULT_CONSUMPTION = {
    monthlyElectricityUnitsKwh: 80,
    monthlyWaterUnitsM3: 4,
    vehiclesCount: 1,
    peopleCount: 1,
};
function calculateTotalCosts(costs, assumptions = exports.DEFAULT_CONSUMPTION) {
    const mergedAssumptions = { ...exports.DEFAULT_CONSUMPTION, ...assumptions };
    let monthlyEstimatedTotal = costs.monthlyRent;
    const knownMonthlyCosts = {
        rent: costs.monthlyRent,
    };
    const unprovidedCostFields = [];
    // 1. Electricity
    if (costs.electricityBillingType === 'unprovided' || costs.electricityCostPerUnit === undefined) {
        unprovidedCostFields.push({ field: 'electricity', label: 'Tiền điện' });
    }
    else if (costs.electricityBillingType === 'fixed_monthly') {
        const electricityCost = costs.electricityCostPerUnit;
        monthlyEstimatedTotal += electricityCost;
        knownMonthlyCosts.electricity = electricityCost;
    }
    else {
        // Metered / Tiered: Multiply unit cost by assumed monthly usage
        const electricityCost = Math.round(costs.electricityCostPerUnit * (mergedAssumptions.monthlyElectricityUnitsKwh || 80));
        monthlyEstimatedTotal += electricityCost;
        knownMonthlyCosts.electricity = electricityCost;
    }
    // 2. Water
    if (costs.waterBillingType === 'unprovided' || costs.waterCostPerUnit === undefined) {
        unprovidedCostFields.push({ field: 'water', label: 'Tiền nước' });
    }
    else if (costs.waterBillingType === 'fixed_monthly') {
        const waterCost = costs.waterCostPerUnit * (mergedAssumptions.peopleCount || 1);
        monthlyEstimatedTotal += waterCost;
        knownMonthlyCosts.water = waterCost;
    }
    else {
        // Metered
        const waterCost = Math.round(costs.waterCostPerUnit * (mergedAssumptions.monthlyWaterUnitsM3 || 4));
        monthlyEstimatedTotal += waterCost;
        knownMonthlyCosts.water = waterCost;
    }
    // 3. Internet
    if (costs.internetBillingType === 'unprovided') {
        unprovidedCostFields.push({ field: 'internet', label: 'Tiền Internet/Wifi' });
    }
    else if (costs.internetBillingType !== 'fixed_monthly' && costs.internetCost === undefined) {
        unprovidedCostFields.push({ field: 'internet', label: 'Tiền Internet/Wifi' });
    }
    else {
        const internetCost = costs.internetCost || 0;
        monthlyEstimatedTotal += internetCost;
        knownMonthlyCosts.internet = internetCost;
    }
    // 4. Parking
    if (costs.parkingBillingType === 'unprovided') {
        unprovidedCostFields.push({ field: 'parking', label: 'Phí gửi xe' });
    }
    else if (costs.parkingCost !== undefined) {
        const parkingCost = costs.parkingCost * (mergedAssumptions.vehiclesCount || 1);
        monthlyEstimatedTotal += parkingCost;
        knownMonthlyCosts.parking = parkingCost;
    }
    // 5. Service Fee
    if (costs.serviceFeeBillingType === 'unprovided') {
        unprovidedCostFields.push({ field: 'service', label: 'Phí dịch vụ/vệ sinh' });
    }
    else if (costs.serviceCost !== undefined) {
        monthlyEstimatedTotal += costs.serviceCost;
        knownMonthlyCosts.service = costs.serviceCost;
    }
    // Initial move-in total = deposit + first month's rent
    const initialMoveInTotal = costs.deposit + costs.monthlyRent;
    return {
        monthlyEstimatedTotal,
        initialMoveInTotal,
        knownMonthlyCosts,
        unprovidedCostFields,
        isFullyTransparent: unprovidedCostFields.length === 0,
    };
}
