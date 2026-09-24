import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  redactContractPII,
  analyzeContractTerms,
  generateContractText,
  LEGAL_DISCLAIMER,
  LeaseContractData,
} from '../src/index.js';

describe('Phase 6 Lease Contract Template & AI Analysis', () => {
  const sampleContract: LeaseContractData = {
    id: 'c-001',
    contractNumber: 'HD-2026-001',
    listingId: 'l-001',
    landlord: {
      fullName: 'Nguyễn Thị Lan',
      phoneNumber: '0905666777',
      idCardNumber: '048185001234',
    },
    tenant: {
      fullName: 'Nguyễn Văn An',
      phoneNumber: '0905123456',
      idCardNumber: '048199009876',
    },
    propertyAddress: {
      houseNumber: '12/4',
      street: 'Lê Duẩn',
      wardName: 'Phường Hải Châu I',
      wardCode: '48_HAICHAU1',
      provinceName: 'TP. Đà Nẵng',
      provinceCode: '48',
    },
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    monthlyRent: 2500000,
    depositAmount: 2500000,
    paymentDayOfMonth: 5,
    utilities: {
      electricityBillingType: 'meter',
      electricityPricePerUnit: 3500,
      waterBillingType: 'meter',
      waterPricePerUnit: 15000,
      internetPriceMonthly: 100000,
    },
    status: 'active',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-24T10:00:00Z',
  };

  it('redacts CCCD, phone numbers, and bank account numbers from contract text', () => {
    const rawText = `Hợp đồng giữa Nguyễn Thị Lan (CCCD: 048185001234, SĐT: 0905666777) và Nguyễn Văn An (CCCD: 048199009876, SĐT: 0905123456). STK: 19034567891234 tại Techcombank.`;
    const redacted = redactContractPII(rawText);

    assert.ok(!redacted.includes('048185001234'));
    assert.ok(!redacted.includes('048199009876'));
    assert.ok(!redacted.includes('0905666777'));
    assert.ok(!redacted.includes('0905123456'));
    assert.ok(!redacted.includes('19034567891234'));
    assert.ok(redacted.includes('[CCCD ĐÃ CHE]'));
    assert.ok(redacted.includes('[SĐT ĐÃ CHE]'));
    assert.ok(redacted.includes('[STK ĐÃ CHE]'));
  });

  it('generates standard Vietnamese lease contract with 2-tier address and formatted currency', () => {
    const text = generateContractText(sampleContract);

    assert.ok(text.includes('HỢP ĐỒNG THUÊ PHÒNG TRỌ'));
    assert.ok(text.includes('Số 12/4 Lê Duẩn, Phường Hải Châu I, TP. Đà Nẵng'));
    assert.ok(text.includes('2.500.000 đ/tháng'));
    assert.ok(text.includes('3.500 đ/kWh'));
    assert.ok(text.includes('15.000 đ/m³'));
  });

  it('evaluates fair standard contract with high fairness score (>= 80)', () => {
    const text = generateContractText(sampleContract);
    const result = analyzeContractTerms(text);

    assert.ok(result.fairnessScore >= 80);
    assert.strictEqual(result.status, 'safe');
    assert.ok(result.statusLabel.includes('An toàn'));
    assert.strictEqual(result.disclaimer, LEGAL_DISCLAIMER);
    assert.ok(result.findings.some((f) => f.type === 'fair'));
  });

  it('detects deposit forfeiture trap and unilateral price hike clauses as high risk', () => {
    const predatoryContract = `
      HỢP ĐỒNG THUÊ NHÀ
      Điều 5: Nếu bên thuê chuyển đi trước hạn thì mất toàn bộ tiền cọc trong mọi trường hợp.
      Điều 6: Bên cho thuê có quyền tăng giá phòng bất kỳ lúc nào mà không cần sự đồng ý của bên B.
      Điều 7: Bên thuê muốn trả phòng phải báo trước 60 ngày.
    `;

    const result = analyzeContractTerms(predatoryContract);

    assert.ok(result.fairnessScore < 60, `Score ${result.fairnessScore} should be < 60`);
    assert.strictEqual(result.status, 'high_risk');
    assert.ok(result.statusLabel.includes('rủi ro cao'));

    // Check specific risk detections
    const trapFinding = result.findings.find((f) => f.title.includes('Bẫy mất'));
    assert.ok(trapFinding);
    assert.strictEqual(trapFinding.type, 'risk');

    const priceFinding = result.findings.find((f) => f.title.includes('tăng giá'));
    assert.ok(priceFinding);
    assert.strictEqual(priceFinding.type, 'risk');

    const noticeFinding = result.findings.find((f) => f.title.includes('60-90 ngày'));
    assert.ok(noticeFinding);
    assert.strictEqual(noticeFinding.type, 'warning');
  });
});
