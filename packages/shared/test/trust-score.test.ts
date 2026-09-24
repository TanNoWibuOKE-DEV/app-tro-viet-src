import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateListingTrustScore,
  detectDuplicateListing,
  ListingSummary,
  Review,
} from '../src/index.js';
import { MOCK_LISTINGS } from '../src/seed/mock-listings.js';

describe('Phase 5 Explainable Trust Score & Duplicate Detection', () => {
  it('calculates very high trust score for verified L2/L3 landlord with full transparent costs', () => {
    const listing = MOCK_LISTINGS[0]; // l-001 has L2, published, full transparent costs
    const sampleReviews: Review[] = [
      {
        id: 'r-1',
        listingId: listing.id,
        tenantId: 'u-t1',
        tenantName: 'Mai',
        rating: 5,
        content: 'Phòng sạch, cô chủ tốt',
        status: 'approved',
        createdAt: '2026-09-20T00:00:00Z',
        updatedAt: '2026-09-20T00:00:00Z',
      },
    ];

    const result = calculateListingTrustScore(listing, { reviews: sampleReviews });

    assert.ok(result.score >= 85, `Score ${result.score} should be >= 85`);
    assert.strictEqual(result.level, 'very_high');
    assert.ok(result.levelLabel.includes('Rất tin cậy'));
    assert.ok(result.factors.some((f) => f.factor === 'VERIFICATION_L2'));
    assert.ok(result.factors.some((f) => f.factor === 'COST_FULL_TRANSPARENCY'));
  });

  it('penalizes price anomaly and unprovided costs gracefully', () => {
    const suspiciousListing: ListingSummary = {
      ...MOCK_LISTINGS[0],
      id: 'l-suspicious',
      monthlyRent: 500000, // < 1M VND anomaly
      landlordVerificationLevel: 'none',
      costs: {
        ...MOCK_LISTINGS[0].costs,
        electricityBillingType: 'unprovided',
        waterBillingType: 'unprovided',
      },
    };

    const result = calculateListingTrustScore(suspiciousListing);

    assert.ok(result.score < 50, `Score ${result.score} should be low`);
    assert.strictEqual(result.level, 'needs_verification');
    assert.ok(result.factors.some((f) => f.factor === 'PRICE_ANOMALY_PENALTY'));
    assert.ok(result.summary.includes('Có một số thông tin cần kiểm tra thêm'));
  });

  it('detects duplicate listing with matching 2-tier address, area and price', () => {
    const existing = MOCK_LISTINGS[0]; // 124/6 Nguyễn Du, Phường Hải Châu I

    const duplicateCandidate = {
      id: 'l-clone',
      wardCode: existing.wardCode,
      street: 'nguyen du',
      houseNumber: '124/6',
      areaSquareMeters: existing.areaSquareMeters,
      monthlyRent: existing.monthlyRent,
      landlordId: 'u-other-scammer',
    };

    const dupResult = detectDuplicateListing(duplicateCandidate, MOCK_LISTINGS);

    assert.strictEqual(dupResult.isDuplicate, true);
    assert.strictEqual(dupResult.matchedListingId, existing.id);
    assert.ok(dupResult.confidence >= 0.9);
  });

  it('does not flag distinct rooms in the same building as duplicates', () => {
    const existing = MOCK_LISTINGS[0];

    const differentRoomInSameHouse = {
      id: 'l-room2',
      wardCode: existing.wardCode,
      street: existing.street,
      houseNumber: existing.houseNumber,
      areaSquareMeters: 45, // very different area
      monthlyRent: 4500000, // very different price
      landlordId: existing.landlordId,
    };

    const result = detectDuplicateListing(differentRoomInSameHouse, MOCK_LISTINGS);
    assert.strictEqual(result.isDuplicate, false);
  });
});
