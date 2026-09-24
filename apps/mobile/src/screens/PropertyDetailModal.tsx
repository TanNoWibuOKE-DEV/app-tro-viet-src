import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CostCard } from '../components/CostCard';
import { ReportModal } from '../components/ReportModal';
import { ChatRoomModal } from './ChatRoomModal';
import {
  ListingSummary,
  formatArea,
  formatVND,
  checkListingPricingAnomaly,
  calculateListingTrustScore,
  analyzeRoomListing,
  Review,
} from '@troviet/shared';
import { ViewingChecklistModal } from './ViewingChecklistModal';

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
  const { colors, isDark } = useTheme();
  const {
    openChatWithLandlord,
    reviews,
    submitReview,
    canUserReviewListing,
  } = useApp();

  const [showPhone, setShowPhone] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isTrustDetailsOpen, setIsTrustDetailsOpen] = useState(false);
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

  // Phase 5 Trust Score and AI Room Analysis
  const trustScore = calculateListingTrustScore(listing, { reviews: listingReviews });
  const roomAnalysis = analyzeRoomListing(listing);

  const avgRating =
    listingReviews.length > 0
      ? (
          listingReviews.reduce((sum, r) => sum + r.rating, 0) /
          listingReviews.length
        ).toFixed(1)
      : null;

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
    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          Chi tiết phòng
        </Text>
        <TouchableOpacity
          style={styles.reportTopBtn}
          onPress={() => setIsReportOpen(true)}
        >
          <Text style={{ fontSize: 13, color: colors.error }}>🚩 Báo cáo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Visual Cover Header */}
        <View style={[styles.coverBox, { backgroundColor: colors.border }]}>
          <Text style={{ fontSize: 36 }}>🏡</Text>
          <Text style={[styles.coverSub, { color: colors.textSecondary }]}>
            Hình ảnh thực tế căn phòng [MẪU - DEV]
          </Text>
        </View>

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

          {/* Explainable Trust Score Card (Phase 5) */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.trustScoreHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginBottom: 2 }]}>
                  🛡️ Điểm tin cậy Trọ Việt
                </Text>
                <Text style={[styles.trustSub, { color: colors.textSecondary }]}>
                  Đánh giá minh bạch đa chiều dựa trên quy tắc khách quan
                </Text>
              </View>
              <View
                style={[
                  styles.trustScorePill,
                  {
                    backgroundColor:
                      trustScore.level === 'very_high' || trustScore.level === 'high'
                        ? '#e6fcf5'
                        : trustScore.level === 'medium'
                        ? '#fff9db'
                        : '#ffe3e3',
                    borderColor:
                      trustScore.level === 'very_high' || trustScore.level === 'high'
                        ? '#0ca678'
                        : trustScore.level === 'medium'
                        ? '#f59f00'
                        : '#fa5252',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.trustScoreValue,
                    {
                      color:
                        trustScore.level === 'very_high' || trustScore.level === 'high'
                          ? '#087f5b'
                          : trustScore.level === 'medium'
                          ? '#d9480f'
                          : '#c92a2a',
                    },
                  ]}
                >
                  {trustScore.score}/100
                </Text>
                <Text
                  style={[
                    styles.trustLevelText,
                    {
                      color:
                        trustScore.level === 'very_high' || trustScore.level === 'high'
                          ? '#087f5b'
                          : trustScore.level === 'medium'
                          ? '#d9480f'
                          : '#c92a2a',
                    },
                  ]}
                >
                  {trustScore.levelLabel}
                </Text>
              </View>
            </View>

            {/* Toggle breakdown */}
            <TouchableOpacity
              style={styles.trustToggleRow}
              onPress={() => setIsTrustDetailsOpen(!isTrustDetailsOpen)}
            >
              <Text style={[styles.trustToggleText, { color: colors.primary }]}>
                {isTrustDetailsOpen
                  ? '▲ Thu gọn tiêu chí chấm điểm'
                  : `▼ Xem chi tiết ${trustScore.factors.length} yếu tố chấm điểm`}
              </Text>
            </TouchableOpacity>

            {isTrustDetailsOpen && (
              <View style={styles.trustFactorsList}>
                {trustScore.factors.map((f, idx) => (
                  <View key={idx} style={[styles.factorRow, { borderBottomColor: colors.border }]}>
                    <Text
                      style={[
                        styles.factorPoints,
                        { color: f.points >= 0 ? colors.success : colors.error },
                      ]}
                    >
                      {f.points >= 0 ? `+${f.points}` : `${f.points}`}
                    </Text>
                    <Text style={[styles.factorDesc, { color: colors.textPrimary }]}>
                      {f.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* AI Room Insights (Grounded Fact-based) */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.aiInsightsHeader}>
              <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginBottom: 2 }]}>
                🤖 Phân tích phòng AI (Dữ liệu thực tế)
              </Text>
              <Text style={[styles.aiBadgeDisclaimer, { color: colors.textSecondary }]}>
                So sánh với mặt bằng giá & dữ liệu thực tế tại {listing.wardName}
              </Text>
            </View>

            {/* Price comparison */}
            <View style={[styles.aiInsightRow, { backgroundColor: colors.background }]}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>📊</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiInsightTitle, { color: colors.textPrimary }]}>
                  {roomAnalysis.priceAssessment.label}
                </Text>
                <Text style={[styles.aiInsightDetails, { color: colors.textSecondary }]}>
                  {roomAnalysis.priceAssessment.details}
                </Text>
              </View>
            </View>

            {/* Transparency check */}
            <View style={[styles.aiInsightRow, { backgroundColor: colors.background, marginTop: 8 }]}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>
                {roomAnalysis.transparencyAssessment.isFullyTransparent ? '✅' : '⚠️'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiInsightTitle, { color: colors.textPrimary }]}>
                  Tính minh bạch chi phí
                </Text>
                <Text style={[styles.aiInsightDetails, { color: colors.textSecondary }]}>
                  {roomAnalysis.transparencyAssessment.label}
                </Text>
              </View>
            </View>

            {/* Key advantages */}
            {roomAnalysis.keyAdvantages.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.aiSubHeading, { color: colors.textPrimary }]}>
                  ✨ Điểm nổi bật đã xác thực:
                </Text>
                {roomAnalysis.keyAdvantages.map((adv, idx) => (
                  <Text key={idx} style={[styles.aiBullet, { color: colors.textSecondary }]}>
                    • {adv}
                  </Text>
                ))}
              </View>
            )}

            {/* Practical viewing advice */}
            {roomAnalysis.viewingAdvice.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.aiSubHeading, { color: colors.textPrimary }]}>
                  💡 Lời khuyên của Trọ Việt khi đi xem:
                </Text>
                {roomAnalysis.viewingAdvice.map((adv, idx) => (
                  <Text key={idx} style={[styles.aiBullet, { color: colors.textSecondary }]}>
                    • {adv}
                  </Text>
                ))}
              </View>
            )}

            {/* Viewing Checklist Button */}
            <TouchableOpacity
              style={[styles.checklistTriggerBtn, { backgroundColor: colors.primary }]}
              onPress={() => setIsChecklistOpen(true)}
            >
              <Text style={styles.checklistTriggerText}>
                📋 Mở sổ tay đi xem phòng (10 điểm kiểm tra)
              </Text>
            </TouchableOpacity>
          </View>

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
                  Trạng thái: {listing.landlordVerificationLevel === 'L2' ? 'Đã xác minh danh tính CCCD' : 'Đã xác thực số điện thoại'}
                </Text>
              </View>
            </View>
          </View>

          {/* Controlled Reviews Section (Phase 3) */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.reviewHeaderRow}>
              <View>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginBottom: 2 }]}>
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
                  <View
                    key={rev.id}
                    style={[styles.reviewItem, { borderBottomColor: colors.border }]}
                  >
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

                    {/* Landlord reply */}
                    {rev.landlordResponse && (
                      <View style={[styles.landlordReplyBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.landlordReplyTitle, { color: colors.primary }]}>
                          💬 Phản hồi từ chủ trọ:
                        </Text>
                        <Text style={[styles.landlordReplyBody, { color: colors.textPrimary }]}>
                          {rev.landlordResponse}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
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

        <View style={styles.bottomActionsCol}>
          <TouchableOpacity
            style={[styles.chatActionBtn, { backgroundColor: colors.primary }]}
            onPress={handleStartChat}
          >
            <Text style={styles.chatActionText}>💬 Nhắn tin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.callActionBtn,
              {
                borderColor: colors.border,
                backgroundColor: showPhone ? colors.primary : colors.background,
              },
            ]}
            onPress={() => {
              if (!isLoggedIn) {
                Alert.alert(
                  'Đăng nhập để xem SĐT',
                  'Vui lòng đăng nhập để xem số điện thoại liên hệ trực tiếp.'
                );
                return;
              }
              setShowPhone(!showPhone);
            }}
          >
            <Text
              style={[
                styles.callActionText,
                { color: showPhone ? '#ffffff' : colors.textPrimary },
              ]}
            >
              {showPhone ? '0905 123 456' : '📞 Gọi điện'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Realtime Chat Modal */}
      <ChatRoomModal
        visible={activeChatConvId !== null}
        onClose={() => setActiveChatConvId(null)}
        conversationId={activeChatConvId}
        onOpenReportModal={(type, id, title) => {
          setIsReportOpen(true);
        }}
      />

      {/* Report Modal */}
      <ReportModal
        visible={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="listing"
        targetId={listing.id}
        targetTitle={listing.title}
      />

      {/* Write Review Modal */}
      <Modal visible={isWriteReviewOpen} animationType="slide" transparent>
        <View style={styles.writeReviewOverlay}>
          <View style={[styles.writeReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.writeReviewTitle, { color: colors.textPrimary }]}>
              Viết đánh giá phòng trọ
            </Text>
            <Text style={[styles.writeReviewSub, { color: colors.textSecondary }]}>
              {listing.title}
            </Text>

            {/* Star selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Text style={{ fontSize: 32, marginHorizontal: 4 }}>
                    {star <= reviewRating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.reviewInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về phòng trọ, điện nước, an ninh và chủ nhà..."
              placeholderTextColor={colors.textSecondary}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
            />

            <View style={styles.reviewBtnsRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsWriteReviewOpen(false)}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: reviewComment.trim() ? colors.primary : colors.border,
                  },
                ]}
                onPress={handleSubmitReview}
                disabled={!reviewComment.trim()}
              >
                <Text style={styles.confirmBtnText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Phase 5 Viewing Checklist Modal */}
      <ViewingChecklistModal
        visible={isChecklistOpen}
        listing={listing}
        onClose={() => setIsChecklistOpen(false)}
      />
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
    flex: 1,
    textAlign: 'center',
  },
  reportTopBtn: {
    paddingVertical: 6,
    paddingLeft: 8,
  },
  scrollContent: {
    paddingBottom: 110,
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
  scamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
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
    marginBottom: 10,
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
  },
  landlordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  landlordName: {
    fontSize: 15,
    fontWeight: '700',
  },
  landlordSub: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewSub: {
    fontSize: 12,
  },
  writeReviewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  writeReviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyReviews: {
    paddingVertical: 12,
  },
  emptyReviewsText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    paddingBottom: 10,
    borderBottomWidth: 0.5,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  starText: {
    color: '#f59f00',
    fontSize: 14,
  },
  reviewBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 11,
  },
  landlordReplyBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  landlordReplyTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  landlordReplyBody: {
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  bottomActionsCol: {
    flexDirection: 'row',
    gap: 8,
  },
  chatActionBtn: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  callActionBtn: {
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  writeReviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  writeReviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  writeReviewTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  writeReviewSub: {
    fontSize: 12,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reviewInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    minHeight: 90,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  reviewBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  confirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  // Phase 5 Trust Score & AI Insights Styles
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trustSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  trustScorePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 84,
  },
  trustScoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  trustLevelText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  trustToggleRow: {
    paddingVertical: 4,
    marginTop: 4,
  },
  trustToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trustFactorsList: {
    marginTop: 8,
    paddingTop: 4,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  factorPoints: {
    fontSize: 12,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
  factorDesc: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  aiInsightsHeader: {
    marginBottom: 10,
  },
  aiBadgeDisclaimer: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  aiInsightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
  },
  aiInsightTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiInsightDetails: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiSubHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiBullet: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  checklistTriggerBtn: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistTriggerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
