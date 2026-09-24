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
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { RentInvoice, formatVND } from '@troviet/shared';

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
  const { markInvoicePaid } = useApp();

  if (!invoice) return null;

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'paid':
        return { label: '🟢 Đã thanh toán', bg: isDark ? '#143321' : '#E6F4EA', text: '#137333' };
      case 'overdue':
        return { label: '🔴 Quá hạn thanh toán', bg: isDark ? '#331414' : '#FCE8E6', text: '#C5221F' };
      default:
        return { label: '🟡 Chờ thanh toán', bg: isDark ? '#332914' : '#FEF7E0', text: '#B06000' };
    }
  };

  const statusBadge = getStatusBadge();

  const handleConfirmPayment = () => {
    Alert.alert(
      'Xác nhận đã thanh toán',
      `Bạn xác nhận đã thực hiện chuyển khoản số tiền ${formatVND(invoice.totalAmount)} trực tiếp đến tài khoản của chủ trọ ${invoice.landlordName}?`,
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

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Hóa đơn tiền phòng</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Status & Overview */}
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>Tháng {invoice.monthYear}</Text>
                <Text style={[styles.listingTitle, { color: colors.textSecondary }]}>{invoice.listingTitle}</Text>
                <Text style={[styles.invoiceCode, { color: colors.textSecondary }]}>Mã HĐ: {invoice.id}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusBadge.bg }]}>
                <Text style={[styles.badgeText, { color: statusBadge.text }]}>{statusBadge.label}</Text>
              </View>
            </View>

            {invoice.paidAt && (
              <View style={[styles.paidAtBox, { backgroundColor: isDark ? '#143321' : '#E6F4EA' }]}>
                <Text style={styles.paidAtText}>
                  Đã thanh toán lúc: {new Date(invoice.paidAt).toLocaleString('vi-VN')}
                </Text>
              </View>
            )}
          </View>

          {/* Itemized Calculation Breakdown */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📋 Bảng kê chi tiết chi phí</Text>

            {/* Rent */}
            <View style={styles.lineItem}>
              <View>
                <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Tiền thuê phòng</Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Tiền phòng tháng {invoice.monthYear}</Text>
              </View>
              <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>{formatVND(invoice.rentAmount)}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Electricity */}
            <View style={styles.lineItem}>
              <View>
                <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Tiền điện</Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  {invoice.electricityKwh ? `Số lượng: ${invoice.electricityKwh} kWh` : 'Điện cố định hoặc miễn phí'}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>{formatVND(invoice.electricityAmount)}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Water */}
            <View style={styles.lineItem}>
              <View>
                <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Tiền nước</Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  {invoice.waterM3 ? `Số lượng: ${invoice.waterM3} m³` : 'Nước cố định hoặc miễn phí'}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>{formatVND(invoice.waterAmount)}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Internet */}
            <View style={styles.lineItem}>
              <View>
                <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Internet / Wifi</Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Cước mạng hàng tháng</Text>
              </View>
              <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>{formatVND(invoice.internetAmount)}</Text>
            </View>

            {invoice.serviceAmount > 0 && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.lineItem}>
                  <View>
                    <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Phí dịch vụ & rác</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Vệ sinh hành lang & rác thải</Text>
                  </View>
                  <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>{formatVND(invoice.serviceAmount)}</Text>
                </View>
              </>
            )}

            <View style={[styles.dividerThick, { backgroundColor: colors.primary }]} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>TỔNG CỘNG</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>{formatVND(invoice.totalAmount)}</Text>
            </View>
          </View>

          {/* VietQR NAPAS Payment Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>💳 Thanh toán VietQR (NAPAS 24/7)</Text>

            {/* Direct P2P compliance notice */}
            <View style={[styles.p2pNotice, { backgroundColor: isDark ? '#1C2738' : '#EEF5FF' }]}>
              <Text style={[styles.p2pText, { color: colors.textSecondary }]}>
                🛡️ <Text style={{ fontWeight: '700', color: colors.primary }}>Chuyển khoản trực tiếp:</Text> Tiền được chuyển thẳng tới tài khoản ngân hàng của chủ trọ. Trọ Việt không giữ hộ hoặc trung gian dòng tiền theo quy định pháp luật.
              </Text>
            </View>

            {/* QR Code image */}
            {invoice.vietqrUrl ? (
              <View style={styles.qrContainer}>
                <View style={[styles.qrWrapper, { backgroundColor: '#FFFFFF' }]}>
                  <Image
                    source={{ uri: invoice.vietqrUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
                  Mở ứng dụng Ngân hàng bất kỳ để quét mã QR và thanh toán tức thì
                </Text>
              </View>
            ) : null}

            {/* Landlord bank info */}
            <View style={[styles.bankBox, { backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}>
              <View style={styles.bankRow}>
                <Text style={[styles.bankKey, { color: colors.textSecondary }]}>Chủ tài khoản:</Text>
                <Text style={[styles.bankVal, { color: colors.textPrimary }]}>{invoice.landlordName}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={[styles.bankKey, { color: colors.textSecondary }]}>Nội dung CK:</Text>
                <Text style={[styles.bankValHighlight, { color: colors.primary }]}>TROVIET {invoice.id.toUpperCase()}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={[styles.bankKey, { color: colors.textSecondary }]}>Số tiền:</Text>
                <Text style={[styles.bankVal, { color: colors.textPrimary, fontWeight: '700' }]}>{formatVND(invoice.totalAmount)}</Text>
              </View>
            </View>
          </View>

          {/* Action button */}
          {invoice.status === 'pending' && (
            <View style={styles.actionContainer}>
              <Button
                title="✅ Tôi đã chuyển khoản xong"
                onPress={handleConfirmPayment}
                variant="primary"
              />
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
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  invoiceCode: {
    fontSize: 11,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  paidAtBox: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
  },
  paidAtText: {
    color: '#137333',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  dividerThick: {
    height: 2,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  p2pNotice: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  p2pText: {
    fontSize: 12,
    lineHeight: 17,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrWrapper: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 260,
  },
  bankBox: {
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bankKey: {
    fontSize: 12,
  },
  bankVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  bankValHighlight: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 4,
    marginBottom: 20,
  },
});
