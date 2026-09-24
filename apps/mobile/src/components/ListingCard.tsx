import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Badge } from './Badge';
import { ListingSummary, formatVND, formatArea } from '@troviet/shared';

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

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      {/* Top Banner / Image Placeholder */}
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
        <Text style={[styles.imageText, { color: colors.textSecondary }]}>
          🏠 {PROPERTY_TYPE_NAMES[listing.propertyType] || 'Phòng'}
        </Text>
        {listing.status === 'pending_review' && (
          <View style={[styles.pendingBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.pendingText}>⏳ Chờ kiểm duyệt</Text>
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {/* Verification & Type */}
        <View style={styles.topRow}>
          <Text style={[styles.propertyTypeTag, { color: colors.primary }]}>
            {PROPERTY_TYPE_NAMES[listing.propertyType] || 'Phòng trọ'}
          </Text>
          <Badge level={listing.landlordVerificationLevel} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* 2-tier Address */}
        <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
          📍 {listing.street}, {listing.wardName}
        </Text>

        {/* Price & Area Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              {formatVND(listing.monthlyRent)}
            </Text>
            <Text style={[styles.periodText, { color: colors.textSecondary }]}>/tháng</Text>
          </View>
          <View style={[styles.areaPill, { backgroundColor: colors.background }]}>
            <Text style={[styles.areaText, { color: colors.textSecondary }]}>
              📐 {formatArea(listing.areaSquareMeters)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 8,
  },
  imagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  propertyTypeTag: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
  },
  periodText: {
    fontSize: 12,
    marginLeft: 3,
  },
  areaPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
