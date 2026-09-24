import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createDefaultHandoverRecord,
  validateHandoverRecord,
  STANDARD_HANDOVER_ITEMS,
} from '../src/handover/checklist.js';

describe('Phase 7 Property Handover & Move-in Condition Records', () => {
  it('creates default handover record with standard checklist items', () => {
    const record = createDefaultHandoverRecord({
      id: 'handover-001',
      contractId: 'contract-dn-001',
      listingId: 'listing-danang-01',
      listingTitle: 'Phòng studio view sông Hàn',
      landlordId: 'user-landlord-01',
      landlordName: 'Trần Văn An',
      tenantId: 'user-tenant-01',
      tenantName: 'Nguyễn Minh Khang',
    });

    assert.strictEqual(record.status, 'draft');
    assert.strictEqual(record.initialElectricityMeter, 0);
    assert.strictEqual(record.itemChecklist.length, STANDARD_HANDOVER_ITEMS.length);
    assert.strictEqual(record.itemChecklist[0].condition, 'good');
  });

  it('validates valid handover record successfully', () => {
    const validation = validateHandoverRecord({
      landlordId: 'landlord-1',
      tenantId: 'tenant-1',
      handoverDate: '2026-10-01',
      initialElectricityMeter: 1250,
      initialWaterMeter: 45,
    });

    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  it('catches negative or missing meter readings and missing participants', () => {
    const validation = validateHandoverRecord({
      initialElectricityMeter: -5,
      initialWaterMeter: -1,
    });

    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some((e) => e.includes('đồng hồ điện')));
    assert.ok(validation.errors.some((e) => e.includes('đồng hồ nước')));
    assert.ok(validation.errors.some((e) => e.includes('chủ trọ và người thuê')));
  });
});
