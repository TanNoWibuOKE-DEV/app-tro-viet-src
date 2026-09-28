import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  ListingSummary,
  DepositEscrowRecord,
  createDepositEscrow,
  releaseDepositEscrow,
  disputeDepositEscrow,
  checkEscrowExpiry,
  formatVND,
  generateVietQRLink,
} from '@troviet/shared';

interface DepositEscrowModalProps {
  visible: boolean;
  listing: ListingSummary;
  onClose: () => void;
  onSuccess?: (escrow: DepositEscrowRecord) => void;
}

type ModalStep = 'booking_info' | 'vietqr_payment' | 'holding_status' | 'dispute_form';

export const DepositEscrowModal: React.FC<DepositEscrowModalProps> = ({
  visible,
  listing,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const { currentUser } = useApp();

  const [step, setStep] = useState<ModalStep>('booking_info');
  const [depositAmount, setDepositAmount] = useState('500000');
  const [escrowRecord, setEscrowRecord] = useState<DepositEscrowRecord | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [remainingTimeText, setRemainingTimeText] = useState('48 giờ 00 phút');

  // Handle escrow timer countdown
  useEffect(() => {
    if (escrowRecord && escrowRecord.status === 'holding') {
      const timer = setInterval(() => {
        const expiry = checkEscrowExpiry(escrowRecord);
        if (expiry.isExpired) {
          setRemainingTimeText('Đã hết hạn giữ cọc');
          clearInterval(timer);
        } else {
          setRemainingTimeText(`${expiry.remainingHours} giờ ${expiry.remainingMinutes} phút`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [escrowRecord]);

  const handleInitiateEscrow = () => {
    const amt = parseInt(depositAmount.replace(/\D/g, ''), 10);
    if (isNaN(amt) || amt < 200000) {
      Alert.alert('Số tiền không hợp lệ', 'Tiền cọc giữ phòng tối thiểu là 200.000 ₫.');
      return;
    }

    try {
      const escrow = createDepositEscrow({
        listingId: listing.id,
        listingTitle: listing.title,
        tenantId: currentUser?.id || 'u-tenant-1',
        tenantName: currentUser?.fullName || 'Người tìm trọ',
        tenantPhone: currentUser?.phoneNumber || '0905123456',
        landlordId: listing.landlordId || 'u-landlord-1',
        landlordName: listing.landlordName || 'Chủ trọ',
        landlordPhone: '0912345678',
        amount: amt,
        monthlyRent: listing.monthlyRent,
      });

      setEscrowRecord(escrow);
      setStep('vietqr_payment');
    } catch (err: any) {
      Alert.alert('Lỗi đặt cọc', err.message || 'Không thể khởi tạo khoản ký quỹ.');
    }
  };

  const handleSimulatePaymentReceived = () => {
    Alert.alert(
      'Thanh toán ký quỹ thành công',
      'Khoản tiền cọc đã được chuyển vào tài khoản ký quỹ trung gian đảm bảo. Phòng này đã được giữ chỗ riêng cho bạn trong 48 giờ.'
    );
    setStep('holding_status');
    if (onSuccess && escrowRecord) onSuccess(escrowRecord);
  };

  const handleConfirmHandoverAndRelease = () => {
    if (!escrowRecord) return;
    Alert.alert(
      'Xác nhận nhận phòng & Giải ngân cọc',
      `Bạn xác nhận đã đến xem thực tế, kiểm tra phòng đạt yêu cầu và đồng ý giải ngân ${formatVND(
        escrowRecord.amount
      )} cho chủ trọ?`,
      [
        { text: 'Kiểm tra lại', style: 'cancel' },
        {
          text: 'Xác nhận giải ngân',
          onPress: () => {
            const released = releaseDepositEscrow(escrowRecord, {
              notes: 'Người thuê đã đến nhận phòng thực tế và xác nhận giải ngân cọc.',
            });
            setEscrowRecord(released);
            Alert.alert(
              'Giải ngân thành công 🎉',
              'Khoản cọc đã được chuyển cho chủ trọ và khấu trừ vào hợp đồng thuê phòng của bạn.'
            );
          },
        },
      ]
    );
  };

  const handleSubmitDispute = () => {
    if (!escrowRecord) return;
    if (!disputeReason.trim() || disputeReason.trim().length < 5) {
      Alert.alert('Thiếu thông tin', 'Vui lòng mô tả rõ lý do bạn muốn khiếu nại (tối thiểu 5 ký tự).');
      return;
    }

    try {
      const disputed = disputeDepositEscrow(escrowRecord, disputeReason);
      setEscrowRecord(disputed);
      setStep('holding_status');
      Alert.alert(
        'Đã gửi khiếu nại cọc 🛡️',
        'Bộ phận Kiểm soát Trọ Việt đã tạm khóa khoản cọc và sẽ liên hệ hỗ trợ bạn đối soát trong 24 giờ làm việc. Nếu thông tin phòng sai lệch, bạn sẽ được hoàn tiền 100%.'
      );
    } catch (err: any) {
      Alert.alert('Lỗi khiếu nại', err.message);
    }
  };

  // Generate VietQR link for escrow holding account
  const qrResult = escrowRecord
    ? generateVietQRLink({
        bankBin: '970422', // MBBank
        bankName: 'MBBank (Quân Đội)',
        accountNumber: '888899998888',
        accountName: 'TROVIET ESCROW TRUST',
        amount: escrowRecord.amount,
        description: escrowRecord.escrowCode,
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Đặt cọc giữ phòng an toàn</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* STEP 1: BOOKING & AMOUNT */}
          {step === 'booking_info' && (
            <View>
              {/* Trust Badge Banner */}
              <View style={[styles.banner, { backgroundColor: isDark ? '#143321' : '#E6F4EA' }]}>
                <Text style={styles.bannerIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: isDark ? '#4ADE80' : '#137333' }]}>
                    Bảo đảm Ký quỹ Trọ Việt Escrow
                  </Text>
                  <Text style={[styles.bannerSub, { color: isDark ? '#A7F3D0' : '#1E8E3E' }]}>
                    Tiền cọc được khóa an toàn 48h. Chỉ giải ngân khi bạn đã xem phòng thực tế và đồng ý nhận phòng.
                  </Text>
                </View>
              </View>

              {/* Room Card Mini */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.listingTitle, { color: colors.textPrimary }]}>{listing.title}</Text>
                <Text style={[styles.listingPrice, { color: colors.primary }]}>
                  {formatVND(listing.monthlyRent)}/tháng
                </Text>
                <Text style={[styles.listingAddress, { color: colors.textSecondary }]}>
                  📍 {listing.wardName} · {listing.street}
                </Text>
                <Text style={[styles.listingLandlord, { color: colors.textSecondary }]}>
                  Chủ nhà: <Text style={{ fontWeight: '600' }}>{listing.landlordName || 'Chủ trọ'}</Text>
                </Text>
              </View>

              {/* Amount input */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Số tiền cọc giữ phòng (VNĐ):</Text>
                <View style={styles.amountChipsRow}>
                  {['300000', '500000', '1000000'].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.chip,
                        depositAmount === amt && { backgroundColor: colors.primary },
                        { borderColor: colors.border },
                      ]}
                      onPress={() => setDepositAmount(amt)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          depositAmount === amt && { color: '#FFF', fontWeight: 'bold' },
                          { color: colors.textPrimary },
                        ]}
                      >
                        {formatVND(parseInt(amt, 10))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  keyboardType="numeric"
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  placeholder="Nhập số tiền cọc (tối thiểu 200.000 ₫)"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Rights & Policies Checklist */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quyền lợi bảo đảm của bạn:</Text>
                <Text style={[styles.policyItem, { color: colors.textSecondary }]}>
                  ✓ Giữ phòng độc quyền trong 48 giờ để bạn sắp xếp đến xem trực tiếp.
                </Text>
                <Text style={[styles.policyItem, { color: colors.textSecondary }]}>
                  ✓ Cấn trừ 100% vào khoản tiền cọc hợp đồng khi ký bàn giao.
                </Text>
                <Text style={[styles.policyItem, { color: colors.textSecondary }]}>
                  ✓ Hoàn trả 100% nếu chủ trọ khóa máy hoặc phòng không đúng ảnh/thực tế.
                </Text>
              </View>

              <View style={{ marginTop: 12, marginBottom: 24 }}>
                <Button
                  title="Tiếp tục quét mã VietQR ký quỹ →"
                  onPress={handleInitiateEscrow}
                />
              </View>
            </View>
          )}

          {/* STEP 2: VIETQR ESCROW PAYMENT */}
          {step === 'vietqr_payment' && escrowRecord && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.qrTitle, { color: colors.textPrimary }]}>
                  Quét VietQR chuyển tiền Ký quỹ
                </Text>
                <Text style={[styles.qrSub, { color: colors.textSecondary }]}>
                  Chuyển chính xác nội dung chuyển khoản để hệ thống tự động khóa giữ phòng tức thì.
                </Text>

                {/* QR Code Container */}
                <View style={styles.qrWrapper}>
                  <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Tài khoản Ký quỹ:</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Trọ Việt Escrow Trust</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Số tài khoản:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>
                    8888 9999 8888
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Ngân hàng:</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>MBBank (Quân Đội)</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Số tiền cọc:</Text>
                  <Text style={[styles.infoValue, { color: '#E11D48', fontWeight: 'bold', fontSize: 16 }]}>
                    {formatVND(escrowRecord.amount)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nội dung bắt buộc:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>
                    {escrowRecord.escrowCode}
                  </Text>
                </View>
              </View>

              {/* Simulation Sandbox Button */}
              <TouchableOpacity style={styles.sandboxBtn} onPress={handleSimulatePaymentReceived}>
                <Text style={styles.sandboxText}>⚡ [Sandbox] Mô phỏng đã chuyển cọc thành công</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: 48-HOUR HOLDING STATUS & RELEASE / DISPUTE */}
          {step === 'holding_status' && escrowRecord && (
            <View>
              {/* Status Header */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      escrowRecord.status === 'released'
                        ? '#10B981'
                        : escrowRecord.status === 'disputed'
                        ? '#F59E0B'
                        : colors.primary,
                  },
                ]}
              >
                <Text style={styles.holdingIcon}>
                  {escrowRecord.status === 'released'
                    ? '🎉'
                    : escrowRecord.status === 'disputed'
                    ? '⚠️'
                    : '⏳'}
                </Text>
                <Text style={[styles.holdingTitle, { color: colors.textPrimary }]}>
                  {escrowRecord.status === 'released'
                    ? 'Đã giải ngân cọc cho chủ trọ'
                    : escrowRecord.status === 'disputed'
                    ? 'Đang tiếp nhận xử lý khiếu nại'
                    : 'Phòng đang được giữ chỗ độc quyền'}
                </Text>

                {escrowRecord.status === 'holding' && (
                  <View style={styles.countdownBox}>
                    <Text style={styles.countdownLabel}>Thời hạn giữ phòng còn lại:</Text>
                    <Text style={[styles.countdownValue, { color: colors.primary }]}>{remainingTimeText}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mã ký quỹ:</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {escrowRecord.escrowCode}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Số tiền cọc:</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                    {formatVND(escrowRecord.amount)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Trạng thái:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        fontWeight: 'bold',
                        color:
                          escrowRecord.status === 'released'
                            ? '#10B981'
                            : escrowRecord.status === 'disputed'
                            ? '#F59E0B'
                            : colors.primary,
                      },
                    ]}
                  >
                    {escrowRecord.status === 'holding'
                      ? 'Đang giữ chỗ (Holding)'
                      : escrowRecord.status === 'released'
                      ? 'Đã giải ngân (Released)'
                      : escrowRecord.status === 'disputed'
                      ? 'Đang khiếu nại (Disputed)'
                      : 'Đã hoàn tiền (Refunded)'}
                  </Text>
                </View>
              </View>

              {/* Actions for holding */}
              {escrowRecord.status === 'holding' && (
                <View style={{ marginTop: 12 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Button
                      title="✅ Đã nhận phòng đạt chuẩn • Giải ngân cọc"
                      onPress={handleConfirmHandoverAndRelease}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: '#E11D48' }]}
                    onPress={() => setStep('dispute_form')}
                  >
                    <Text style={[styles.outlineBtnText, { color: '#E11D48' }]}>
                      ⚠️ Báo cáo phòng sai sự thật / Khiếu nại cọc
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* STEP 4: DISPUTE FORM */}
          {step === 'dispute_form' && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Lý do khiếu nại cọc giữ phòng:
                </Text>
                <Text style={[styles.subText, { color: colors.textSecondary }]}>
                  Vui lòng mô tả thực tế khi bạn tới xem phòng (ví dụ: phòng không đúng ảnh đăng, chủ trọ không có mặt, yêu cầu thêm các khoản phí bất thường...).
                </Text>

                <TextInput
                  style={[
                    styles.disputeInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  multiline
                  numberOfLines={4}
                  value={disputeReason}
                  onChangeText={setDisputeReason}
                  placeholder="Nhập chi tiết vấn đề bạn gặp phải..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: '#E11D48', backgroundColor: '#E11D48', marginTop: 12 }]}
                onPress={handleSubmitDispute}
              >
                <Text style={[styles.outlineBtnText, { color: '#FFF' }]}>
                  Gửi khiếu nại tới Kiểm soát viên Trọ Việt 🛡️
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 12, alignItems: 'center' }}
                onPress={() => setStep('holding_status')}
              >
                <Text style={{ color: colors.primary, fontSize: 15 }}>Quay lại</Text>
              </TouchableOpacity>
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
  banner: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  listingAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  listingLandlord: {
    fontSize: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  policyItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
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
    marginBottom: 24,
  },
  sandboxText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  holdingIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  holdingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  countdownBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  countdownLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  countdownValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  outlineBtn: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  subText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  disputeInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    height: 100,
  },
});
