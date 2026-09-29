import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useResponsiveLayout } from '../utils/responsive';
import { ListingSummary, formatVND } from '@troviet/shared';

interface LandlordProfileModalProps {
  visible: boolean;
  onClose: () => void;
  landlordName?: string;
  onSelectListing?: (listingId: string) => void;
  onStartChat?: () => void;
}

export const LandlordProfileModal: React.FC<LandlordProfileModalProps> = ({
  visible,
  onClose,
  landlordName = 'Anh Minh',
  onSelectListing,
  onStartChat,
}) => {
  const { colors, isDark } = useTheme();
  const { insets, contentMaxWidth } = useResponsiveLayout();

  const handleCall = () => {
    Alert.alert('Gọi cho chủ trọ', `Kết nối cuộc gọi đến chủ nhà ${landlordName}: 0908.123.456?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gọi ngay',
        onPress: () => {
          Linking.openURL('tel:0908123456').catch(() => {
            Alert.alert('Thông báo', 'Không thể khởi động ứng dụng gọi điện.');
          });
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
                paddingTop: insets.top,
                height: 54 + insets.top,
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.headerBtn} accessibilityLabel="Quay lại">
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Chi Tiết Phòng
            </Text>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Chia sẻ">
                <Ionicons name="share-social-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Yêu thích">
                <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={[styles.headerAvatar, { backgroundColor: '#E2E8F0' }]}>
                <Ionicons name="person" size={14} color="#64748B" />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Profile Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                  }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
                <View style={styles.avatarVerifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nameRow}>
                <Text style={[styles.nameText, { color: colors.textPrimary }]}>
                  {landlordName}
                </Text>
                <Ionicons name="checkmark-circle" size={17} color="#085F56" style={{ marginLeft: 4 }} />
              </View>

              <View style={styles.verifiedTagRow}>
                <Ionicons name="shield-checkmark" size={12} color="#085F56" style={{ marginRight: 4 }} />
                <Text style={styles.verifiedTagText}>
                  Chủ nhà đã xác minh CCCD & GPKD
                </Text>
              </View>

              <View style={styles.responseRow}>
                <View style={styles.greenDot} />
                <Text style={styles.responseText}>
                  Phản hồi ~10 phút • Tỷ lệ 99%
                </Text>
              </View>
            </View>

            {/* 4 Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Ionicons name="star" size={15} color="#F59E0B" style={{ marginRight: 4 }} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>4.9</Text>
                  <Text style={[styles.statUnit, { color: colors.textSecondary }]}>/5</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>38 đánh giá</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Ionicons name="business" size={15} color="#085F56" style={{ marginRight: 4 }} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>12</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Phòng cho thuê</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Ionicons name="shield-checkmark" size={15} color="#0284C7" style={{ marginRight: 4 }} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>2 năm</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cùng TrọViet</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Ionicons name="lock-closed" size={15} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>100%</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cọc minh bạch</Text>
              </View>
            </View>

            {/* Giới thiệu chủ trọ */}
            <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.bioTitleRow}>
                <Ionicons name="home-outline" size={16} color="#085F56" style={{ marginRight: 6 }} />
                <Text style={[styles.bioTitle, { color: colors.textPrimary }]}>
                  Giới thiệu chủ trọ
                </Text>
              </View>
              <Text style={[styles.bioContent, { color: colors.textPrimary }]}>
                Chào các bạn sinh viên và người đi làm! Mình quản lý dãy trọ An Nhiên tại Quận 7 và KTX Nhà Bè. Luôn ưu tiên an ninh, phòng ốc sạch sẽ, giờ giấc tự do và hỗ trợ sửa chữa sự cố nhanh chóng trong ngày.
              </Text>
              <View style={styles.tagChipsRow}>
                <View style={styles.tagChip}>
                  <Ionicons name="time-outline" size={12} color="#085F56" style={{ marginRight: 4 }} />
                  <Text style={styles.tagChipText}>Giờ giấc tự do</Text>
                </View>
                <View style={styles.tagChip}>
                  <Ionicons name="key-outline" size={12} color="#085F56" style={{ marginRight: 4 }} />
                  <Text style={styles.tagChipText}>Khóa vân tay 24/7</Text>
                </View>
                <View style={styles.tagChip}>
                  <Ionicons name="construct-outline" size={12} color="#085F56" style={{ marginRight: 4 }} />
                  <Text style={styles.tagChipText}>Sửa chữa trong ngày</Text>
                </View>
              </View>
            </View>

            {/* Người thuê nói gì */}
            <View style={styles.reviewsSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Người thuê nói gì
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>38</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text style={styles.seeAllLink}>Xem tất cả &gt;</Text>
                </TouchableOpacity>
              </View>

              {/* Review 1 */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#0284C7' }}>Y</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>
                      Bạn Hoàng Yến
                    </Text>
                    <Text style={[styles.reviewerRole, { color: colors.textSecondary }]}>
                      SV ĐH Tôn Đức Thắng
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 2 }} />
                    <Text style={styles.ratingText}>5.0</Text>
                  </View>
                </View>
                <Text style={[styles.reviewBody, { color: colors.textPrimary }]}>
                  "Anh Minh rất nhiệt tình, hôm máy giặt bị kẹt nước anh qua sửa ngay trong 30 phút. Khu trọ an ninh, yên tĩnh học bài."
                </Text>
                <Text style={[styles.reviewFooter, { color: colors.textSecondary }]}>
                  Phòng trọ An Nhiên Q.7 • 1 tuần trước
                </Text>
              </View>

              {/* Review 2 */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#085F56' }}>T</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>
                      Bạn Quốc Tuấn
                    </Text>
                    <Text style={[styles.reviewerRole, { color: colors.textSecondary }]}>
                      Kỹ sư phần mềm
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 2 }} />
                    <Text style={styles.ratingText}>5.0</Text>
                  </View>
                </View>
                <Text style={[styles.reviewBody, { color: colors.textPrimary }]}>
                  "Hợp đồng và tiền điện nước rất rõ ràng trên app TrọViet, không phát sinh chi phí ngoài dự kiến."
                </Text>
                <Text style={[styles.reviewFooter, { color: colors.textSecondary }]}>
                  Studio gác lửng Lê Văn Lương • 1 tháng trước
                </Text>
              </View>
            </View>

            {/* Phòng đang cho thuê */}
            <View style={styles.listingsSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      Phòng đang cho thuê
                    </Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>2 phòng</Text>
                    </View>
                  </View>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Dãy phòng do {landlordName} trực tiếp quản lý
                  </Text>
                </View>
              </View>

              {/* Room 1 */}
              <View style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.roomImageWrap}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
                    }}
                    style={styles.roomImage}
                    resizeMode="cover"
                  />
                  <View style={styles.roomStatusTagGreen}>
                    <View style={styles.greenDot} />
                    <Text style={styles.roomStatusTextGreen}>Phòng trống vào ở ngay</Text>
                  </View>
                  <View style={styles.roomVerifiedTagDark}>
                    <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.roomVerifiedTextDark}>Đã xác thực</Text>
                  </View>
                </View>

                <View style={styles.roomContent}>
                  <Text style={[styles.roomTitle, { color: colors.textPrimary }]}>
                    Studio ban công Nguyễn Văn Linh
                  </Text>
                  <View style={styles.roomAddressRow}>
                    <Ionicons name="location-outline" size={12} color={colors.textSecondary} style={{ marginRight: 3 }} />
                    <Text style={[styles.roomAddressText, { color: colors.textSecondary }]}>
                      Nguyễn Văn Linh, Phường Tân Phong, Quận 7
                    </Text>
                  </View>
                  <View style={styles.roomFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={[styles.roomPrice, { color: '#085F56' }]}>3.500.000</Text>
                      <Text style={[styles.roomPeriod, { color: colors.textSecondary }]}> đ/tháng</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewRoomBtn}
                      onPress={() => onSelectListing?.('room-1')}
                    >
                      <Text style={styles.viewRoomBtnText}>Xem phòng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Room 2 */}
              <View style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.roomImageWrap}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
                    }}
                    style={styles.roomImage}
                    resizeMode="cover"
                  />
                  <View style={styles.roomStatusTagOrange}>
                    <View style={[styles.greenDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.roomStatusTextOrange}>Đang có khách giữ cọc</Text>
                  </View>
                  <View style={styles.roomVerifiedTagDark}>
                    <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.roomVerifiedTextDark}>Đã xác thực</Text>
                  </View>
                </View>

                <View style={styles.roomContent}>
                  <Text style={[styles.roomTitle, { color: colors.textPrimary }]}>
                    Gác lửng cao Lê Văn Lương
                  </Text>
                  <View style={styles.roomAddressRow}>
                    <Ionicons name="location-outline" size={12} color={colors.textSecondary} style={{ marginRight: 3 }} />
                    <Text style={[styles.roomAddressText, { color: colors.textSecondary }]}>
                      Lê Văn Lương, Xã Phước Kiển, Nhà Bè
                    </Text>
                  </View>
                  <View style={styles.roomFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={[styles.roomPrice, { color: '#085F56' }]}>3.800.000</Text>
                      <Text style={[styles.roomPeriod, { color: colors.textSecondary }]}> đ/tháng</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewRoomBtn}
                      onPress={() => onSelectListing?.('room-2')}
                    >
                      <Text style={styles.viewRoomBtnText}>Xem phòng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Cam kết bảo vệ cọc */}
            <View style={[styles.guaranteeCard, { backgroundColor: isDark ? '#064E3B' : '#E6F4F1' }]}>
              <View style={styles.guaranteeIconCircle}>
                <Ionicons name="shield-checkmark" size={20} color="#085F56" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.guaranteeTitle}>Cam kết TrọViet Bảo Vệ Cọc</Text>
                <Text style={styles.guaranteeText}>
                  Hoàn cọc 100% nếu phòng không đúng hình ảnh hoặc chủ nhà vi phạm thỏa thuận.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View
            style={[
              styles.bottomActionBar,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Math.max(14, insets.bottom),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.chatActionBtn}
              onPress={onStartChat}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles-outline" size={17} color="#0284C7" style={{ marginRight: 6 }} />
              <Text style={styles.chatActionBtnText}>Nhắn tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callActionBtn}
              onPress={handleCall}
              activeOpacity={0.88}
            >
              <Ionicons name="call" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.callActionBtnText}>Gọi điện thoại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  heroCard: {
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#085F56',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#085F56',
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  responseText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  bioCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  bioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bioContent: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  reviewsSection: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#085F56',
  },
  reviewCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewerRole: {
    fontSize: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  reviewBody: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  reviewFooter: {
    fontSize: 10,
  },
  listingsSection: {
    marginBottom: 16,
  },
  roomCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  roomImageWrap: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomStatusTagGreen: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomStatusTextGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  roomStatusTagOrange: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomStatusTextOrange: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  roomVerifiedTagDark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomVerifiedTextDark: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roomContent: {
    padding: 12,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  roomAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomAddressText: {
    fontSize: 11,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  roomPeriod: {
    fontSize: 11,
  },
  viewRoomBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewRoomBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  guaranteeCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  guaranteeIconCircle: {
    marginTop: 2,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#085F56',
    marginBottom: 3,
  },
  guaranteeText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#064E46',
  },
  bottomActionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  chatActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatActionBtnText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '800',
  },
  callActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#085F56',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#085F56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  callActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
