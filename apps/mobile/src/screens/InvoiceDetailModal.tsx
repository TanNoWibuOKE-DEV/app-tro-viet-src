import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { useResponsiveLayout } from '../utils/responsive';
import {
  RentInvoice,
  formatVND,
  createMockBankTransaction,
  reconcileBankTransaction,
} from '@troviet/shared';

interface InvoiceDetailModalProps {
  visible: boolean;
  invoice: RentInvoice | null;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  visible,
  invoice,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const { insets, contentMaxWidth } = useResponsiveLayout();
  const { markInvoicePaid } = useApp();

  if (!invoice) return null;

  const isPaid = invoice.status === 'paid';
  const totalAmountFormatted = formatVND(invoice.totalAmount);

  const handleConfirmPayment = () => {
    Alert.alert(
      'Xác nhận đã thanh toán',
      `Bạn xác nhận đã thực hiện chuyển khoản số tiền ${totalAmountFormatted} trực tiếp đến tài khoản của chủ trọ ${invoice.landlordName}?`,
      [
        { text: 'Chưa chuyển', style: 'cancel' },
        {
          text: '✅ Đã chuyển khoản',
          onPress: () => {
            markInvoicePaid(invoice.id);
            Alert.alert('Thành công', 'Hóa đơn đã được đánh dấu thanh toán thành công!');
          },
        },
      ]
    );
  };

  const handleCopy = (label: string, text: string) => {
    Alert.alert('Đã sao chép', `${label}: ${text}`);
  };

  const handleSimulateBankWebhook = () => {
    const mockTx = createMockBankTransaction({
      invoiceCode: invoice.id,
      amount: invoice.totalAmount,
      senderName: invoice.tenantName || 'KHÁCH THUÊ TRỌ VIỆT',
    });

    const reconciliation = reconcileBankTransaction(mockTx, {
      invoiceId: invoice.id,
      invoiceCode: invoice.id,
      totalAmount: invoice.totalAmount,
      currentStatus: invoice.status,
    });

    if (reconciliation.outcome === 'settled_full' || reconciliation.outcome === 'over_payment') {
      markInvoicePaid(invoice.id);
      Alert.alert(
        '⚡ Đối soát thành công (Webhook Ngân hàng)',
        `[Mô phỏng VietQR NAPAS 24/7]\n\n• Mã GD: #${mockTx.id}\n• Số tiền: ${formatVND(mockTx.amountIn)}\n• Trạng thái: Hệ thống gạch nợ tức thời sau 30 giây!\n\n${reconciliation.userFacingMessage}`
      );
    } else {
      Alert.alert('Kết quả đối soát', reconciliation.userFacingMessage);
    }
  };

  const handleShareWithRoommates = () => {
    Alert.alert(
      'Chia sẻ hóa đơn',
      `Đã tạo liên kết chia sẻ hóa đơn tiền phòng Tháng ${invoice.monthYear} (${totalAmountFormatted}) để gửi nhóm bạn cùng phòng đối soát và chia tiền qua Zalo/Tin nhắn.`
    );
  };

