"use strict";
/**
 * Trọ Việt - Geographic Calculations & Haversine Distance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHaversineDistance = calculateHaversineDistance;
exports.clusterPoints = clusterPoints;
/**
 * Calculates the great-circle distance between two points on the Earth (in km)
 * using the Haversine formula.
 */
function calculateHaversineDistance(coord1, coord2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.latitude)) *
            Math.cos(toRad(coord2.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}
/**
 * Lightweight clustering for map points within a given radius (in km).
 */
function clusterPoints(items, clusterRadiusKm = 0.8) {
    const clusters = [];
    const assigned = new Set();
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (assigned.has(item.id))
            continue;
        const nearbyItems = [item];
        assigned.add(item.id);
        for (let j = i + 1; j < items.length; j++) {
            const other = items[j];
            if (assigned.has(other.id))
                continue;
            const dist = calculateHaversineDistance({ latitude: item.latitude, longitude: item.longitude }, { latitude: other.latitude, longitude: other.longitude });
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
        }
        else {
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
