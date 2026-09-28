import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMovingCost,
  recommendVehicle,
  createServiceRequest,
  VEHICLE_SPECS,
  STAIR_FLOOR_SURCHARGE_VND,
} from '../src/services/moving-calculator';

describe('Tenant Life Hub - Moving Calculator Engine', () => {
  it('calculates base distance cost accurately for ba gác within 4km', () => {
    const result = calculateMovingCost({
      distanceKm: 3.5,
      vehicleType: 'ba_gac',
      floorPickup: 1,
      hasElevatorPickup: true,
      floorDropoff: 1,
      hasElevatorDropoff: true,
      includePorter: false,
    });

    assert.equal(result.distanceCost, 150000);
    assert.equal(result.totalStairsSurcharge, 0);
    assert.equal(result.porterCost, 0);
    assert.equal(result.totalCostVnd, 150000);
    assert.ok(result.notes.some((n) => n.includes('Cự ly trong gói cơ bản')));
  });

  it('calculates extra distance cost correctly for truck 750kg over 4km', () => {
    const result = calculateMovingCost({
      distanceKm: 9.2, // 4km base + 6km extra = 250,000 + 6 * 22,000 = 382,000
      vehicleType: 'truck_small_750kg',
      floorPickup: 1,
      hasElevatorPickup: true,
      floorDropoff: 1,
      hasElevatorDropoff: true,
      includePorter: false,
    });

    const expectedExtraKm = Math.ceil(9.2 - 4); // 6 km
    const expectedDistanceCost = 250000 + expectedExtraKm * 22000;
    assert.equal(result.distanceCost, expectedDistanceCost);
    assert.equal(result.totalCostVnd, expectedDistanceCost);
  });

  it('applies floor stair surcharges when buildings lack elevators', () => {
    const result = calculateMovingCost({
      distanceKm: 3.0,
      vehicleType: 'ba_gac',
      floorPickup: 3, // floor 3 -> 2 floors to carry = 2 * 50,000 = 100,000
      hasElevatorPickup: false,
      floorDropoff: 4, // floor 4 -> 3 floors to carry = 3 * 50,000 = 150,000
      hasElevatorDropoff: false,
      includePorter: false,
    });

    assert.equal(result.stairsSurchargePickup, 100000);
    assert.equal(result.stairsSurchargeDropoff, 150000);
    assert.equal(result.totalStairsSurcharge, 250000);
    assert.equal(result.totalCostVnd, 150000 + 250000);
  });

  it('does not apply stair surcharge if floor is > 1 but elevator is available', () => {
    const result = calculateMovingCost({
      distanceKm: 2.0,
      vehicleType: 'truck_large_1250kg',
      floorPickup: 15,
      hasElevatorPickup: true,
      floorDropoff: 8,
      hasElevatorDropoff: true,
      includePorter: false,
    });

    assert.equal(result.stairsSurchargePickup, 0);
    assert.equal(result.stairsSurchargeDropoff, 0);
    assert.equal(result.totalStairsSurcharge, 0);
    assert.equal(result.totalCostVnd, 380000);
  });

  it('adds porter fee and special bulky items surcharge', () => {
    const result = calculateMovingCost({
      distanceKm: 4.0,
      vehicleType: 'truck_small_750kg', // base 250k, porter 150k
      includePorter: true,
      specialItemIds: ['large_fridge', 'washing_machine'], // 100k + 80k = 180k
    });

    assert.equal(result.distanceCost, 250000);
    assert.equal(result.porterCost, 150000);
    assert.equal(result.specialItemsCost, 180000);
    assert.equal(result.totalCostVnd, 250000 + 150000 + 180000);
    assert.equal(result.specialItemsBreakdown.length, 2);
  });

  it('recommends appropriate vehicle based on alley and room conditions', () => {
    // Narrow alley forces ba gác
    assert.equal(
      recommendVehicle({ roomAreaSqm: 40, hasLargeAppliances: true, isInNarrowAlley: true }),
      'ba_gac'
    );

    // Large room with heavy appliances -> 1.25t truck
    assert.equal(
      recommendVehicle({ roomAreaSqm: 36, hasLargeAppliances: true, isInNarrowAlley: false }),
      'truck_large_1250kg'
    );

    // Standard student room -> 750kg truck
    assert.equal(
      recommendVehicle({ roomAreaSqm: 22, hasLargeAppliances: true, isInNarrowAlley: false }),
      'truck_small_750kg'
    );

    // Small studio / room without big appliances -> ba gác
    assert.equal(
      recommendVehicle({ roomAreaSqm: 15, hasLargeAppliances: false, isInNarrowAlley: false }),
      'ba_gac'
    );
  });

  it('creates valid service request booking object', () => {
    const request = createServiceRequest({
      tenantId: 'user-1234-tenant',
      serviceType: 'moving',
      pickupAddress: '123 Hải Phòng, Thạch Thang, Đà Nẵng',
      destinationAddress: '456 Ngô Quyền, An Hải Bắc, Đà Nẵng',
      scheduledDate: '2026-10-01T08:00:00.000Z',
      estimatedCost: 450000,
      details: { vehicleType: 'ba_gac', distanceKm: 5 },
    });

    assert.ok(request.requestCode.startsWith('SRV'));
    assert.equal(request.serviceType, 'moving');
    assert.equal(request.status, 'pending');
    assert.equal(request.estimatedCost, 450000);
    assert.equal(request.tenantId, 'user-1234-tenant');
  });
});
