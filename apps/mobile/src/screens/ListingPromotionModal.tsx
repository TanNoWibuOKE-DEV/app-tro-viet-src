import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  ListingSummary,
  SubscriptionTier,
  SUBSCRIPTION_PLANS,
  createSubscriptionOrder,
  activateSubscriptionPayment,
  LandlordSubscriptionRecord,
  formatVND,
  generateVietQRLink,
} from '@troviet/shared';

interface ListingPromotionModalProps {
  visible: boolean;
  listing: ListingSummary;
  onClose: () => void;
  onSuccess?: (sub: LandlordSubscriptionRecord) => void;
}

export const ListingPromotionModal: React.FC<ListingPromotionModalProps> = ({
  visible,
  listing,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const { currentUser } = useApp();

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('vip_diamond');
  const [activeOrder, setActiveOrder] = useState<LandlordSubscriptionRecord | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  const handleSelectTierAndProceed = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    try {
      const order = createSubscriptionOrder({
        landlordId: currentUser?.id || 'u-landlord-1',
        listingId: listing.id,
        listingTitle: listing.title,
        tier,
      });
      setActiveOrder(order);
    } catch (err: any) {
      Alert.alert('Lỗi tạo gói', err.message);
    }
  };

  const handleSimulatePayment = () => {
    if (!activeOrder) return;
    const activated = activateSubscriptionPayment(activeOrder);
    setActiveOrder(activated);
    setIsActivated(true);
    Alert.alert(
      'Kích hoạt gói VIP thành công 🎉',
      `Tin đăng "${listing.title}" đã được nâng cấp lên ${SUBSCRIPTION_PLANS[activeOrder.tier].name}. Vị trí tin sẽ được ưu tiên hiển thị ngay lập tức.`
    );
    if (onSuccess) onSuccess(activated);
  };

  const currentPlan = SUBSCRIPTION_PLANS[selectedTier];
  const qrResult = activeOrder
    ? generateVietQRLink({
        bankBin: '970422', // MBBank
        bankName: 'MBBank (Quân Đội)',
        accountNumber: '888899998888',
        accountName: 'TROVIET PROMOTIONS',
        amount: activeOrder.pricePaid,
        description: activeOrder.packageCode,
      })
    : null;
  const qrUrl = qrResult ? qrResult.qrImageUrl : '';

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Nâng cấp tin đăng VIP</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Target listing info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>Đang áp dụng cho tin:</Text>
            <Text style={[styles.listingTitle, { color: colors.textPrimary }]}>{listing.title}</Text>
            <Text style={[styles.listingPrice, { color: colors.primary }]}>
              {formatVND(listing.monthlyRent)}/tháng • 📍 {listing.wardName} · {listing.street}
            </Text>
          </View>

          {/* Tier Selection */}
          {!activeOrder && (
            <View>
              <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                Chọn gói cước đẩy tin phù hợp:
              </Text>

              {(['vip_diamond', 'vip_silver', 'vip_bronze'] as SubscriptionTier[]).map((tierKey) => {
                const plan = SUBSCRIPTION_PLANS[tierKey];
                const isSelected = selectedTier === tierKey;

                return (
                  <TouchableOpacity
                    key={tierKey}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? plan.color : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedTier(tierKey)}
                  >
                    <View style={styles.planHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.planIcon}>{plan.badgeIcon}</Text>
                        <View style={{ marginLeft: 8 }}>
                          <Text style={[styles.planName, { color: colors.textPrimary }]}>
                            {plan.name}
                          </Text>
                          <Text style={[styles.planBadge, { color: plan.color }]}>
                            Tăng x{plan.searchRankingMultiplier} hiển thị
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.planPrice, { color: plan.color }]}>
                        {formatVND(plan.priceVND)}
                      </Text>
                    </View>

                    <View style={styles.featuresList}>
                      {plan.features.map((feat, idx) => (
                        <Text key={idx} style={[styles.featureItem, { color: colors.textSecondary }]}>
                          ✓ {feat}
                        </Text>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={{ marginTop: 12, marginBottom: 24 }}>
                <Button
                  title={`Nâng cấp gói ${currentPlan.name} • ${formatVND(currentPlan.priceVND)} →`}
                  onPress={() => handleSelectTierAndProceed(selectedTier)}
                />
              </View>
            </View>
          )}

          {/* Payment via VietQR */}
          {activeOrder && !isActivated && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.qrTitle, { color: colors.textPrimary }]}>
                  Thanh toán kích hoạt {currentPlan.name}
                </Text>
                <Text style={[styles.qrSub, { color: colors.textSecondary }]}>
                  Quét mã VietQR bên dưới để kích hoạt gói cước ngay lập tức qua đối soát ngân hàng mở.
                </Text>

                <View style={styles.qrWrapper}>
                  <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Gói dịch vụ:</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {currentPlan.name} (30 ngày)
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Số tiền thanh toán:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold', fontSize: 16 }]}>
                    {formatVND(activeOrder.pricePaid)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nội dung chuyển khoản:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>
                    {activeOrder.packageCode}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.sandboxBtn} onPress={handleSimulatePayment}>
                <Text style={styles.sandboxText}>⚡ [Sandbox] Mô phỏng đã nhận thanh toán VietQR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 10 }}
                onPress={() => setActiveOrder(null)}
              >
                <Text style={{ color: colors.textSecondary }}>← Chọn lại gói cước</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Activated Success Banner */}
          {isActivated && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: '#10B981' }]}>
              <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>💎</Text>
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                Tin đăng đã được kích hoạt VIP!
              </Text>
              <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                Gói {currentPlan.name} có hiệu lực trong 30 ngày. Vị trí tin của bạn đã được đưa lên ưu tiên hàng đầu trong kết quả tìm kiếm.
              </Text>

              <View style={{ marginTop: 16 }}>
                <Button title="Hoàn tất & Quay lại" onPress={onClose} />
              </View>
            </View>
          )}
        </ScrollView>
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
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  subText: {
    fontSize: 13,
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  planCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planIcon: {
    fontSize: 26,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 10,
    gap: 4,
  },
  featureItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  qrSub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrImage: {
    width: 240,
    height: 240,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
  sandboxBtn: {
    backgroundColor: '#0284C7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sandboxText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
