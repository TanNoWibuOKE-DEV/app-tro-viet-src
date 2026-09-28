import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ReportCategory, ReportTargetType } from '@troviet/shared';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
}

interface CategoryOption {
  key: ReportCategory;
  label: string;
  icon: string;
  description: string;
}

const REPORT_CATEGORIES: CategoryOption[] = [
  {
    key: 'deposit_scam',
    label: 'Lừa đảo tiền cọc',
    icon: '🚨',
    description: 'Yêu cầu chuyển cọc sớm, hối thúc chuyển khoản vào STK lạ trước khi xem phòng',
  },
  {
    key: 'fake_listing',
    label: 'Phòng ảo / Ảnh giả mạo',
    icon: '⚠️',
    description: 'Địa chỉ không có thật, ảnh lấy từ dự án khác, phòng đã cho thuê từ lâu',
  },
  {
    key: 'wrong_price',
    label: 'Giá phòng sai lệch thực tế',
    icon: '💸',
    description: 'Báo giá thực tế cao hơn tin đăng, phụ thu điện nước giá "trên trời"',
  },
  {
    key: 'inappropriate_behavior',
    label: 'Hành vi thiếu văn hóa / Quấy rối',
    icon: '⛔',
    description: 'Tin nhắn khiếm nhã, đe dọa, xúc phạm hoặc spam quảng cáo',
  },
  {
    key: 'other',
    label: 'Lý do khác',
    icon: '❓',
    description: 'Các vi phạm khác ảnh hưởng tới an toàn cộng đồng Trọ Việt',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { colors, isDark } = useTheme();
  const { submitReport } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('deposit_scam');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!details.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng cung cấp thêm mô tả chi tiết để giúp Ban kiểm duyệt xử lý chính xác.');
      return;
    }

    submitReport(targetType, targetId, targetTitle, selectedCategory, details);
    setIsSubmitted(true);
  };

  const handleFinish = () => {
    setIsSubmitted(false);
    setDetails('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Báo cáo vi phạm</Text>
          <View style={{ width: 50 }} />
        </View>

        {isSubmitted ? (
          <View style={styles.successContainer}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🛡️</Text>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
              Báo cáo đã được tiếp nhận
            </Text>
            <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
              Cảm ơn bạn đã đồng hành bảo vệ cộng đồng Trọ Việt an toàn, minh bạch. Ban kiểm duyệt sẽ thẩm định và xử lý đối tượng vi phạm trong vòng 24 giờ.
            </Text>
            <TouchableOpacity
              style={[styles.finishBtn, { backgroundColor: colors.primary }]}
              onPress={handleFinish}
            >
              <Text style={styles.finishBtnText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {/* Target Info Card */}
            <View style={[styles.targetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
                Đối tượng đang báo cáo:
              </Text>
              <Text style={[styles.targetValue, { color: colors.textPrimary }]}>
                {targetTitle}
              </Text>
            </View>

            {/* Category selection */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Chọn lý do vi phạm
            </Text>
            <View style={styles.categoriesList}>
              {REPORT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                        {cat.label}
                      </Text>
                      <Text style={[styles.categoryDesc, { color: colors.textSecondary }]}>
                        {cat.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Details Input */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>
              Mô tả chi tiết vi phạm
            </Text>
            <TextInput
              style={[
                styles.detailsInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Vui lòng cung cấp chi tiết sự việc, bằng chứng hoặc lời nhắn trao đổi bất thường..."
              placeholderTextColor={colors.textSecondary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />

            <View style={[styles.noticeBox, { backgroundColor: isDark ? '#232b20' : '#e6fcf5', borderColor: '#20c997' }]}>
              <Text style={{ fontSize: 13, color: isDark ? '#69db7c' : '#0ca678', lineHeight: 18 }}>
                🔒 Trọ Việt cam kết bảo mật danh tính người báo cáo. Thông tin chỉ được chuyển đến Ban Kiểm Duyệt nội bộ.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: details.trim() ? colors.error : colors.border },
              ]}
              onPress={handleSubmit}
              disabled={!details.trim()}
            >
              <Text style={styles.submitBtnText}>Gửi báo cáo vi phạm</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 10,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  targetCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  categoriesList: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  detailsInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  noticeBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  finishBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  finishBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
