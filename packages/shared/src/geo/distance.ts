/**
 * Trọ Việt - Geographic Calculations & Haversine Distance
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth (in km)
 * using the Haversine formula.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

export interface MapCluster<T> {
  id: string;
  center: Coordinates;
  items: T[];
  count: number;
}

/**
 * Lightweight clustering for map points within a given radius (in km).
 */
export function clusterPoints<T extends { latitude: number; longitude: number; id: string }>(
  items: T[],
  clusterRadiusKm = 0.8
): Array<MapCluster<T> | T> {
  const clusters: Array<MapCluster<T>> = [];
  const assigned = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (assigned.has(item.id)) continue;

    const nearbyItems: T[] = [item];
    assigned.add(item.id);

    for (let j = i + 1; j < items.length; j++) {
      const other = items[j];
      if (assigned.has(other.id)) continue;

      const dist = calculateHaversineDistance(
        { latitude: item.latitude, longitude: item.longitude },
        { latitude: other.latitude, longitude: other.longitude }
      );

      if (dist <= clusterRadiusKm) {
        nearbyItems.push(other);
        assigned.add(other.id);
      }
    }

    if (nearbyItems.length > 1) {
      // Calculate cluster centroid
      const avgLat = nearbyItems.reduce((acc, curr) => acc + curr.latitude, 0) / nearbyItems.length;
      const avgLon = nearbyItems.reduce((acc, curr) => acc + curr.longitude, 0) / nearbyItems.length;

      clusters.push({
        id: `cluster-${item.id}`,
        center: { latitude: avgLat, longitude: avgLon },
        items: nearbyItems,
        count: nearbyItems.length,
      });
    } else {
      // Single item (no cluster)
      clusters.push({
        id: item.id,
        center: { latitude: item.latitude, longitude: item.longitude },
        items: [item],
        count: 1,
      });
    }
  }

  return clusters;
}
