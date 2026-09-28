import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUBSCRIPTION_PLANS,
  createSubscriptionOrder,
  checkSubscriptionActive,
  activateSubscriptionPayment,
  calculateListingRankingScore,
  generatePackagePaymentCode,
} from '../src/monetization/subscriptions';

describe('Phase 11 Landlord VIP Subscriptions & Monetization', () => {
  it('defines 4 standard subscription plans with integer VND prices', () => {
    assert.strictEqual(SUBSCRIPTION_PLANS.free.priceVND, 0);
    assert.strictEqual(SUBSCRIPTION_PLANS.vip_bronze.priceVND, 50000);
    assert.strictEqual(SUBSCRIPTION_PLANS.vip_silver.priceVND, 120000);
    assert.strictEqual(SUBSCRIPTION_PLANS.vip_diamond.priceVND, 250000);

    // Search ranking multiplier order
    assert.ok(
      SUBSCRIPTION_PLANS.vip_diamond.searchRankingMultiplier >
        SUBSCRIPTION_PLANS.vip_silver.searchRankingMultiplier
    );
    assert.ok(
      SUBSCRIPTION_PLANS.vip_silver.searchRankingMultiplier >
        SUBSCRIPTION_PLANS.vip_bronze.searchRankingMultiplier
    );
    assert.ok(
      SUBSCRIPTION_PLANS.vip_bronze.searchRankingMultiplier >
        SUBSCRIPTION_PLANS.free.searchRankingMultiplier
    );
  });

  it('generates a valid package code starting with PKG and 6 digits', () => {
    const code = generatePackagePaymentCode();
    assert.match(code, /^PKG\d{6}$/);
  });

  it('creates a free subscription order and activates immediately', () => {
    const order = createSubscriptionOrder({
      landlordId: 'u-landlord-1',
      listingId: 'l-001',
      listingTitle: 'Phòng trọ đẹp Cầu Giấy',
      tier: 'free',
    });

    assert.strictEqual(order.tier, 'free');
    assert.strictEqual(order.pricePaid, 0);
    assert.strictEqual(order.isActive, true);
    assert.ok(order.activatedAt);
  });

  it('creates a VIP Diamond order requiring payment before activation', () => {
    const order = createSubscriptionOrder({
      landlordId: 'u-landlord-1',
      listingId: 'l-002',
      listingTitle: 'Căn hộ mini ban công Hải Châu Đà Nẵng',
      tier: 'vip_diamond',
    });

    assert.strictEqual(order.tier, 'vip_diamond');
    assert.strictEqual(order.pricePaid, 250000);
    assert.strictEqual(order.isActive, false); // Pending payment
    assert.match(order.packageCode, /^PKG\d{6}$/);

    // Now activate upon payment receipt
    const activated = activateSubscriptionPayment(order);
    assert.strictEqual(activated.isActive, true);
    assert.ok(activated.activatedAt);
  });

  it('accurately evaluates active duration and calculates days remaining', () => {
    const order = createSubscriptionOrder({
      landlordId: 'u-landlord-1',
      listingId: 'l-001',
      listingTitle: 'Phòng trọ đẹp',
      tier: 'vip_silver',
    });
    const activated = activateSubscriptionPayment(order);

    // Same day check
    const check1 = checkSubscriptionActive(activated);
    assert.strictEqual(check1.isActive, true);
    assert.ok(check1.daysRemaining >= 29);

    // 35 days later (expired)
    const thirtyFiveDaysLater = new Date(
      new Date(activated.startsAt).getTime() + 35 * 24 * 3600 * 1000
    );
    const check2 = checkSubscriptionActive(activated, thirtyFiveDaysLater);
    assert.strictEqual(check2.isActive, false);
    assert.strictEqual(check2.daysRemaining, 0);
  });

  it('calculates boosted search ranking scores while respecting trust scores', () => {
    const baseTrustScore = 80;
    const nowIso = new Date().toISOString();

    const scoreFree = calculateListingRankingScore(baseTrustScore, 'free', nowIso);
    const scoreBronze = calculateListingRankingScore(baseTrustScore, 'vip_bronze', nowIso);
    const scoreSilver = calculateListingRankingScore(baseTrustScore, 'vip_silver', nowIso);
    const scoreDiamond = calculateListingRankingScore(baseTrustScore, 'vip_diamond', nowIso);

    assert.ok(scoreDiamond > scoreSilver);
    assert.ok(scoreSilver > scoreBronze);
    assert.ok(scoreBronze > scoreFree);
  });
});
