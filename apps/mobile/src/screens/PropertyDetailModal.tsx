import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { ReportModal } from '../components/ReportModal';
import { ChatRoomModal } from './ChatRoomModal';
import { ViewingChecklistModal } from './ViewingChecklistModal';
import { LandlordVerificationModal } from './LandlordVerificationModal';
import { InteractiveCostCalculatorModal } from '../components/InteractiveCostCalculatorModal';
import { DepositEscrowModal } from './DepositEscrowModal';
import { FloodRiskMapModal } from './FloodRiskMapModal';
import {
  ListingSummary,
  formatArea,
  formatVND,
  calculateTotalCosts,
  DEFAULT_CONSUMPTION,
  checkListingPricingAnomaly,
  calculateListingTrustScore,
  assessPropertyFloodRisk,
  Review,
} from '@troviet/shared';

interface PropertyDetailModalProps {
  listing: ListingSummary;
  onClose: () => void;
  isLoggedIn: boolean;
}

const PROPERTY_TYPE_NAMES: Record<string, string> = {
  room: 'Phòng trọ',
  apartment: 'Căn hộ mini',
  house: 'Nhà nguyên căn',
  shared: 'Ở ghép',
};

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  listing,
  onClose,
  isLoggedIn,
}) => {
  const { colors, isDark } = useTheme();
  const {
    openChatWithLandlord,
    reviews,
    submitReview,
    canUserReviewListing,
    isFavorite,
    toggleFavorite,
  } = useApp();

  const favorited = isFavorite(listing.id);

  // Modals state
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isCostCalculatorOpen, setIsCostCalculatorOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isTrustFactorsOpen, setIsTrustFactorsOpen] = useState(false);
  const [isDepositEscrowOpen, setIsDepositEscrowOpen] = useState(false);
  const [isFloodMapOpen, setIsFloodMapOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Anti-scam price anomaly detection
  const priceSignals = checkListingPricingAnomaly(
    listing.monthlyRent,
    listing.propertyType,
    listing.areaSquareMeters
  );

  // Filter approved reviews for this listing
  const listingReviews = reviews.filter(
    (r) => r.listingId === listing.id && r.status === 'approved'
  );

  // Trust Score
  const trustScore = calculateListingTrustScore(listing, { reviews: listingReviews });

  // Baseline cost breakdown
  const baselineCost = calculateTotalCosts(listing.costs, DEFAULT_CONSUMPTION);

  // Flood Risk Assessment (Phase 13)
  const cityCode = listing.provinceCode === '01' ? 'hanoi' : listing.provinceCode === '79' ? 'hcm' : 'danang';
  const floodRisk = assessPropertyFloodRisk({
    latitude: listing.latitude,
    longitude: listing.longitude,
    street: listing.street,
    cityCode,
    floorNumber: 1,
  });

  const avgRating =
    listingReviews.length > 0
      ? (
          listingReviews.reduce((sum, r) => sum + r.rating, 0) /
          listingReviews.length
        ).toFixed(1)
      : null;

  const isVerified =
    listing.landlordVerificationLevel === 'L2' ||
    listing.landlordVerificationLevel === 'L3';

  const handleStartChat = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Đăng nhập để nhắn tin',
        'Vui lòng đăng nhập để bắt đầu cuộc trò chuyện an toàn với chủ trọ.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }
    const convId = openChatWithLandlord(listing);
    setActiveChatConvId(convId);
  };

  const handleOpenWriteReview = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Đăng nhập để đánh giá',
        'Vui lòng đăng nhập trước khi gửi đánh giá phòng trọ.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }

    const eligibility = canUserReviewListing(listing);
    if (!eligibility.canReview) {
      Alert.alert(
        'Quy định đánh giá Trọ Việt',
        eligibility.reason ||
          'Chỉ người thuê đã từng liên hệ nhắn tin trao đổi với chủ trọ mới được gửi đánh giá phòng. Quy định này nhằm chống đánh giá ảo.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }

    setIsWriteReviewOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      Alert.alert('Chưa nhập nội dung', 'Vui lòng chia sẻ cảm nhận thực tế về phòng trọ.');
      return;
    }

    const res = submitReview(listing.id, reviewRating, reviewComment);
    if (res.success) {
      setIsWriteReviewOpen(false);
      setReviewComment('');
      Alert.alert('Thành công', 'Đánh giá của bạn đã được ghi nhận và hiển thị công khai.');
    } else {
      Alert.alert('Không thể gửi đánh giá', res.reason || 'Có lỗi xảy ra.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* 1. Large Gallery Header with Back (←) and Heart (♡) Overlay (Section 16) */}
      <View style={[styles.galleryBox, { backgroundColor: colors.border }]}>
        <View style={styles.galleryInner}>
          <Text style={{ fontSize: 48 }}>🏡</Text>
          <Text style={[styles.galleryPlaceholderText, { color: colors.textSecondary }]}>
            Hình ảnh thực tế căn phòng
          </Text>
        </View>

        {/* Top Overlay Buttons */}
        <View style={styles.topOverlayRow}>
          <TouchableOpacity
            style={styles.overlayIconBtn}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 18, color: '#111827' }}>←</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.overlayIconBtn}
              onPress={() => toggleFavorite(listing.id)}
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 18 }}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overlayIconBtn}
              onPress={() => setIsReportOpen(true)}
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 14 }}>🚩</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Anti-Scam Alert if pricing anomaly detected */}
        {priceSignals.length > 0 && (
          <View style={[styles.scamBanner, { backgroundColor: isDark ? '#3d1414' : '#fff5f5', borderColor: colors.error }]}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.scamTitle, { color: colors.error }]}>
                {priceSignals[0].title}
              </Text>
              <Text style={[styles.scamDesc, { color: isDark ? '#ffc9c9' : '#c92a2a' }]}>
                {priceSignals[0].description}
              </Text>
            </View>
          </View>
        )}

        {/* 2. Property Summary (Section 17) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.mainRent, { color: colors.primary }]}>
              {formatVND(listing.monthlyRent)}
            </Text>
            <Text style={[styles.mainRentPeriod, { color: colors.textSecondary }]}>/ tháng</Text>
          </View>

          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            {listing.title}
          </Text>

          {/* Quick Specifications */}
          <View style={styles.specsRow}>
            <View style={[styles.specPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.specText, { color: colors.textPrimary }]}>
                🏠 {PROPERTY_TYPE_NAMES[listing.propertyType] || 'Phòng trọ'}
              </Text>
            </View>
            <View style={[styles.specPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.specText, { color: colors.textPrimary }]}>
                📐 {formatArea(listing.areaSquareMeters)}
              </Text>
            </View>
            <View style={[styles.specPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.specText, { color: colors.textPrimary }]}>
                🚪 1 phòng
              </Text>
            </View>
          </View>

          {/* Verification Badge */}
          {isVerified && (
            <View style={[styles.verifiedStatusBox, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
              <Text style={styles.verifiedStatusText}>
                ✓ Đã xác minh an toàn bởi Trọ Việt
              </Text>
            </View>
          )}
        </View>

        {/* 3. Amenities Section (Section 15) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Tiện nghi & Dịch vụ sẵn có
          </Text>
          <View style={styles.amenitiesGrid}>
            {listing.amenities.map((amenity) => (
              <View
                key={amenity.id}
                style={[styles.amenityChip, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.primary, marginRight: 6, fontWeight: '700' }}>✓</Text>
                <Text style={[styles.amenityChipText, { color: colors.textPrimary }]}>
                  {amenity.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Cost Module (Section 18 & 19) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Chi phí hàng tháng
            </Text>
            <Text style={[styles.costSub, { color: colors.textSecondary }]}>
              (Ước tính tiêu chuẩn 1 người)
            </Text>
          </View>

          {/* Table Breakdown */}
          <View style={[styles.costTable, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textPrimary }]}>Tiền phòng</Text>
              <Text style={[styles.costValue, { color: colors.textPrimary }]}>
                {formatVND(listing.monthlyRent)}
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Điện</Text>
              <Text style={[styles.costValue, { color: colors.textSecondary }]}>
                {listing.costs.electricityCostPerUnit
                  ? `${listing.costs.electricityCostPerUnit.toLocaleString('vi-VN')} đ/kWh`
                  : 'Chưa có'}
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Nước</Text>
              <Text style={[styles.costValue, { color: colors.textSecondary }]}>
                {listing.costs.waterCostPerUnit
                  ? `${listing.costs.waterCostPerUnit.toLocaleString('vi-VN')} đ/người hoặc khối`
                  : 'Chưa có'}
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Internet</Text>
              <Text style={[styles.costValue, { color: colors.textSecondary }]}>
                {listing.costs.internetCost
                  ? `${listing.costs.internetCost.toLocaleString('vi-VN')} ₫/tháng`
                  : 'Miễn phí'}
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Gửi xe</Text>
              <Text style={[styles.costValue, { color: colors.textSecondary }]}>
                {listing.costs.parkingCost
                  ? `${listing.costs.parkingCost.toLocaleString('vi-VN')} ₫/tháng`
                  : 'Miễn phí'}
              </Text>
            </View>

            <View style={[styles.costTotalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.costTotalLabel, { color: colors.textPrimary }]}>
                Tổng dự kiến:
              </Text>
              <Text style={[styles.costTotalValue, { color: colors.primary }]}>
                {formatVND(baselineCost.monthlyEstimatedTotal)}
              </Text>
            </View>
          </View>

          {/* Button: Tính chi phí của tôi (Section 18) */}
          <TouchableOpacity
            style={[styles.calcTriggerBtn, { borderColor: colors.primary }]}
            onPress={() => setIsCostCalculatorOpen(true)}
          >
            <Text style={[styles.calcTriggerText, { color: colors.primary }]}>
              🧮 Tính chi phí của tôi
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Location Section (Section 15) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Vị trí phòng trọ
          </Text>
          <Text style={[styles.locationAddress, { color: colors.textPrimary }]}>
            Số {listing.houseNumber} {listing.street}, {listing.wardName}, TP. Đà Nẵng
          </Text>
          <View style={[styles.miniMapPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={{ fontSize: 24 }}>📍</Text>
            <Text style={[styles.miniMapText, { color: colors.textSecondary }]}>
              Tọa độ: {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* 5b. Flood Safety & Monsoon Risk Section (Phase 13) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              🌊 An toàn ngập lụt mùa mưa
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor:
                  floodRisk.safetyLevel === 'high_risk'
                    ? isDark ? '#450A0A' : '#FEE2E2'
                    : floodRisk.safetyLevel === 'moderate_risk'
                    ? isDark ? '#451A03' : '#FEF3C7'
                    : isDark ? '#064E3B' : '#DCFCE7',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color:
                    floodRisk.safetyLevel === 'high_risk'
                      ? '#DC2626'
                      : floodRisk.safetyLevel === 'moderate_risk'
                      ? '#D97706'
                      : '#16A34A',
                }}
              >
                {floodRisk.safetyScore}/100 • {floodRisk.safetyLevel === 'high_risk' ? 'Rủi ro ngập' : floodRisk.safetyLevel === 'moderate_risk' ? 'Cần lưu ý' : 'Cao ráo an toàn'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 }}>
            {floodRisk.advisoryMessage}
          </Text>

          <TouchableOpacity
            style={[styles.calcTriggerBtn, { borderColor: colors.primary }]}
            onPress={() => setIsFloodMapOpen(true)}
          >
            <Text style={[styles.calcTriggerText, { color: colors.primary }]}>
              🗺️ Xem bản đồ cảnh báo ngập lụt
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. Landlord Module (Section 20) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Chủ nhà & Xác thực
          </Text>

          <View style={styles.landlordRow}>
            <View style={[styles.landlordAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.landlordAvatarText}>
                {listing.landlordName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.landlordName, { color: colors.textPrimary }]}>
                {listing.landlordName}
              </Text>
              <Text style={[styles.landlordStatus, { color: colors.textSecondary }]}>
                {isVerified ? '✓ Chủ trọ đã xác minh' : 'Đã xác thực SĐT'}
              </Text>
            </View>
          </View>

          {/* Button: Xem thông tin xác minh (Section 20) */}
          <TouchableOpacity
            style={[styles.verifyTriggerBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setIsVerificationModalOpen(true)}
          >
            <Text style={[styles.verifyTriggerText, { color: colors.primary }]}>
              🛡️ Xem thông tin xác minh →
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. Trust Score & Anti-Scam (Section 15) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.trustScoreHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 2 }]}>
                Độ tin cậy Trọ Việt
              </Text>
              <Text style={[styles.trustSub, { color: colors.textSecondary }]}>
                Đánh giá khách quan dựa trên dữ liệu minh bạch
              </Text>
            </View>
            <View style={[styles.trustPill, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
              <Text style={styles.trustScoreValue}>{trustScore.score}/100</Text>
              <Text style={styles.trustScoreLevel}>{trustScore.levelLabel}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.trustToggle}
            onPress={() => setIsTrustFactorsOpen(!isTrustFactorsOpen)}
          >
            <Text style={[styles.trustToggleText, { color: colors.primary }]}>
              {isTrustFactorsOpen ? '▲ Thu gọn tiêu chí' : '▼ Xem chi tiết các tiêu chí chấm điểm'}
            </Text>
          </TouchableOpacity>

          {isTrustFactorsOpen && (
            <View style={styles.trustFactorsWrap}>
              {trustScore.factors.map((f, idx) => (
                <View key={idx} style={[styles.trustFactorRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.trustFactorPoints, { color: f.points >= 0 ? colors.success : colors.error }]}>
                    {f.points >= 0 ? `+${f.points}` : `${f.points}`}
                  </Text>
                  <Text style={[styles.trustFactorDesc, { color: colors.textPrimary }]}>
                    {f.description}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 8. Controlled Reviews Section (Section 15) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.reviewHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 2 }]}>
                Đánh giá từ người thuê
              </Text>
              <Text style={[styles.reviewSub, { color: colors.textSecondary }]}>
                {avgRating
                  ? `⭐ ${avgRating} / 5 (${listingReviews.length} đánh giá đã kiểm thực)`
                  : 'Chưa có đánh giá nào'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.writeReviewBtn, { borderColor: colors.primary }]}
              onPress={handleOpenWriteReview}
            >
              <Text style={[styles.writeReviewBtnText, { color: colors.primary }]}>
                ⭐ Viết đánh giá
              </Text>
            </TouchableOpacity>
          </View>

          {listingReviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={[styles.emptyReviewsText, { color: colors.textSecondary }]}>
                Chỉ người thuê từng nhắn tin trao đổi với chủ trọ mới có quyền đánh giá phòng này.
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {listingReviews.map((rev: Review) => (
                <View key={rev.id} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.reviewTopRow}>
                    <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>
                      {rev.tenantName}
                    </Text>
                    <Text style={styles.starText}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </Text>
                  </View>
                  <Text style={[styles.reviewBody, { color: colors.textPrimary }]}>
                    {rev.content}
                  </Text>
                  <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 9. Fixed Bottom Bar (Section 23) */}
      {/* 9. Fixed Bottom Bar (Section 23) */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.scheduleBtn, { borderColor: '#10B981', backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}
          onPress={() => setIsDepositEscrowOpen(true)}
        >
          <Text style={[styles.scheduleBtnText, { color: '#059669', fontWeight: 'bold' }]}>
            🛡️ Cọc giữ chỗ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scheduleBtn, { borderColor: colors.primary }]}
          onPress={() => setIsChecklistOpen(true)}
        >
          <Text style={[styles.scheduleBtnText, { color: colors.primary }]}>
            📋 Đặt lịch xem
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: colors.primary }]}
          onPress={handleStartChat}
        >
          <Text style={styles.chatBtnText}>💬 Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.callBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          onPress={() => {
            if (!isLoggedIn) {
              Alert.alert('Đăng nhập để xem SĐT', 'Vui lòng đăng nhập để liên hệ trực tiếp với chủ trọ.');
              return;
            }
            setShowPhone(!showPhone);
          }}
        >
          <Text style={[styles.callBtnText, { color: colors.textPrimary }]}>
            {showPhone ? '0905 123 456' : '📞 Gọi'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-modals */}
      <DepositEscrowModal
        visible={isDepositEscrowOpen}
        listing={listing}
        onClose={() => setIsDepositEscrowOpen(false)}
      />

      <FloodRiskMapModal
        visible={isFloodMapOpen}
        onClose={() => setIsFloodMapOpen(false)}
        initialCityCode={listing.provinceCode === '01' ? 'hanoi' : listing.provinceCode === '79' ? 'hcm' : 'danang'}
      />

      <InteractiveCostCalculatorModal
        visible={isCostCalculatorOpen}
        onClose={() => setIsCostCalculatorOpen(false)}
        costs={listing.costs}
      />

      <LandlordVerificationModal
        visible={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        listing={listing}
      />

      <ViewingChecklistModal
        visible={isChecklistOpen}
        listing={listing}
        onClose={() => setIsChecklistOpen(false)}
      />

      <ChatRoomModal
        visible={activeChatConvId !== null}
        onClose={() => setActiveChatConvId(null)}
        conversationId={activeChatConvId}
        onOpenReportModal={() => setIsReportOpen(true)}
      />

      <ReportModal
        visible={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="listing"
        targetId={listing.id}
        targetTitle={listing.title}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  galleryBox: {
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryInner: {
    alignItems: 'center',
  },
  galleryPlaceholderText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  topOverlayRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  scamBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  scamTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  scamDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  mainRent: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  mainRentPeriod: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedStatusBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  verifiedStatusText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  costSub: {
    fontSize: 11,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  amenityChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  costTable: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  costLabel: {
    fontSize: 13,
  },
  costValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  costTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  costTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  costTotalValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  calcTriggerBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  calcTriggerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationAddress: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  miniMapPlaceholder: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMapText: {
    fontSize: 11,
    marginTop: 4,
  },
  landlordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  landlordAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  landlordAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  landlordName: {
    fontSize: 15,
    fontWeight: '700',
  },
  landlordStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  verifyTriggerBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  verifyTriggerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  trustScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trustSub: {
    fontSize: 12,
  },
  trustPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  trustScoreValue: {
    color: '#047857',
    fontSize: 15,
    fontWeight: '900',
  },
  trustScoreLevel: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
  },
  trustToggle: {
    paddingVertical: 8,
    marginTop: 8,
  },
  trustToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trustFactorsWrap: {
    marginTop: 6,
  },
  trustFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  trustFactorPoints: {
    fontWeight: '800',
    fontSize: 12,
    width: 32,
  },
  trustFactorDesc: {
    flex: 1,
    fontSize: 12,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewSub: {
    fontSize: 12,
  },
  writeReviewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  writeReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyReviews: {
    paddingVertical: 10,
  },
  emptyReviewsText: {
    fontSize: 12,
    lineHeight: 17,
  },
  reviewsList: {
    gap: 10,
  },
  reviewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  starText: {
    color: '#F59E0B',
    fontSize: 12,
  },
  reviewBody: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 11,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  scheduleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chatBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  callBtn: {
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