  const qrImageUrl =
    invoice.vietqrUrl ||
    `https://api.vietqr.io/image/970422-1029384756-compact2.png?amount=${invoice.totalAmount}&addInfo=TROVIET%20P302%20T10&accountName=NGUYEN%20VAN%20MINH`;

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
              Chi Tiết Hóa Đơn
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
            {/* Invoice Top Code Line */}
            <View style={styles.metaRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={14} color="#085F56" style={{ marginRight: 4 }} />
                <Text style={[styles.metaCode, { color: colors.textSecondary }]}>
                  Mã hóa đơn: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>#HD-202610-302</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => Alert.alert('Tải PDF', 'Đang tải bản PDF hóa đơn có mộc điện tử...')}
              >
                <Ionicons name="download-outline" size={13} color="#085F56" style={{ marginRight: 3 }} />
                <Text style={styles.downloadPdfText}>Tải PDF</Text>
              </TouchableOpacity>
            </View>

            {/* Status Pills */}
            <View style={styles.statusPillsRow}>
              <View style={[styles.deadlinePill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="time-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                  Hạn đóng 05/11/2026 • Còn 3 ngày
                </Text>
              </View>

              <View
                style={[
                  styles.payStatusBadge,
                  {
                    backgroundColor: isPaid ? '#DCFCE7' : '#FEE2E2',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isPaid ? '#16A34A' : '#EF4444' },
                  ]}
                />
                <Text
                  style={[
                    styles.payStatusText,
                    { color: isPaid ? '#166534' : '#DC2626' },
                  ]}
                >
                  {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Text>
              </View>
            </View>

            {/* Building Info */}
            <View style={[styles.buildingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.buildingHeader}>
                <Ionicons name="business" size={18} color="#085F56" style={{ marginRight: 6 }} />
                <Text style={[styles.buildingTitle, { color: colors.textPrimary }]}>
                  P.302 — Nhà trọ An Nhiên
                </Text>
              </View>
              <Text style={[styles.buildingAddress, { color: colors.textSecondary }]}>
                48/12 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7
              </Text>

              {/* Total Card Banner */}
              <View style={[styles.totalHighlightCard, { backgroundColor: isDark ? '#064E3B' : '#E6F4F1' }]}>
                <View>
                  <Text style={styles.totalPromptText}>TỔNG TIỀN CẦN THANH TOÁN</Text>
                  <Text style={styles.totalBigAmount}>{totalAmountFormatted}</Text>
                </View>
                <View style={styles.checkedUtilitiesTag}>
                  <Ionicons name="checkmark-circle" size={12} color="#085F56" style={{ marginRight: 3 }} />
                  <Text style={styles.checkedUtilitiesText}>Đã chốt điện nước</Text>
                </View>
              </View>
            </View>

            {/* Chi tiết từng khoản chi phí */}
            <View style={[styles.breakdownBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.breakdownHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="receipt-outline" size={16} color="#085F56" style={{ marginRight: 6 }} />
                  <Text style={[styles.breakdownHeaderTitle, { color: colors.textPrimary }]}>
                    Chi tiết từng khoản chi phí
                  </Text>
                </View>
                <Text style={styles.transparentTag}>Minh bạch 100%</Text>
              </View>

              {/* 1. Tiền phòng */}
              <View style={styles.costItemRow}>
                <View style={styles.costItemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="bed-outline" size={16} color="#2563EB" />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.costItemTitle, { color: colors.textPrimary }]}>
                      Tiền phòng (Tháng {invoice.monthYear})
                    </Text>
                    <Text style={[styles.costItemSub, { color: colors.textSecondary }]}>
                      Giá cố định theo hợp đồng
                    </Text>
                  </View>
                </View>
                <Text style={[styles.costItemPrice, { color: colors.textPrimary }]}>
                  {formatVND(invoice.rentAmount)}
                </Text>
              </View>

              {/* 2. Tiền điện sinh hoạt */}
              <View style={styles.costItemRow}>
                <View style={styles.costItemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="flash-outline" size={16} color="#D97706" />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.costItemTitle, { color: colors.textPrimary }]}>
                      Tiền điện sinh hoạt
                    </Text>
                    <Text style={[styles.costItemSub, { color: colors.textSecondary }]}>
                      Chỉ số: 1.240 → 1.360 kWh (120 kWh × 3.000 đ)
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert('Ảnh công tơ điện', 'Ảnh chụp số công tơ điện ngày 30/09: 1360 kWh.')
                      }
                      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}
                    >
                      <Ionicons name="camera-outline" size={12} color="#085F56" style={{ marginRight: 3 }} />
                      <Text style={{ fontSize: 11, color: '#085F56', fontWeight: '700' }}>
                        Xem ảnh công tơ
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.costItemPrice, { color: colors.textPrimary }]}>
                  {formatVND(invoice.electricityAmount || 360000)}
                </Text>
              </View>

              {/* 3. Tiền nước máy thủy cục */}
              <View style={styles.costItemRow}>
                <View style={styles.costItemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="water-outline" size={16} color="#0284C7" />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.costItemTitle, { color: colors.textPrimary }]}>
                      Tiền nước máy thủy cục
                    </Text>
                    <Text style={[styles.costItemSub, { color: colors.textSecondary }]}>
                      Chỉ số: 84 → 90 m³ (6 m³ × 20.000 đ)
                    </Text>
                  </View>
                </View>
                <Text style={[styles.costItemPrice, { color: colors.textPrimary }]}>
                  {formatVND(invoice.waterAmount || 120000)}
                </Text>
              </View>

