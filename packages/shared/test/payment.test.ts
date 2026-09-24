import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateVietQRLink,
  calculateMonthlyInvoice,
  POPULAR_VIETNAMESE_BANKS,
} from '../src/index.js';

describe('Phase 6 VietQR NAPAS Payment & Rent Invoicing Engine', () => {
  it('generates standard VietQR NAPAS 24/7 link with sanitized integer amount', () => {
    const qrResult = generateVietQRLink({
      bankBin: POPULAR_VIETNAMESE_BANKS.VCB.bin,
      bankName: POPULAR_VIETNAMESE_BANKS.VCB.shortName,
      accountNumber: '0071001234567',
      accountName: 'Nguyen Thi Lan',
      amount: 2850000,
      description: 'TROVIET HD20261001',
    });

    assert.ok(qrResult.qrImageUrl.includes('970436-0071001234567-compact2.png'));
    assert.ok(qrResult.qrImageUrl.includes('amount=2850000'));
    assert.ok(qrResult.qrImageUrl.includes('accountName=NGUYEN%20THI%20LAN'));
    assert.ok(qrResult.qrImageUrl.includes('addInfo=TROVIET%20HD20261001'));
    assert.strictEqual(qrResult.sanitizedAmount, 2850000);
    assert.strictEqual(qrResult.transferSyntax, 'TROVIET HD20261001');
  });

  it('calculates monthly rent invoice accurately with metered electricity and water', () => {
    // Room rent: 2,500,000
    // Electricity: 1245 -> 1320 = 75 kWh * 3,500 = 262,500
    // Water: 52 -> 56 = 4 m3 * 15,000 = 60,000
    // Internet: 100,000
    // Parking: 50,000
    // Service: 30,000
    // Total = 2,500,000 + 262,500 + 60,000 + 100,000 + 50,000 + 30,000 = 3,002,500
    const invoice = calculateMonthlyInvoice({
      contractId: 'c-001',
      invoiceCode: 'INV-2026-10',
      periodMonth: '10/2026',
      monthlyRent: 2500000,
      electricityBillingType: 'meter',
      previousElectricityMeter: 1245,
      currentElectricityMeter: 1320,
      electricityCostPerUnit: 3500,
      waterBillingType: 'meter',
      previousWaterMeter: 52,
      currentWaterMeter: 56,
      waterCostPerUnit: 15000,
      internetCost: 100000,
      parkingCost: 50000,
      serviceCost: 30000,
    });

    assert.strictEqual(invoice.invoiceCode, 'INV-2026-10');
    assert.strictEqual(invoice.electricityUsageKwh, 75);
    assert.strictEqual(invoice.waterUsageM3, 4);
    assert.strictEqual(invoice.totalAmount, 3002500);

    const rentItem = invoice.lineItems.find((i) => i.id === 'room-rent');
    assert.strictEqual(rentItem?.amount, 2500000);

    const elecItem = invoice.lineItems.find((i) => i.id === 'electricity');
    assert.strictEqual(elecItem?.amount, 262500);
    assert.ok(elecItem?.detail.includes('75 kWh'));

    const waterItem = invoice.lineItems.find((i) => i.id === 'water');
    assert.strictEqual(waterItem?.amount, 60000);
  });

  it('calculates fixed monthly utilities accurately without meter readings', () => {
    const invoice = calculateMonthlyInvoice({
      contractId: 'c-002',
      invoiceCode: 'INV-2026-11',
      periodMonth: '11/2026',
      monthlyRent: 3000000,
      electricityBillingType: 'fixed',
      electricityCostPerUnit: 200000, // fixed 200k/month
      waterBillingType: 'fixed',
      waterCostPerUnit: 50000, // 50k per person
      numberOfTenants: 2, // 2 tenants -> 100k
    });

    assert.strictEqual(invoice.totalAmount, 3000000 + 200000 + 100000);
    const waterItem = invoice.lineItems.find((i) => i.id === 'water');
    assert.strictEqual(waterItem?.amount, 100000);
    assert.ok(waterItem?.detail.includes('2 người'));
  });
});
