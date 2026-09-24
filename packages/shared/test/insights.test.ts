import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getWardAreaInsight,
  getAllAreaInsights,
  DA_NANG_AREA_INSIGHTS,
} from '../src/index.js';

describe('Phase 6 Da Nang Area Insights & Price History Engine', () => {
  it('retrieves detailed area insights for Hai Chau 1 with 6-month price history', () => {
    const insight = getWardAreaInsight('48_HAICHAU1');

    assert.strictEqual(insight.wardCode, '48_HAICHAU1');
    assert.strictEqual(insight.wardName, 'Phường Hải Châu I');
    assert.strictEqual(insight.roomAvgRent, 2700000);
    assert.strictEqual(insight.apartmentAvgRent, 5200000);
    assert.strictEqual(insight.priceHistory.length, 6);
    assert.strictEqual(insight.trend, 'stable');
    assert.ok(insight.highlights.length >= 3);
  });

  it('retrieves increasing trend for coastal Phuoc My (My Khe) ward', () => {
    const insight = getWardAreaInsight('48_PHUOCMY');

    assert.strictEqual(insight.wardName, 'Phường Phước Mỹ');
    assert.strictEqual(insight.trend, 'increasing');
    assert.ok(insight.changePercent > 0);
    assert.ok(insight.summary.includes('Mỹ Khê'));
  });

  it('retrieves student-budget benchmarks for Hoa Khanh Bac ward', () => {
    const insight = getWardAreaInsight('48_HOAKHANHBAC');

    assert.strictEqual(insight.roomAvgRent, 1800000);
    assert.ok(insight.highlights.some((h) => h.includes('Bách Khoa')));
  });

  it('provides all Da Nang ward insights and handles unknown wards gracefully', () => {
    const allInsights = getAllAreaInsights();
    assert.ok(allInsights.length >= 4);

    const unknownInsight = getWardAreaInsight('UNKNOWN_WARD');
    assert.ok(unknownInsight);
    assert.strictEqual(unknownInsight.wardCode, 'UNKNOWN_WARD');
    assert.ok(unknownInsight.roomAvgRent > 0);
  });
});
