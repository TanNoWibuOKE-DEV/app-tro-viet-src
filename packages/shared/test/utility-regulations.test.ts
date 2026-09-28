import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEvnResidentialElectricity,
  assessUtilityRate,
  generateDisputeLetter,
  MANDATORY_LEGAL_DISCLAIMER,
  EVN_RESIDENTIAL_TIERS,
} from '../src/legal/utility-regulations';

describe('Legal Concierge - Utility Regulations & Dispute Engine', () => {
  it('calculates official EVN 6-tier electricity bill accurately for single quota (150 kWh)', () => {
    const bill = calculateEvnResidentialElectricity(150, 1);

    // 50 kWh @ 1893 = 94,650
    // 50 kWh @ 1956 = 97,800
    // 50 kWh @ 2271 = 113,550
    // Subtotal = 306,000
    // 8% VAT = 24,480
    // Total = 330,480
    assert.equal(bill.totalKwh, 150);
    assert.equal(bill.quotaCount, 1);
    assert.equal(bill.subtotalWithoutVat, 306000);
    assert.equal(bill.vatAmount, 24480);
    assert.equal(bill.totalCostVnd, 330480);
    assert.equal(bill.averageRatePerKwh, Math.round(330480 / 150));
    assert.equal(bill.tierBreakdown[0].kwh, 50);
    assert.equal(bill.tierBreakdown[1].kwh, 50);
    assert.equal(bill.tierBreakdown[2].kwh, 50);
    assert.equal(bill.tierBreakdown[3].kwh, 0);
  });

  it('multiplies quota for households with multiple tenants according to state policy', () => {
    // 8 tenants -> 2 quotas (each tier size doubled: Tier 1 is 100 kWh, Tier 2 is 100 kWh)
    const bill = calculateEvnResidentialElectricity(150, 8);

    assert.equal(bill.quotaCount, 2);
    assert.equal(bill.tierBreakdown[0].kwh, 100); // 100 kWh in Tier 1
    assert.equal(bill.tierBreakdown[1].kwh, 50);  // 50 kWh in Tier 2
    assert.equal(bill.tierBreakdown[2].kwh, 0);   // None in Tier 3

    // 100 * 1893 + 50 * 1956 = 189,300 + 97,800 = 287,100
    assert.equal(bill.subtotalWithoutVat, 287100);
    assert.ok(bill.totalCostVnd < 330480, 'Multi-quota bill should be significantly cheaper');
  });

  it('correctly assesses electricity rates against statutory thresholds', () => {
    // Fair rate
    const fairAssessment = assessUtilityRate('electricity', 2800);
    assert.equal(fairAssessment.riskSeverity, 'fair');
    assert.equal(fairAssessment.isOvercharged, false);

    // Elevated rate
    const elevatedAssessment = assessUtilityRate('electricity', 3800);
    assert.equal(elevatedAssessment.riskSeverity, 'elevated');
    assert.equal(elevatedAssessment.isOvercharged, true);

    // Excessive illegal rate (> 4,000 VND/kWh)
    const illegalAssessment = assessUtilityRate('electricity', 4500);
    assert.equal(illegalAssessment.riskSeverity, 'excessive_illegal');
    assert.equal(illegalAssessment.isOvercharged, true);
    assert.ok(illegalAssessment.penaltyNotice.includes('20.000.000 ₫ đến 30.000.000 ₫'));
    assert.ok(illegalAssessment.penaltyNotice.includes('Nghị định 17/2022/NĐ-CP'));
  });

  it('correctly assesses municipal water rates against standard thresholds', () => {
    const fairWater = assessUtilityRate('water', 18000);
    assert.equal(fairWater.riskSeverity, 'fair');
    assert.equal(fairWater.isOvercharged, false);

    const illegalWater = assessUtilityRate('water', 40000);
    assert.equal(illegalWater.riskSeverity, 'excessive_illegal');
    assert.equal(illegalWater.isOvercharged, true);
  });

  it('generates a formal dispute letter for electricity overcharging with official decree citation', () => {
    const letter = generateDisputeLetter({
      disputeType: 'electricity_overcharge',
      tenantName: 'Nguyễn Văn An',
      tenantPhone: '0905123456',
      landlordName: 'Trần Thị Mai',
      roomAddress: 'Phòng 203, 120 Hải Phòng, Thạch Thang, Đà Nẵng',
      billedRate: 4500,
      actualUsage: 120,
      excessAmountClaimed: 240000,
      deadlineDays: 5,
    });

    assert.ok(letter.disputeCode.startsWith('DISP'));
    assert.ok(letter.title.includes('TIỀN ĐIỆN'));
    assert.ok(letter.letterContent.includes('Trần Thị Mai'));
    assert.ok(letter.letterContent.includes('4.500 ₫/kWh'));
    assert.ok(letter.letterContent.includes('Thông tư 09/2023/TT-BCT'));
    assert.ok(letter.letterContent.includes('Nghị định 17/2022/NĐ-CP'));
    assert.ok(letter.letterContent.includes('20.000.000 ₫ đến 30.000.000 ₫'));
    assert.equal(letter.disclaimer, MANDATORY_LEGAL_DISCLAIMER);
  });

  it('generates a formal deposit refund request letter citing Civil Code 2015', () => {
    const letter = generateDisputeLetter({
      disputeType: 'deposit_refund',
      tenantName: 'Lê Hoàng Nam',
      tenantPhone: '0912345678',
      landlordName: 'Phạm Đức Dũng',
      roomAddress: 'Căn hộ 4B, 88 Ngô Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng',
      depositAmount: 3000000,
      handoverDate: '25/09/2026',
      deadlineDays: 3,
    });

    assert.ok(letter.title.includes('HOÀN TRẢ TIỀN ĐẶT CỌC'));
    assert.ok(letter.letterContent.includes('Phạm Đức Dũng'));
    assert.ok(letter.letterContent.includes('3.000.000 ₫'));
    assert.ok(letter.letterContent.includes('Điều 328 Bộ luật Dân sự 2015'));
    assert.ok(letter.letterContent.includes('3 ngày'));
  });
});
