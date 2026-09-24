import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasRequiredConsents,
  createDefaultConsentRecord,
  exportUserDataAsJson,
  anonymizeUserProfile,
  anonymizeUserReviews,
  UserProfile,
  Review,
} from '../src/index.js';

describe('Phase 4 Privacy & Personal Data Protection (Law 91/2025/QH15)', () => {
  const sampleUser: UserProfile = {
    id: 'u-user-123',
    fullName: 'Trần Văn Nam',
    email: 'nam.tran@example.com',
    phoneNumber: '0905111222',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'tenant',
    verificationLevel: 'L1',
    createdAt: '2026-09-01T00:00:00Z',
  };

  describe('User Consent Verification', () => {
    it('verifies that mandatory consents are required', () => {
      const emptyRecord = createDefaultConsentRecord('u-test');
      assert.strictEqual(hasRequiredConsents(emptyRecord), true);

      // Disable mandatory service operation
      const revoked = {
        ...emptyRecord,
        consents: { ...emptyRecord.consents, service_operation: false },
      };
      assert.strictEqual(hasRequiredConsents(revoked), false);
    });

    it('creates consent record with optional marketing choices', () => {
      const defaultRecord = createDefaultConsentRecord('u-test', false);
      assert.strictEqual(defaultRecord.consents.marketing_notifications, false);

      const optedInRecord = createDefaultConsentRecord('u-test', true);
      assert.strictEqual(optedInRecord.consents.marketing_notifications, true);
    });
  });

  describe('Data Portability Export', () => {
    it('exports complete user data bundle compliant with legal transparency', () => {
      const jsonStr = exportUserDataAsJson(sampleUser, {
        favoriteListingIds: ['l-001', 'l-002'],
        preferences: {
          userId: sampleUser.id,
          preferredPropertyTypes: ['room'],
          minPrice: 1500000,
          maxPrice: 3500000,
        },
      });

      const parsed = JSON.parse(jsonStr);
      assert.strictEqual(parsed.userProfile.id, sampleUser.id);
      assert.strictEqual(parsed.userProfile.fullName, sampleUser.fullName);
      assert.ok(parsed.exportMetadata.lawReference.includes('91/2025/QH15'));
      assert.strictEqual(parsed.favoriteListingIds.length, 2);
    });
  });

  describe('Right to Erasure & Anonymization', () => {
    it('strips all PII from user profile upon account erasure request', () => {
      const anonymized = anonymizeUserProfile(sampleUser);
      assert.strictEqual(anonymized.fullName, 'Người dùng đã xóa tài khoản');
      assert.strictEqual(anonymized.email, null);
      assert.strictEqual(anonymized.phoneNumber, null);
      assert.strictEqual(anonymized.avatarUrl, null);
      assert.strictEqual(anonymized.verificationLevel, 'none');
    });

    it('anonymizes tenant names on existing community reviews', () => {
      const reviews: Review[] = [
        {
          id: 'r-1',
          listingId: 'l-001',
          tenantId: 'u-user-123',
          tenantName: 'Trần Văn Nam',
          rating: 5,
          content: 'Phòng rất tốt',
          status: 'approved',
          createdAt: '2026-09-10T00:00:00Z',
          updatedAt: '2026-09-10T00:00:00Z',
        },
        {
          id: 'r-2',
          listingId: 'l-002',
          tenantId: 'u-other-456',
          tenantName: 'Lê Mai',
          rating: 4,
          content: 'Phòng sạch',
          status: 'approved',
          createdAt: '2026-09-12T00:00:00Z',
          updatedAt: '2026-09-12T00:00:00Z',
        },
      ];

      const cleaned = anonymizeUserReviews('u-user-123', reviews);
      assert.ok(cleaned[0].tenantName.includes('Người dùng ẩn danh'));
      assert.strictEqual(cleaned[0].content, 'Phòng rất tốt'); // content preserved
      assert.strictEqual(cleaned[1].tenantName, 'Lê Mai'); // other user unaffected
    });
  });
});
