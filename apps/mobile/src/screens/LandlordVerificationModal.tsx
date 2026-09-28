import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ListingSummary } from '@troviet/shared';
import { Button } from '../components/Button';

interface LandlordVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  listing: ListingSummary;
}

export const LandlordVerificationModal: React.FC<LandlordVerificationModalProps> = ({
  visible,
  onClose,
  listing,
}) => {
  const { colors } = useTheme();

  const isL2OrL3 =
    listing.landlordVerificationLevel === 'L2' ||
    listing.landlordVerificationLevel === 'L3';
  const isL3 = listing.landlordVerificationLevel === 'L3';

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityRole="button">
            <Text style={[styles.backText, { color: colors.primary }]}>← Trở lại</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Xác minh chủ trọ
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Landlord Card */}
          <View style={[styles.landlordHero, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {listing.landlordName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.landlordName, { color: colors.textPrimary }]}>
              {listing.landlordName}
            </Text>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: isL2OrL3 ? '#ECFDF5' : '#F3F4F6',
                  borderColor: isL2OrL3 ? '#10B981' : '#D1D5DB',
                },
              ]}
            >
              <Text
                style={[
                  styles.levelBadgeText,
                  { color: isL2OrL3 ? '#047857' : '#4B5563' },
                ]}
              >
                {isL3
                  ? '🛡️ Xác minh chính chủ (L3)'
                  : isL2OrL3
                  ? '✓ Chủ trọ đã xác minh CCCD (L2)'
                  : '📱 Đã xác thực số điện thoại (L1)'}
              </Text>
            </View>
          </View>

          {/* Verification Checklist */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Các tiêu chí đã kiểm thực
            </Text>

            <View style={styles.checkItem}>
              <View style={[styles.checkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={{ color: '#059669', fontSize: 16 }}>✓</Text>
              </View>
              <View style={styles.checkContent}>
                <Text style={[styles.checkTitle, { color: colors.textPrimary }]}>
                  Số điện thoại chính chủ
                </Text>
                <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>
                  Đã xác thực OTP qua số điện thoại di động đăng ký.
                </Text>
              </View>
            </View>

            <View style={styles.checkItem}>
              <View
                style={[
                  styles.checkIconBox,
                  { backgroundColor: isL2OrL3 ? '#ECFDF5' : '#F3F4F6' },
                ]}
              >
                <Text style={{ color: isL2OrL3 ? '#059669' : '#9CA3AF', fontSize: 16 }}>
                  {isL2OrL3 ? '✓' : '○'}
                </Text>
              </View>
              <View style={styles.checkContent}>
                <Text style={[styles.checkTitle, { color: colors.textPrimary }]}>
                  Danh tính công dân (CCCD)
                </Text>
                <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>
                  {isL2OrL3
                    ? 'Đã đối soát căn cước công dân gắn chip với cơ sở dữ liệu thực.'
                    : 'Chủ trọ đang hoàn thiện hồ sơ CCCD.'}
                </Text>
              </View>
            </View>

            <View style={styles.checkItem}>
              <View style={[styles.checkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={{ color: '#059669', fontSize: 16 }}>✓</Text>
              </View>
              <View style={styles.checkContent}>
                <Text style={[styles.checkTitle, { color: colors.textPrimary }]}>
                  Địa chỉ thực tế tại TP. Đà Nẵng
                </Text>
                <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>
                  Đã xác minh vị trí tọa độ địa lý và số nhà tại {listing.wardName}.
                </Text>
              </View>
            </View>

            <View style={styles.checkItem}>
              <View
                style={[
                  styles.checkIconBox,
                  { backgroundColor: isL3 ? '#ECFDF5' : '#F3F4F6' },
                ]}
              >
                <Text style={{ color: isL3 ? '#059669' : '#9CA3AF', fontSize: 16 }}>
                  {isL3 ? '✓' : '○'}
                </Text>
              </View>
              <View style={styles.checkContent}>
                <Text style={[styles.checkTitle, { color: colors.textPrimary }]}>
                  Quyền sở hữu / Hợp đồng ủy quyền cho thuê
                </Text>
                <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>
                  {isL3
                    ? 'Đã xác thực giấy chứng nhận quyền sử dụng đất hoặc quyền cho thuê.'
                    : 'Chủ nhà có mặt tại địa chỉ trọ và cam kết thông tin.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Guarantee Statement */}
          <View style={[styles.guaranteeBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>🛡️</Text>
            <Text style={[styles.guaranteeTitle, { color: colors.textPrimary }]}>
              Cam kết an toàn từ Trọ Việt
            </Text>
            <Text style={[styles.guaranteeText, { color: colors.textSecondary }]}>
              Mọi tin đăng trên Trọ Việt đều trải qua quy trình kiểm soát chống lừa đảo đặt cọc,
              không cho phép chuyển tiền khi chưa ký hợp đồng và chưa xem phòng trực tiếp.
            </Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button title="Đã hiểu" variant="primary" onPress={onClose} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  landlordHero: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  landlordName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkContent: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  checkDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  guaranteeBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  guaranteeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  guaranteeText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