              {/* 4. Wifi cáp quang */}
              <View style={styles.costItemRow}>
                <View style={styles.costItemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="wifi-outline" size={16} color="#7E22CE" />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.costItemTitle, { color: colors.textPrimary }]}>
                      Wifi cáp quang tốc độ cao
                    </Text>
                    <Text style={[styles.costItemSub, { color: colors.textSecondary }]}>
                      Gói Pro 300Mbps chia đều phòng
                    </Text>
                  </View>
                </View>
                <Text style={[styles.costItemPrice, { color: colors.textPrimary }]}>
                  {formatVND(invoice.internetAmount || 100000)}
                </Text>
              </View>

              {/* 5. Phí vệ sinh hành lang & rác */}
              <View style={styles.costItemRow}>
                <View style={styles.costItemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#CCFBF1' }]}>
                    <Ionicons name="trash-outline" size={16} color="#0F766E" />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.costItemTitle, { color: colors.textPrimary }]}>
                      Phí vệ sinh hành lang & rác
                    </Text>
                    <Text style={[styles.costItemSub, { color: colors.textSecondary }]}>
                      Dọn dẹp công cộng 3 lần/tuần
                    </Text>
                  </View>
                </View>
                <Text style={[styles.costItemPrice, { color: colors.textPrimary }]}>
                  {formatVND(invoice.serviceAmount || 45000)}
                </Text>
              </View>

              {/* 6. Tiền gửi xe máy */}
              <View style={styles.costItemRow}>
                <View style={styles.costItemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="bicycle-outline" size={16} color="#475569" />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.costItemTitle, { color: colors.textPrimary }]}>
                      Tiền gửi xe máy
                    </Text>
                    <Text style={[styles.costItemSub, { color: colors.textSecondary }]}>
                      Xe Honda Vision (Biển 59-E2 849.21)
                    </Text>
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeBadgeText}>Miễn phí 1 xe</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.costItemPrice, { color: colors.textPrimary }]}>
                  0 ₫
                </Text>
              </View>

              <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

              {/* Tổng cộng */}
              <View style={styles.totalRow}>
                <Text style={[styles.totalRowLabel, { color: colors.textPrimary }]}>
                  Tổng cộng
                </Text>
                <Text style={[styles.totalRowValue, { color: '#085F56' }]}>
                  {totalAmountFormatted}
                </Text>
              </View>
            </View>

            {/* VietQR Chuyển Khoản Section */}
            <View style={[styles.vietqrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.vietqrTitleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="qr-code-outline" size={18} color="#085F56" style={{ marginRight: 6 }} />
                  <Text style={[styles.vietqrTitle, { color: colors.textPrimary }]}>
                    Quét mã VietQR chuyển khoản
                  </Text>
                </View>
                <View style={styles.autoPill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.autoPillText}>Tự động 24/7</Text>
                </View>
              </View>

              {/* QR Container */}
              <View style={[styles.qrCodeBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <View style={styles.qrHeader}>
                  <Text style={styles.vietqrBrand}>
                    VietQR <Text style={{ color: '#085F56' }}>• MBBank</Text>
                  </Text>
                  <Text style={styles.napasBrand}>⚡ Napas 247</Text>
                </View>

                <View style={styles.qrCenterWrap}>
                  <Image source={{ uri: qrImageUrl }} style={styles.qrImage} resizeMode="contain" />
                </View>

                <Text style={styles.qrEncodedNote}>
                  Số tiền mã hóa tự động:{' '}
                  <Text style={{ fontWeight: '800', color: '#085F56' }}>{totalAmountFormatted}</Text>
                </Text>
              </View>

              {/* Bank Account Details */}
              <View style={[styles.bankDetailItem, { borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bankLabel, { color: colors.textSecondary }]}>
                    Tài khoản thụ hưởng:
                  </Text>
                  <Text style={[styles.bankValue, { color: colors.textPrimary }]}>
                    1029384756 (MBBank)
                  </Text>
                  <Text style={[styles.bankSub, { color: colors.textSecondary }]}>
                    Chủ TK: NGUYEN VAN MINH
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleCopy('Số tài khoản', '1029384756')}
                >
                  <Ionicons name="copy-outline" size={13} color="#085F56" style={{ marginRight: 3 }} />
                  <Text style={styles.copyBtnText}>Sao chép</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.bankDetailItem, { borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bankLabel, { color: colors.textSecondary }]}>
                    Nội dung chuyển khoản (Bắt buộc):
                  </Text>
                  <Text style={[styles.bankValueHighlight, { color: '#085F56' }]}>
                    TROVIET P302 T10
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleCopy('Nội dung chuyển khoản', 'TROVIET P302 T10')}
                >
                  <Ionicons name="copy-outline" size={13} color="#085F56" style={{ marginRight: 3 }} />
                  <Text style={styles.copyBtnText}>Sao chép</Text>
                </TouchableOpacity>
              </View>

              {/* Auto Reconciliation Guarantee */}
              <View style={[styles.autoReconcileBox, { backgroundColor: isDark ? '#064E3B' : '#E6F4F1' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#085F56" style={{ marginRight: 6 }} />
                <Text style={styles.autoReconcileText}>
                  <Text style={{ fontWeight: '700' }}>Khớp lệnh tự động:</Text> Hệ thống gạch nợ tức thì sau{' '}
                  <Text style={{ fontWeight: '800' }}>30 giây</Text> ngay khi ngân hàng ghi nhận chuyển khoản.
                </Text>
              </View>
            </View>

            {/* Contact Support */}
            <View style={styles.supportRow}>
              <Ionicons name="call-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.supportText, { color: colors.textSecondary }]}>
                Cần hỗ trợ đối soát? Liên hệ chủ nhà:{' '}
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>0908.123.456</Text>
              </Text>
            </View>

            {/* Sandbox Simulation Button */}
            {!isPaid && (
              <TouchableOpacity
                style={[styles.sandboxTestBtn, { borderColor: colors.border }]}
                onPress={handleSimulateBankWebhook}
              >
                <Ionicons name="flash-outline" size={14} color="#085F56" style={{ marginRight: 5 }} />
                <Text style={styles.sandboxTestBtnText}>
                  Mô phỏng Webhook đối soát tự động (Sandbox VietQR)
                </Text>
              </TouchableOpacity>
            )}
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
              style={[styles.confirmPaidBtn, isPaid && { backgroundColor: '#10B981' }]}
              onPress={handleConfirmPayment}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmPaidBtnText}>
                {isPaid ? 'Hóa đơn đã được thanh toán' : 'Tôi đã chuyển khoản thành công'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareInvoiceBtn}
              onPress={handleShareWithRoommates}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={16} color="#0284C7" style={{ marginRight: 6 }} />
              <Text style={styles.shareInvoiceBtnText}>Chia sẻ hóa đơn với bạn cùng phòng</Text>
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
    paddingBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaCode: {
    fontSize: 11,
  },
  downloadPdfText: {
    fontSize: 11,
    color: '#085F56',
    fontWeight: '700',
  },
  statusPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  payStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  payStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  buildingCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  buildingTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  buildingAddress: {
    fontSize: 12,
    marginBottom: 12,
  },
  totalHighlightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  totalPromptText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#085F56',
    letterSpacing: 0.2,
  },
  totalBigAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#085F56',
    marginTop: 2,
  },
  checkedUtilitiesTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkedUtilitiesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#085F56',
  },
  breakdownBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  breakdownHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  transparentTag: {
    fontSize: 11,
    color: '#085F56',
    fontWeight: '700',
  },
  costItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  costItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  costItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  costItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
  freeBadge: {
    backgroundColor: '#EDF5F3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  freeBadgeText: {
    color: '#085F56',
    fontSize: 10,
    fontWeight: '700',
  },
  costItemPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  breakdownDivider: {
    height: 1,
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalRowLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalRowValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  vietqrCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  vietqrTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vietqrTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  autoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
    marginRight: 4,
  },
  autoPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  qrCodeBox: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  vietqrBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  napasBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  qrCenterWrap: {
    width: 180,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrEncodedNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
  },
  bankDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  bankLabel: {
    fontSize: 11,
  },
  bankValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  bankValueHighlight: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  bankSub: {
    fontSize: 11,
    marginTop: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#085F56',
  },
  autoReconcileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  autoReconcileText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#064E46',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  supportText: {
    fontSize: 11,
  },
  sandboxTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  sandboxTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#085F56',
  },
  bottomActionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  confirmPaidBtn: {
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
  confirmPaidBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  shareInvoiceBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareInvoiceBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
});
