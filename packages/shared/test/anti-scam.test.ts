import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkListingPricingAnomaly,
  analyzeChatMessageForRisks,
  checkReviewEligibility,
} from '../src/anti-scam/rules.js';

describe('Phase 3 Anti-Scam Rule Engine', () => {
  describe('Listing Pricing Anomaly Checks', () => {
    it('flags room with abnormally low rent (< 1.000.000 VND)', () => {
      const signals = checkListingPricingAnomaly(500000, 'room', 20);
      assert.strictEqual(signals.length, 1);
      assert.strictEqual(signals[0].code, 'PRICE_ABNORMALLY_LOW');
      assert.strictEqual(signals[0].severity, 'high');
    });

    it('passes room with normal market rent (>= 1.000.000 VND)', () => {
      const signals = checkListingPricingAnomaly(2500000, 'room', 20);
      assert.strictEqual(signals.length, 0);
    });

    it('flags apartment with suspiciously low price per m2', () => {
      const signals = checkListingPricingAnomaly(1200000, 'apartment', 50); // 24.000/m2 < 35.000/m2
      assert.ok(signals.some((s) => s.code === 'APARTMENT_PRICE_M2_LOW'));
    });
  });

  describe('Chat Keyword Risk Analysis', () => {
    it('detects deposit scam triggers like "chuyen coc" or "dat coc giu cho"', () => {
      const result1 = analyzeChatMessageForRisks('Em chuyển cọc giữ chỗ trước 500k nhé');
      assert.strictEqual(result1.hasRisk, true);
      assert.ok(result1.detectedKeywords.includes('chuyen coc') || result1.detectedKeywords.includes('coc giu cho'));
      assert.ok(result1.warningMessage?.includes('Tuyệt đối KHÔNG chuyển tiền cọc'));

      const result2 = analyzeChatMessageForRisks('bạn chuyển khoản trước cho mình');
      assert.strictEqual(result2.hasRisk, true);
      assert.ok(result2.detectedKeywords.includes('chuyen khoan truoc'));
    });

    it('detects off-platform redirection to Zalo', () => {
      const result = analyzeChatMessageForRisks('Bạn add Zalo 0901234567 để mình gửi video phòng nha');
      assert.strictEqual(result.hasRisk, true);
      assert.ok(result.detectedKeywords.includes('add zalo'));
    });

    it('passes normal inquiries without risk flags', () => {
      const result = analyzeChatMessageForRisks('Dạ chiều mai 15h em qua xem phòng thực tế được không anh?');
      assert.strictEqual(result.hasRisk, false);
      assert.strictEqual(result.detectedKeywords.length, 0);
      assert.strictEqual(result.warningMessage, undefined);
    });
  });

  describe('Controlled Review Eligibility', () => {
    it('disallows landlord reviewing their own listing', () => {
      const result = checkReviewEligibility('user_landlord_1', 'user_landlord_1', true);
      assert.strictEqual(result.canReview, false);
      assert.ok(result.reason?.includes('Chủ nhà không thể tự đánh giá'));
    });

    it('disallows tenant who never messaged the landlord', () => {
      const result = checkReviewEligibility('user_tenant_2', 'user_landlord_1', false);
      assert.strictEqual(result.canReview, false);
      assert.ok(result.reason?.includes('Chỉ người thuê đã từng liên hệ'));
    });

    it('allows verified tenant who messaged the landlord', () => {
      const result = checkReviewEligibility('user_tenant_2', 'user_landlord_1', true);
      assert.strictEqual(result.canReview, true);
      assert.strictEqual(result.reason, undefined);
    });
  });
});
