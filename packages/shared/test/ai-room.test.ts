import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeRoomListing,
  STANDARD_VIEWING_CHECKLIST,
  ListingSummary,
} from '../src/index.js';
import { MOCK_LISTINGS } from '../src/seed/mock-listings.js';

describe('Phase 5 AI Room Insights & Viewing Checklist', () => {
  it('analyzes listing and compares against ward baseline accurately', () => {
    // Hai Chau 1 baseline for room is 2,700,000.
    // l-001 has rent 2,500,000 -> diff = -200,000 -> -7%
    const listing = MOCK_LISTINGS[0];
    const analysis = analyzeRoomListing(listing);

    assert.ok(analysis.summary.includes(listing.wardName));
    assert.strictEqual(analysis.priceAssessment.comparisonPercent, -7);
    assert.ok(analysis.priceAssessment.label.includes('Rẻ hơn'));
    assert.ok(analysis.transparencyAssessment.isFullyTransparent);
    assert.strictEqual(analysis.transparencyAssessment.missingCosts.length, 0);
    assert.ok(analysis.keyAdvantages.length > 0);
    assert.ok(analysis.viewingAdvice.length > 0);
  });

  it('detects unprovided costs and provides safe advice', () => {
    const listingWithMissingCosts: ListingSummary = {
      ...MOCK_LISTINGS[0],
      costs: {
        ...MOCK_LISTINGS[0].costs,
        electricityBillingType: 'unprovided',
        waterBillingType: 'unprovided',
      },
    };

    const analysis = analyzeRoomListing(listingWithMissingCosts);

    assert.strictEqual(analysis.transparencyAssessment.isFullyTransparent, false);
    assert.ok(analysis.transparencyAssessment.missingCosts.includes('Tiền điện'));
    assert.ok(analysis.transparencyAssessment.missingCosts.includes('Tiền nước'));
    assert.ok(
      analysis.viewingAdvice.some((a) =>
        a.includes('Chủ nhà chưa công bố Tiền điện, Tiền nước trên tin đăng')
      )
    );
  });

  it('analyzes apartment with higher price correctly', () => {
    const apartmentListing: ListingSummary = {
      ...MOCK_LISTINGS[1], // apartment in Phuoc My
      propertyType: 'apartment',
      monthlyRent: 6500000, // baseline is 5,000,000 -> +30%
    };

    const analysis = analyzeRoomListing(apartmentListing);

    assert.ok(analysis.priceAssessment.comparisonPercent >= 15);
    assert.ok(analysis.priceAssessment.label.includes('Cao hơn'));
  });

  it('provides a complete standard viewing checklist of 10 practical items', () => {
    assert.strictEqual(STANDARD_VIEWING_CHECKLIST.length, 10);

    const categories = new Set(STANDARD_VIEWING_CHECKLIST.map((item) => item.category));
    assert.ok(categories.has('utilities'));
    assert.ok(categories.has('room_condition'));
    assert.ok(categories.has('security_building'));
    assert.ok(categories.has('legal_contract'));

    const criticalItems = STANDARD_VIEWING_CHECKLIST.filter((i) => i.importance === 'critical');
    assert.ok(criticalItems.length >= 4);

    // Verify key safety checkpoints
    assert.ok(STANDARD_VIEWING_CHECKLIST.some((i) => i.title.includes('công tơ điện')));
    assert.ok(STANDARD_VIEWING_CHECKLIST.some((i) => i.title.includes('CCCD chủ trọ')));
  });
});
