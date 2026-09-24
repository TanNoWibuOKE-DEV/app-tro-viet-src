import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance, clusterPoints } from '../src/geo/distance.js';

describe('Geo Distance and Clustering', () => {
  it('correctly calculates distance between two Da Nang landmarks', () => {
    // ĐH Duy Tân (Nguyễn Du, Hải Châu): 16.0728, 108.2215
    // Cầu Rồng (Bạch Đằng / Trần Hưng Đạo): 16.0611, 108.2272
    const p1 = { latitude: 16.0728, longitude: 108.2215 };
    const p2 = { latitude: 16.0611, longitude: 108.2272 };

    const distance = calculateHaversineDistance(p1, p2);
    // Should be approximately 1.4 - 1.5 km
    assert.ok(distance > 1.2 && distance < 1.7);
  });

  it('clusters nearby listings within given radius', () => {
    const points = [
      { id: '1', latitude: 16.0728, longitude: 108.2215 },
      { id: '2', latitude: 16.0735, longitude: 108.2220 }, // ~100m from 1 -> should cluster
      { id: '3', latitude: 16.0620, longitude: 108.2435 }, // ~3km away (Mỹ Khê) -> separate
    ];

    const clusters = clusterPoints(points, 0.5); // 500m radius
    assert.equal(clusters.length, 2);

    const clusterWithMultiple = clusters.find((c) => 'count' in c && c.count > 1);
    assert.ok(clusterWithMultiple);
    assert.equal(clusterWithMultiple?.items.length, 2);
  });
});
