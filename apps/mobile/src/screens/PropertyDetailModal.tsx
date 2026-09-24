import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CostCard } from '../components/CostCard';
import { ListingSummary, formatArea, formatVND } from '@troviet/shared';

interface PropertyDetailModalProps {
  listing: ListingSummary;
  onClose: () => void;
  isLoggedIn: boolean;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  listing,
  onClose,
  isLoggedIn,
}) => {
  const { colors } = useTheme();
  const [showPhone, setShowPhone] = useState(false);

  const handleContactPress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Đăng nhập để xem số điện thoại',
        'Để bảo vệ chủ trọ và người tìm trọ khỏi tin giả và tin rác, vui lòng đăng nhập trước khi xem số điện thoại liên hệ.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }
    setShowPhone(true);
  };

  return (
    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          Chi tiết phòng
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Visual Cover Header */}
        <View style={[styles.coverBox, { backgroundColor: colors.border }]}>
          <Text style={{ fontSize: 32 }}>🏡</Text>
          <Text style={[styles.coverSub, { color: colors.textSecondary }]}>
            Hình ảnh thực tế căn phòng [MẪU - DEV]
          </Text>
        </View>

        <View style={styles.contentBody}>
          {/* Header & Badges */}
          <View style={styles.badgeRow}>
            <Badge level={listing.landlordVerificationLevel} />
            <View style={[styles.typePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                📐 {formatArea(listing.areaSquareMeters)}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            {listing.title}
          </Text>

          {/* 2-tier Address Specification */}
          <View style={[styles.addressBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Địa chỉ phòng (Cấu trúc 2 cấp):</Text>
            <Text style={[styles.addressFull, { color: colors.textPrimary }]}>
              Số {listing.houseNumber} {listing.street}, {listing.wardName}, TP. Đà Nẵng
            </Text>
          </View>

          {/* Transparent Cost Card (Strict Core Rule) */}
          <CostCard costs={listing.costs} />

          {/* Amenities Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Tiện nghi & Dịch vụ sẵn có
            </Text>
            <View style={styles.amenitiesGrid}>
              {listing.amenities.map((amenity) => (
                <View
                  key={amenity.id}
                  style={[styles.amenityItem, { backgroundColor: colors.background }]}
                >
                  <Text style={{ color: colors.primary, marginRight: 6 }}>✓</Text>
                  <Text style={[styles.amenityText, { color: colors.textPrimary }]}>
                    {amenity.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Landlord Trust Card */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Thông tin chủ nhà & Độ tin cậy
            </Text>
            <View style={styles.landlordRow}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {listing.landlordName.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.landlordName, { color: colors.textPrimary }]}>
                  {listing.landlordName}
                </Text>
                <Text style={[styles.landlordSub, { color: colors.textSecondary }]}>
                  Trạng thái: {listing.landlordVerificationLevel === 'L2' ? 'Đã xác minh danh tính' : 'Đã xác thực số điện thoại'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={[styles.bottomRentLabel, { color: colors.textSecondary }]}>Tiền phòng tháng:</Text>
          <Text style={[styles.bottomRentValue, { color: colors.primary }]}>
            {formatVND(listing.monthlyRent)}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Button
            title={showPhone ? '📞 0905 123 456' : '💬 Liên hệ chủ trọ'}
            variant="primary"
            onPress={handleContactPress}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverBox: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverSub: {
    marginTop: 8,
    fontSize: 13,
  },
  contentBody: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 12,
  },
  addressBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  addressFull: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  landlordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  landlordName: {
    fontSize: 15,
    fontWeight: '700',
  },
  landlordSub: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomRentLabel: {
    fontSize: 11,
  },
  bottomRentValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
