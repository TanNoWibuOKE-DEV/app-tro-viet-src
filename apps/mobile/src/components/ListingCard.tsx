import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { AnimatedScalePressable } from './AnimatedScalePressable';
import { AnimatedPulseBadge } from './AnimatedPulseBadge';
import { getListingCoverImage } from '../utils/imageAssets';
import { ListingSummary, formatVND, formatArea, SUBSCRIPTION_PLANS, calculateListingTrustScore } from '@troviet/shared';

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
  const { colors, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useApp();
  const favorited = isFavorite(listing.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  const vipPlan =
    listing.vipTier && listing.vipTier !== 'free'
      ? SUBSCRIPTION_PLANS[listing.vipTier]
      : null;

  const isVerified =
    listing.landlordVerificationLevel === 'L2' ||
    listing.landlordVerificationLevel === 'L3';

  const coverImageUrl = getListingCoverImage(listing);
  const trustScore = calculateListingTrustScore(listing);

  // VIP Gradient colors
  const vipGradients: Record<string, [string, string]> = {
    vip_diamond: ['#2563EB', '#7C3AED'],
    vip_silver: ['#059669', '#10B981'],
    vip_bronze: ['#D97706', '#F59E0B'],
  };

  const currentVipGradient =
    vipPlan && listing.vipTier ? vipGradients[listing.vipTier] || ['#4B5563', '#6B7280'] : null;

  // Key amenity icon
  const keyAmenity = listing.amenities?.find((a) =>
    ['private_bathroom', 'air_conditioner', 'mezzanine', 'washing_machine'].includes(a.code)
  );

  return (
    <AnimatedScalePressable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: vipPlan ? vipPlan.color : colors.border,
          borderWidth: vipPlan ? 1.5 : 1,
          shadowColor: isDark ? '#000000' : '#1E293B',
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {/* Photo Container with Real Photography & Gradient Scrim */}
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        <Image
          source={{ uri: coverImageUrl }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {!imageLoaded && (
          <View style={[styles.loadingPlaceholder, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Bottom subtle gradient for high contrast */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={styles.imageScrim}
        />

        {/* Property Type Pill overlay (Bottom Left on image) */}
        <View style={styles.propertyTypeTag}>
          <Text style={styles.propertyTypeText}>
            {PROPERTY_TYPE_NAMES[listing.propertyType] || 'Phòng trọ'}
          </Text>
        </View>

        {/* VIP Gradient Badge (Top Left) */}
        {vipPlan && currentVipGradient && (
          <AnimatedPulseBadge enabled={listing.vipTier === 'vip_diamond'} style={styles.vipBadgeWrapper}>
            <LinearGradient
              colors={currentVipGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.vipBadgeGradient}
            >
              <MaterialCommunityIcons name="diamond-stone" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.vipBadgeText}>{vipPlan.badge}</Text>
            </LinearGradient>
          </AnimatedPulseBadge>
        )}

        {/* Favorite Heart Button (Top Right) */}
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(listing.id);
          }}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={18}
            color={favorited ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {listing.status === 'pending_review' && (
          <View style={[styles.pendingTag, { backgroundColor: colors.warning }]}>
            <Ionicons name="time-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.pendingTagText}>Chờ kiểm duyệt</Text>
          </View>
        )}
      </View>

      {/* Content Info */}
      <View style={styles.content}>
        {/* Price Row: 2.500.000 ₫ / tháng */}
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {formatVND(listing.monthlyRent)}
          </Text>
          <Text style={[styles.periodText, { color: colors.textSecondary }]}>
            / tháng
          </Text>

          {trustScore.score >= 70 && (
            <View style={[styles.trustPill, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' }]}>
              <Ionicons name="sparkles" size={11} color="#059669" style={{ marginRight: 3 }} />
              <Text style={[styles.trustPillText, { color: '#059669' }]}>
                {trustScore.score} điểm
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* Location & Specs Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {listing.wardName}
            </Text>
          </View>

          <Text style={[styles.metaDivider, { color: colors.border }]}>•</Text>

          <View style={styles.metaItem}>
            <Ionicons name="expand-outline" size={13} color={colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatArea(listing.areaSquareMeters)}
            </Text>
          </View>

          {keyAmenity && (
            <>
              <Text style={[styles.metaDivider, { color: colors.border }]}>•</Text>
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle-outline" size={13} color={colors.textSecondary} style={{ marginRight: 3 }} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {keyAmenity.name}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Verified Landlord Badge */}
        {isVerified && (
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedText}>Chủ trọ đã xác minh danh tính L2</Text>
          </View>
        )}
      </View>
    </AnimatedScalePressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingPlaceholder: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
  },
  propertyTypeTag: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  propertyTypeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  vipBadgeWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  vipBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  vipBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pendingTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  periodText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trustPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaDivider: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
});
