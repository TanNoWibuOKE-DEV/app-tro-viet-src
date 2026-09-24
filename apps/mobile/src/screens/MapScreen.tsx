import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  DimensionValue,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import {
  ListingSummary,
  formatVND,
  formatArea,
  formatDistance,
  calculateHaversineDistance,
} from '@troviet/shared';

interface Landmark {
  id: string;
  name: string;
  icon: string;
  latitude: number;
  longitude: number;
}

const DA_NANG_LANDMARKS: Landmark[] = [
  { id: 'all', name: 'Toàn Đà Nẵng', icon: '📍', latitude: 16.060, longitude: 108.210 },
  { id: 'duytan', name: 'ĐH Duy Tân', icon: '🎓', latitude: 16.0728, longitude: 108.2215 },
  { id: 'bachkhoa', name: 'ĐH Bách Khoa', icon: '📚', latitude: 16.0760, longitude: 108.1510 },
  { id: 'mykhe', name: 'Biển Mỹ Khê', icon: '🏖️', latitude: 16.0601, longitude: 108.2464 },
  { id: 'caurong', name: 'Cầu Rồng', icon: '🌉', latitude: 16.0611, longitude: 108.2272 },
];

export const MapScreen: React.FC = () => {
  const { colors } = useTheme();
  const { listings, setSelectedListing } = useApp();

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark>(DA_NANG_LANDMARKS[0]);
  const [activePinListing, setActivePinListing] = useState<ListingSummary | null>(null);

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  // Compute distance of each listing to current active landmark
  const listingsWithDistance = useMemo(() => {
    return publishedListings.map((item) => {
      const distanceKm = calculateHaversineDistance(
        { latitude: selectedLandmark.latitude, longitude: selectedLandmark.longitude },
        { latitude: item.latitude, longitude: item.longitude }
      );
      return {
        ...item,
        distanceKm,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [publishedListings, selectedLandmark]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top Landmark Selector */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          🗺️ Bản đồ tìm trọ quanh địa điểm
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.landmarkScroll}>
          {DA_NANG_LANDMARKS.map((lm) => {
            const active = selectedLandmark.id === lm.id;
            return (
              <TouchableOpacity
                key={lm.id}
                style={[
                  styles.landmarkPill,
                  {
                    backgroundColor: active ? colors.primary : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedLandmark(lm);
                  setActivePinListing(null);
                }}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 12 }}>
                  {lm.icon} {lm.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Map Viewport Simulation */}
      <View style={[styles.mapViewport, { backgroundColor: colors.border }]}>
        {/* Map Grid Texture / Background */}
        <View style={styles.gridLayer}>
          <Text style={[styles.mapWatermark, { color: colors.textSecondary }]}>
            Bản đồ khu vực TP. Đà Nẵng
          </Text>
          <Text style={[styles.mapCenterNotice, { color: colors.textSecondary }]}>
            Tâm điểm: {selectedLandmark.icon} {selectedLandmark.name}
          </Text>
        </View>

        {/* Central Landmark Marker */}
        {selectedLandmark.id !== 'all' && (
          <View style={styles.centerLandmarkMarker}>
            <View style={[styles.landmarkMarkerBubble, { backgroundColor: colors.warning }]}>
              <Text style={styles.landmarkMarkerText}>
                {selectedLandmark.icon} {selectedLandmark.name}
              </Text>
            </View>
            <View style={[styles.markerArrow, { borderTopColor: colors.warning }]} />
          </View>
        )}

        {/* Listing Pins positioned across the map area */}
        <View style={styles.pinsContainer}>
          {listingsWithDistance.map((item, index) => {
            const isSelected = activePinListing?.id === item.id;
            // Spread pins realistically based on offsets
            const topPositions: DimensionValue[] = ['20%', '35%', '50%', '65%'];
            const leftPositions: DimensionValue[] = ['18%', '45%', '68%', '32%'];
            const top = topPositions[index % topPositions.length];
            const left = leftPositions[index % leftPositions.length];

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pricePin,
                  {
                    top,
                    left,
                    backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                    borderColor: isSelected ? colors.primary : '#FFFFFF',
                    transform: [{ scale: isSelected ? 1.15 : 1.0 }],
                  },
                ]}
                onPress={() => setActivePinListing(item)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pricePinText,
                    { color: isSelected ? colors.primary : '#FFFFFF' },
                  ]}
                >
                  {(item.monthlyRent / 1000000).toFixed(1).replace('.', ',')} tr
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Floating Quick Preview Card when a pin is selected */}
        {activePinListing && (
          <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.previewTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {activePinListing.title}
                </Text>
                <Text style={[styles.previewAddress, { color: colors.textSecondary }]}>
                  📍 {activePinListing.street}, {activePinListing.wardName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActivePinListing(null)} style={styles.previewCloseBtn}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewStatsRow}>
              <Text style={[styles.previewPrice, { color: colors.primary }]}>
                {formatVND(activePinListing.monthlyRent)}/tháng
              </Text>
              <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                📐 {formatArea(activePinListing.areaSquareMeters)}
              </Text>
              {selectedLandmark.id !== 'all' && (
                <Text style={[styles.previewDistance, { color: colors.textPrimary, backgroundColor: colors.background }]}>
                  Cách {selectedLandmark.name}: <Text style={{ fontWeight: '800' }}>{formatDistance(calculateHaversineDistance({ latitude: selectedLandmark.latitude, longitude: selectedLandmark.longitude }, { latitude: activePinListing.latitude, longitude: activePinListing.longitude }))}</Text>
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.viewDetailBtn, { backgroundColor: colors.primary }]}
              onPress={() => setSelectedListing(activePinListing)}
            >
              <Text style={styles.viewDetailBtnText}>Xem chi tiết phòng & Chi phí →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Listings list sorted by distance to landmark */}
      <View style={[styles.bottomListSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Text style={[styles.bottomListHeading, { color: colors.textPrimary }]}>
          Phòng trọ gần {selectedLandmark.name} nhất:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bottomListScroll}>
          {listingsWithDistance.map((item) => (
            <TouchableOpacity
              key={`h-${item.id}`}
              style={[styles.miniListingCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setSelectedListing(item)}
            >
              <Text style={[styles.miniTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.miniPrice, { color: colors.primary }]}>
                {formatVND(item.monthlyRent)}
              </Text>
              <Text style={[styles.miniDist, { color: colors.textSecondary }]}>
                Cách {formatDistance(item.distanceKm)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  landmarkScroll: {
    gap: 8,
  },
  landmarkPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  mapViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
  },
  mapWatermark: {
    fontSize: 22,
    fontWeight: '800',
  },
  mapCenterNotice: {
    fontSize: 13,
    marginTop: 4,
  },
  centerLandmarkMarker: {
    position: 'absolute',
    top: '30%',
    left: '42%',
    alignItems: 'center',
    zIndex: 10,
  },
  landmarkMarkerBubble: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  landmarkMarkerText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 11,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pinsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pricePin: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  pricePinText: {
    fontSize: 12,
    fontWeight: '800',
  },
  previewCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 20,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewMeta: {
    fontSize: 12,
  },
  previewDistance: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
  },
  viewDetailBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomListSection: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    height: 125,
  },
  bottomListHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  bottomListScroll: {
    gap: 8,
  },
  miniListingCard: {
    width: 170,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  miniPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  miniDist: {
    fontSize: 11,
    marginTop: 2,
  },
});
