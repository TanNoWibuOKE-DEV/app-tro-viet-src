import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingSummary, formatVND, formatArea, SUBSCRIPTION_PLANS } from '@troviet/shared';

interface ListingCardProps {
  listing: ListingSummary;
  onPress: () => void;
}

const PROPERTY_TYPE_NAMES: Record<string, string> = {
  room: 'Phòng trọ',
  apartment: 'Căn hộ mini',
  house: 'Nhà nguyên căn',
  shared: 'Ở ghép',
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onPress }) => {
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useApp();
  const favorited = isFavorite(listing.id);

  const vipPlan =
    listing.vipTier && listing.vipTier !== 'free'
      ? SUBSCRIPTION_PLANS[listing.vipTier]
      : null;

  const isVerified =
    listing.landlordVerificationLevel === 'L2' ||
    listing.landlordVerificationLevel === 'L3';

  // Get a key amenity highlight (e.g. WC riêng, Máy lạnh, Gác lửng)
  const keyAmenity = listing.amenities?.find((a) =>
    ['private_bathroom', 'air_conditioner', 'mezzanine', 'washing_machine'].includes(a.code)
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: vipPlan ? vipPlan.color : colors.border,
          borderWidth: vipPlan ? 1.5 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
    >
      {/* Room Image Container */}
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        <View style={styles.imageOverlayContent}>
          <Text style={{ fontSize: 32 }}>🏡</Text>
          <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
            {PROPERTY_TYPE_NAMES[listing.propertyType] || 'Phòng trọ'}
          </Text>
        </View>

        {/* VIP Badge (Top Left) */}
        {vipPlan && (
          <View style={[styles.vipBadge, { backgroundColor: vipPlan.color }]}>
            <Text style={styles.vipBadgeText}>
              {vipPlan.badgeIcon} {vipPlan.badge}
            </Text>
          </View>
        )}

        {/* Favorite Heart Button (Top Right) */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(listing.id);
          }}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>{favorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {listing.status === 'pending_review' && (
          <View style={[styles.pendingTag, { backgroundColor: colors.warning }]}>
            <Text style={styles.pendingTagText}>⏳ Chờ kiểm duyệt</Text>
          </View>
        )}
      </View>

      {/* Clean Info Container */}
      <View style={styles.content}>
        {/* Price Row: 2.500.000 ₫ / tháng */}
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {formatVND(listing.monthlyRent)}
          </Text>
          <Text style={[styles.periodText, { color: colors.textSecondary }]}>
            / tháng
          </Text>
        </View>

        {/* Type & Area: Phòng trọ · 25 m² */}
        <Text style={[styles.subInfo, { color: colors.textPrimary }]}>
          {PROPERTY_TYPE_NAMES[listing.propertyType] || 'Phòng trọ'} · {formatArea(listing.areaSquareMeters)}
        </Text>

        {/* Location: Hải Châu · TP. Đà Nẵng */}
        <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
          📍 {listing.wardName} · {listing.street}
        </Text>

        {/* Badges Row: ✓ Đã xác minh | ✓ WC riêng */}
        <View style={styles.chipsRow}>
          {isVerified && (
            <View style={[styles.verifiedChip, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
              <Text style={styles.verifiedChipText}>✓ Đã xác minh</Text>
            </View>
          )}

          {keyAmenity && (
            <View style={[styles.amenityChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.amenityChipText, { color: colors.textSecondary }]}>
                ✓ {keyAmenity.name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageOverlayContent: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  vipBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  vipBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pendingTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingTagText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 19,
    fontWeight: '800',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  subInfo: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  verifiedChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  verifiedChipText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  amenityChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
