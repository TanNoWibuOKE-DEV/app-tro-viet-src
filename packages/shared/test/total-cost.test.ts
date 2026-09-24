import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotalCosts, DEFAULT_CONSUMPTION } from '../src/calculators/total-cost.js';
import { formatVND, formatArea, formatDistance, normalizeVietnameseText } from '../src/formatters/index.js';
import { ListingCosts } from '../src/types/index.js';

describe('Formatters', () => {
  it('formats integer VND currency properly with dots and symbol', () => {
    assert.equal(formatVND(2500000), '2.500.000 ₫');
    assert.equal(formatVND(0), '0 ₫');
    assert.equal(formatVND(350000), '350.000 ₫');
    assert.equal(formatVND(null), 'Chưa cung cấp');
    assert.equal(formatVND(undefined), 'Chưa cung cấp');
  });

  it('formats area with comma and m²', () => {
    assert.equal(formatArea(25), '25 m²');
    assert.equal(formatArea(30.5), '30,5 m²');
    assert.equal(formatArea(null), 'Chưa rõ diện tích');
  });

  it('formats distance in m or km', () => {
    assert.equal(formatDistance(0.5), '500 m');
    assert.equal(formatDistance(2.5), '2,5 km');
    assert.equal(formatDistance(null), '');
  });

  it('normalizes Vietnamese text by stripping accents', () => {
    assert.equal(normalizeVietnameseText('Hải Châu'), 'hai chau');
    assert.equal(normalizeVietnameseText('Đại Học Bách Khoa'), 'dai hoc bach khoa');
    assert.equal(normalizeVietnameseText('  Mỹ Khê  '), 'my khe');
  });
});

describe('Total Cost Calculator', () => {
  it('correctly calculates total cost with complete metered details', () => {
    const costs: ListingCosts = {
      monthlyRent: 3000000,
      deposit: 3000000,
      electricityBillingType: 'meter',
      electricityCostPerUnit: 3500, // 80 kWh * 3500 = 280.000
      waterBillingType: 'meter',
      waterCostPerUnit: 15000,      // 4 m³ * 15000 = 60.000
      internetBillingType: 'fixed_monthly',
      internetCost: 100000,
      parkingBillingType: 'fixed_monthly',
      parkingCost: 50000,           // 1 vehicle * 50000 = 50.000
      serviceFeeBillingType: 'fixed_monthly',
      serviceCost: 50000,
    };

    const result = calculateTotalCosts(costs, {
      monthlyElectricityUnitsKwh: 80,
      monthlyWaterUnitsM3: 4,
      vehiclesCount: 1,
      peopleCount: 1,
    });

    // 3.000.000 + 280.000 + 60.000 + 100.000 + 50.000 + 50.000 = 3.540.000
    assert.equal(result.monthlyEstimatedTotal, 3540000);
    // Initial move in: 3.000.000 rent + 3.000.000 deposit = 6.000.000
    assert.equal(result.initialMoveInTotal, 6000000);
    assert.equal(result.isFullyTransparent, true);
    assert.equal(result.unprovidedCostFields.length, 0);
  });

  it('never assumes missing costs are 0 VND and marks them as unprovided', () => {
    const costs: ListingCosts = {
      monthlyRent: 2000000,
      deposit: 2000000,
      electricityBillingType: 'unprovided',
      waterBillingType: 'unprovided',
      internetBillingType: 'unprovided',
      parkingBillingType: 'unprovided',
      serviceFeeBillingType: 'unprovided',
    };

    const result = calculateTotalCosts(costs);

    // monthlyEstimatedTotal only has rent because utilities are unprovided
    assert.equal(result.monthlyEstimatedTotal, 2000000);
    assert.equal(result.isFullyTransparent, false);
    assert.equal(result.unprovidedCostFields.length, 5);
    
    const fieldNames = result.unprovidedCostFields.map(f => f.field);
    assert.ok(fieldNames.includes('electricity'));
    assert.ok(fieldNames.includes('water'));
    assert.ok(fieldNames.includes('internet'));
    assert.ok(fieldNames.includes('parking'));
    assert.ok(fieldNames.includes('service'));
  });

  it('handles fixed monthly utility rates', () => {
    const costs: ListingCosts = {
      monthlyRent: 2500000,
      deposit: 2500000,
      electricityBillingType: 'fixed_monthly',
      electricityCostPerUnit: 200000, // 200k fixed
      waterBillingType: 'fixed_monthly',
      waterCostPerUnit: 50000,        // 50k per person
      internetBillingType: 'fixed_monthly',
      internetCost: 80000,
      parkingBillingType: 'fixed_monthly',
      parkingCost: 0,
      serviceFeeBillingType: 'fixed_monthly',
      serviceCost: 30000,
    };

    const result = calculateTotalCosts(costs, { peopleCount: 2, vehiclesCount: 1 });
    // Rent: 2.500.000 + Elec: 200.000 + Water: 50.000 * 2 = 100.000 + Net: 80.000 + Parking: 0 + Service: 30.000
    // Total = 2.910.000
    assert.equal(result.monthlyEstimatedTotal, 2910000);
    assert.equal(result.isFullyTransparent, true);
  });
});
