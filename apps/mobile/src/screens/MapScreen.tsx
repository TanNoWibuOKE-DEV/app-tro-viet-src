import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import {
  ListingSummary,
  formatVND,
  formatArea,
  calculateHaversineDistance,
} from '@troviet/shared';

interface Landmark {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const DA_NANG_LANDMARKS: Landmark[] = [
  { id: 'all', name: '📍 Toàn Đà Nẵng', latitude: 16.060, longitude: 108.210 },
  { id: 'duytan', name: '🎓 ĐH Duy Tân', latitude: 16.0728, longitude: 108.2215 },
  { id: 'bachkhoa', name: '📚 ĐH Bách Khoa', latitude: 16.0760, longitude: 108.1510 },
  { id: 'mykhe', name: '🏖️ Biển Mỹ Khê', latitude: 16.0601, longitude: 108.2464 },
  { id: 'caurong', name: '🌉 Cầu Rồng', latitude: 16.0611, longitude: 108.2272 },
];

export const MapScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { listings, setSelectedListing } = useApp();

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark>(DA_NANG_LANDMARKS[0]);
  const [activePinListing, setActivePinListing] = useState<ListingSummary | null>(null);

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  // Compute distance of each listing to current active landmark
  const listingsWithDistance = useMemo(() => {
    return publishedListings
      .map((item) => {
        const distanceKm = calculateHaversineDistance(
          { latitude: selectedLandmark.latitude, longitude: selectedLandmark.longitude },
          { latitude: item.latitude, longitude: item.longitude }
        );
        return {
          ...item,
          distanceKm,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [publishedListings, selectedLandmark]);

  const activeListing = activePinListing || listingsWithDistance[0] || null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top Header / Landmark Selector */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Bản đồ phòng trọ Đà Nẵng
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
                <Text
                  style={{
                    color: active ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {lm.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Map Viewport Simulation */}
      <View style={[styles.mapViewport, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        {/* Map Grid Texture / Background */}
        <View style={styles.gridLayer}>
          <Text style={[styles.mapWatermark, { color: colors.textSecondary }]}>
            BẢN ĐỒ TỌA ĐỘ TRỌ VIỆT · TP. ĐÀ NẴNG
          </Text>
        </View>

        {/* Center Landmark Target Pin */}
        <View style={styles.centerTarget}>
          <View style={styles.landmarkIconBox}>
            <Text style={{ fontSize: 24 }}>📍</Text>
          </View>
          <View style={[styles.landmarkLabel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.landmarkLabelText, { color: colors.textPrimary }]}>
              {selectedLandmark.name}
            </Text>
          </View>
        </View>

        {/* Interactive Floating Property Price Pins (Section 14) */}
        {listingsWithDistance.slice(0, 6).map((item, index) => {
          const isSelected = activeListing?.id === item.id;
          const rentInMillions = (item.monthlyRent / 1000000).toFixed(1).replace('.0', '');

          // Disperse pins mathematically around center for simulation
          const angle = (index * 2 * Math.PI) / 6;
          const radius = 90 + (index % 2) * 40;
          const pinTop = 190 + Math.sin(angle) * radius;
          const pinLeft = 140 + Math.cos(angle) * radius;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.pricePin,
                {
                  top: pinTop,
                  left: pinLeft,
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? '#FFFFFF' : colors.primary,
                  transform: [{ scale: isSelected ? 1.1 : 1.0 }],
                  zIndex: isSelected ? 10 : 2,
                },
              ]}
              onPress={() => setActivePinListing(item)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pricePinText,
                  { color: isSelected ? '#FFFFFF' : colors.primary },
                ]}
              >
                {rentInMillions}tr
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Property Preview Card at Bottom (Section 14) */}
      {activeListing && (
        <View style={[styles.bottomCardWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.previewRow}>
            {/* Thumbnail */}
            <View style={[styles.previewThumb, { backgroundColor: colors.border }]}>
              <Text style={{ fontSize: 26 }}>🏡</Text>
            </View>

            {/* Info */}
            <View style={styles.previewInfo}>
              <View style={styles.previewPriceRow}>
                <Text style={[styles.previewPrice, { color: colors.primary }]}>
                  {formatVND(activeListing.monthlyRent)}
                </Text>
                <Text style={[styles.previewPeriod, { color: colors.textSecondary }]}>/tháng</Text>
              </View>

              <Text style={[styles.previewTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {activeListing.title}
              </Text>

              <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                {formatArea(activeListing.areaSquareMeters)} · {activeListing.wardName}
              </Text>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.detailActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setSelectedListing(activeListing)}
          >
            <Text style={styles.detailActionBtnText}>Xem chi tiết phòng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
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
    opacity: 0.15,
  },
  mapWatermark: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  centerTarget: {
    position: 'absolute',
    top: 170,
    left: '38%',
    alignItems: 'center',
    zIndex: 5,
  },
  landmarkIconBox: {
    marginBottom: 2,
  },
  landmarkLabel: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  landmarkLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pricePin: {
    position: 'absolute',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pricePinText: {
    fontSize: 12,
    fontWeight: '800',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 76,
    left: 16,
    right: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewPeriod: {
    fontSize: 11,
    marginLeft: 3,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewMeta: {
    fontSize: 12,
  },
  detailActionBtn: {
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  detailActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
