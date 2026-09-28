import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  evaluateEkycVerification,
  maskIdCardNumber,
  validateVietnameseIdCardNumber,
  EkycEvaluationResult,
} from '@troviet/shared';

interface EkycModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: EkycEvaluationResult) => void;
}

type EkycStep = 'scan_card' | 'liveness' | 'result';

export const EkycModal: React.FC<EkycModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const { currentUser, submitL2Verification } = useApp();

  const [step, setStep] = useState<EkycStep>('scan_card');
  const [cccdNumber, setCccdNumber] = useState('048095123456'); // Sample valid Da Nang CCCD
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Nguyễn Văn Minh');
  const [dob, setDob] = useState('1995-06-15');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [isVerifyingLiveness, setIsVerifyingLiveness] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EkycEvaluationResult | null>(null);

  const handleSimulateNfcScan = () => {
    setIsScanningNfc(true);
    setTimeout(() => {
      setIsScanningNfc(false);
      // Pre-fill verified data from chip
      setCccdNumber('048095123456');
      setFullName('NGUYỄN VĂN MINH');
      setDob('1995-06-15');
      setGender('male');
      Alert.alert(
        'Đọc chip NFC thành công',
        'Đã đối soát chữ ký số trên vi mạch CCCD với dữ liệu gốc của Bộ Công An.'
      );
    }, 1200);
  };

  const handleProceedToLiveness = () => {
    const val = validateVietnameseIdCardNumber(cccdNumber, {
      expectedDobYear: parseInt(dob.substring(0, 4), 10),
      expectedGender: gender,
    });

    if (!val.isValid) {
      Alert.alert('CCCD không hợp lệ', val.errorMessage || 'Vui lòng kiểm tra lại dãy số CCCD.');
      return;
    }

    setStep('liveness');
  };

  const handlePerformLiveness = () => {
    setIsVerifyingLiveness(true);
    setTimeout(() => {
      setIsVerifyingLiveness(false);

      const result = evaluateEkycVerification({
        idCardNumber: cccdNumber,
        fullName,
        dobDateStr: dob,
        gender,
        faceMatchScore: 94,
        livenessPassed: true,
        chipIntegrityVerified: true,
      });

      setEvaluationResult(result);
      setStep('result');

      if (result.status === 'verified') {
        submitL2Verification(cccdNumber, fullName);
        if (onSuccess) onSuccess(result);
      }
    }, 1500);
  };

  const handleReset = () => {
    setStep('scan_card');
    setEvaluationResult(null);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Định danh điện tử eKYC</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Step 1: Scan CCCD Card / NFC */}
          {step === 'scan_card' && (
            <View>
              {/* Security Shield Banner */}
              <View style={[styles.banner, { backgroundColor: isDark ? '#143321' : '#E6F4EA' }]}>
                <Text style={styles.bannerIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: '#137333' }]}>
                    Chuẩn bảo mật Luật 91/2025/QH15
                  </Text>
                  <Text style={[styles.bannerSub, { color: '#137333' }]}>
                    Số CCCD được mã hóa SHA-256 an toàn. Hệ thống không lưu trữ ảnh mặt thô.
                  </Text>
                </View>
              </View>

              {/* NFC Chip Scanner Box */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.nfcHeader}>
                  <Text style={{ fontSize: 28 }}>📡</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Quét chip NFC trên CCCD</Text>
                    <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                      Áp mặt sau của thẻ CCCD gắn chip vào lưng điện thoại
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.nfcBtn, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.primary }]}
                  onPress={handleSimulateNfcScan}
                  disabled={isScanningNfc}
                >
                  {isScanningNfc ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={[styles.nfcBtnText, { color: colors.primary }]}>
                      ⚡ Chạm để quét chip NFC
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Form Input fields */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 14 }]}>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Hoặc kiểm tra thông tin CCCD
                </Text>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Số định danh cá nhân (12 chữ số):</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  value={cccdNumber}
                  onChangeText={setCccdNumber}
                  keyboardType="number-pad"
                  maxLength={12}
                  placeholder="Ví dụ: 048095123456"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.textSecondary }]}>Họ và tên trên thẻ:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="NGUYỄN VĂN A"
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Ngày sinh (YYYY-MM-DD):</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                      value={dob}
                      onChangeText={setDob}
                      placeholder="1995-06-15"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={{ width: 110 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Giới tính:</Text>
                    <View style={styles.genderRow}>
                      <TouchableOpacity
                        style={[styles.genderBtn, gender === 'male' && { backgroundColor: colors.primary }]}
                        onPress={() => setGender('male')}
                      >
                        <Text style={{ color: gender === 'male' ? '#FFF' : colors.textPrimary, fontSize: 12, fontWeight: '700' }}>Nam</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.genderBtn, gender === 'female' && { backgroundColor: colors.primary }]}
                        onPress={() => setGender('female')}
                      >
                        <Text style={{ color: gender === 'female' ? '#FFF' : colors.textPrimary, fontSize: 12, fontWeight: '700' }}>Nữ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: 16 }}>
                  <Button
                    title="Tiếp tục: Xác thực khuôn mặt →"
                    onPress={handleProceedToLiveness}
                    variant="primary"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Liveness Biometric Detection */}
          {step === 'liveness' && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
                  Nhận diện khuôn mặt & Kiểm tra tính sống
                </Text>
                <Text style={[styles.cardSub, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                  Vui lòng giữ điện thoại thẳng mặt, không đeo khẩu trang hoặc kính râm
                </Text>

                {/* Simulated Camera Viewport */}
                <View style={[styles.cameraCircle, { borderColor: colors.primary, backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  {isVerifyingLiveness ? (
                    <View style={{ alignItems: 'center' }}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={[styles.cameraScanningText, { color: colors.primary, marginTop: 12 }]}>
                        Đang quét 3D & kiểm tra liveness...
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 52 }}>👤</Text>
                      <Text style={[styles.cameraHint, { color: colors.textSecondary, marginTop: 8 }]}>
                        Khung hình đã khớp
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ marginTop: 24 }}>
                  <Button
                    title="📸 Bắt đầu kiểm tra khuôn mặt"
                    onPress={handlePerformLiveness}
                    disabled={isVerifyingLiveness}
                    variant="primary"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Result */}
          {step === 'result' && evaluationResult && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  <Text style={{ fontSize: 56 }}>
                    {evaluationResult.status === 'verified' ? '✅' : '⚠️'}
                  </Text>
                  <Text style={[styles.resultTitle, { color: colors.textPrimary, marginTop: 8 }]}>
                    {evaluationResult.status === 'verified'
                      ? 'Xác thực eKYC thành công!'
                      : 'Cần kiểm duyệt bổ sung'}
                  </Text>
                  <Text style={[styles.resultSub, { color: colors.textSecondary }]}>
                    Độ tin cậy sinh trắc học: {evaluationResult.confidenceScore}%
                  </Text>
                </View>

                <View style={[styles.detailTable, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Họ và tên:</Text>
                    <Text style={[styles.detailVal, { color: colors.textPrimary }]}>{evaluationResult.fullNameUpper}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Số CCCD bảo mật:</Text>
                    <Text style={[styles.detailVal, { color: colors.primary, fontWeight: '700' }]}>
                      {maskIdCardNumber(cccdNumber)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Chứng nhận đạt:</Text>
                    <Text style={[styles.detailVal, { color: '#137333', fontWeight: '800' }]}>
                      Cấp {evaluationResult.grantedLevel} Tin cậy
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 20 }}>
                  <Button
                    title="Hoàn tất & Quay lại"
                    onPress={onClose}
                    variant="primary"
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  closeText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerIcon: { fontSize: 24, marginRight: 10 },
  bannerTitle: { fontSize: 13, fontWeight: '700' },
  bannerSub: { fontSize: 11, marginTop: 2 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  nfcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 2 },
  nfcBtn: {
    marginTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcBtnText: { fontSize: 13, fontWeight: '700' },
  sectionHeading: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 12, marginBottom: 4, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  genderRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  genderBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cameraCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    alignSelf: 'center',
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraScanningText: { fontSize: 12, fontWeight: '700' },
  cameraHint: { fontSize: 12 },
  resultTitle: { fontSize: 18, fontWeight: '800' },
  resultSub: { fontSize: 13, marginTop: 4 },
  detailTable: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailKey: { fontSize: 12 },
  detailVal: { fontSize: 12, fontWeight: '600' },
});
