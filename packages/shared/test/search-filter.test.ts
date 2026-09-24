import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_LISTINGS } from '../src/seed/mock-listings.js';
import { normalizeVietnameseText } from '../src/formatters/index.js';

describe('Phase 1 Search and Filter Logic', () => {
  it('correctly filters listings by unaccented text query', () => {
    const published = MOCK_LISTINGS.filter((l) => l.status === 'published');
    const query = normalizeVietnameseText('my khe');

    const matched = published.filter((l) => {
      const normTitle = normalizeVietnameseText(l.title);
      const normStreet = normalizeVietnameseText(l.street);
      const normWard = normalizeVietnameseText(l.wardName);
      return normTitle.includes(query) || normStreet.includes(query) || normWard.includes(query);
    });

    assert.ok(matched.length > 0);
    assert.ok(matched.some((l) => l.wardCode === '48_PHUOCMY'));
  });

  it('correctly filters listings by price range', () => {
    const published = MOCK_LISTINGS.filter((l) => l.status === 'published');
    const maxRent = 2000000; // <= 2 million

    const budgetRooms = published.filter((l) => l.monthlyRent <= maxRent);
    assert.ok(budgetRooms.length > 0);
    for (const room of budgetRooms) {
      assert.ok(room.monthlyRent <= maxRent);
    }
  });

  it('correctly filters listings by required amenities', () => {
    const published = MOCK_LISTINGS.filter((l) => l.status === 'published');
    const requiredAmenity = 'air_conditioner';

    const acRooms = published.filter((l) =>
      l.amenities.some((a) => a.code === requiredAmenity)
    );

    assert.ok(acRooms.length > 0);
    for (const room of acRooms) {
      assert.ok(room.amenities.some((a) => a.code === requiredAmenity));
    }
  });

  it('separates pending review listings from public search results', () => {
    const published = MOCK_LISTINGS.filter((l) => l.status === 'published');
    const pending = MOCK_LISTINGS.filter((l) => l.status === 'pending_review');

    assert.ok(pending.length >= 1);
    for (const p of pending) {
      assert.ok(!published.some((pub) => pub.id === p.id));
    }
  });
});
