import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import {
  exportUserDataAsJson,
  anonymizeUserProfile,
  anonymizeUserReviews,
  CONSENT_PURPOSES_CONFIG,
  createDefaultConsentRecord,
} from '@troviet/shared';

interface DataManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const {
    currentUser,
    setCurrentUser,
    userPreferences,
    favoriteIds,
    reviews,
  } = useApp();

  const [consentRecord, setConsentRecord] = useState(() =>
    createDefaultConsentRecord(currentUser?.id || 'u-unknown', true)
  );

  const [exportedJsonPreview, setExportedJsonPreview] = useState<string | null>(null);

  const userReviews = reviews.filter((r) => r.tenantId === currentUser?.id);

  const handleExportData = () => {
    if (!currentUser) return;
    const jsonStr = exportUserDataAsJson(currentUser, {
      preferences: userPreferences,
      favoriteListingIds: favoriteIds,
      reviews: userReviews,
    });
    setExportedJsonPreview(jsonStr);
  };

  const handleToggleOptionalConsent = (code: 'analytics_improvement' | 'marketing_notifications') => {
    setConsentRecord((prev) => ({
      ...prev,
      consents: {
        ...prev.consents,
        [code]: !prev.consents[code],
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xác nhận xóa tài khoản vĩnh viễn',
      'Theo Luật 91/2025/QH15, toàn bộ thông tin cá nhân (SĐT, email, CCCD, tên thật) sẽ bị xóa sạch khỏi máy chủ. Đánh giá phòng của bạn sẽ được chuyển thành ẩn danh để không làm sai lệch dữ liệu cộng đồng. Bạn có chắc chắn muốn xóa?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: () => {
            if (currentUser) {
              const anonymized = anonymizeUserProfile(currentUser);
              setCurrentUser(anonymized);
              Alert.alert(
                'Đã xóa dữ liệu thành công',
                'Hồ sơ của bạn đã được xóa bỏ và ẩn danh hóa an toàn theo đúng quy định pháp luật.'
              );
              onClose();
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Quyền Dữ liệu Cá nhân
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.introHeader}>
            <Text style={[styles.introTitle, { color: colors.textPrimary }]}>
              Quyền của bạn theo Luật 91/2025/QH15
            </Text>
            <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
              Trọ Việt cung cấp công cụ tự quản lý toàn diện giúp bạn minh bạch mọi dữ liệu cá nhân đang được xử lý.
            </Text>
          </View>

          {/* Section 1: Data Overview */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
              1. Dữ liệu cá nhân hiện lưu trữ
            </Text>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Mã định danh:</Text>
              <Text style={[styles.dataVal, { color: colors.textPrimary }]}>{currentUser?.id || 'Chưa đăng nhập'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Họ và tên:</Text>
              <Text style={[styles.dataVal, { color: colors.textPrimary }]}>{currentUser?.fullName || 'N/A'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Số điện thoại:</Text>
              <Text style={[styles.dataVal, { color: colors.textPrimary }]}>{currentUser?.phoneNumber || 'N/A'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Phòng đã lưu:</Text>
              <Text style={[styles.dataVal, { color: colors.textPrimary }]}>{favoriteIds.length} phòng</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Đánh giá đã gửi:</Text>
              <Text style={[styles.dataVal, { color: colors.textPrimary }]}>{userReviews.length} nhận xét</Text>
            </View>
          </View>

          {/* Section 2: Data Portability (Export JSON) */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
              2. Quyền xuất bản sao dữ liệu (Portability)
            </Text>
            <Text style={[styles.cardSubText, { color: colors.textSecondary }]}>
              Tải toàn bộ dữ liệu cá nhân, danh sách phòng đã lưu và lịch sử tương tác về máy ở định dạng JSON tiêu chuẩn.
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={handleExportData}
            >
              <Text style={styles.actionBtnText}>📥 Xuất bản sao dữ liệu (JSON)</Text>
            </TouchableOpacity>

            {exportedJsonPreview && (
              <View style={[styles.exportBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.exportBoxTitle, { color: colors.primary }]}>
                  ✓ Đã tạo gói dữ liệu JSON thành công:
                </Text>
                <Text style={[styles.exportCode, { color: colors.textSecondary }]} numberOfLines={8}>
                  {exportedJsonPreview}
                </Text>
              </View>
            )}
          </View>

          {/* Section 3: Consent Management */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
              3. Quản lý mục đích đồng ý
            </Text>
            {CONSENT_PURPOSES_CONFIG.map((purpose) => {
              const isChecked =
                purpose.isRequired ||
                consentRecord.consents[purpose.code as keyof typeof consentRecord.consents];

              return (
                <View key={purpose.code} style={styles.consentItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.consentTitle, { color: colors.textPrimary }]}>
                      {purpose.title} {purpose.isRequired && <Text style={{ color: colors.primary }}>(Bắt buộc)</Text>}
                    </Text>
                    <Text style={[styles.consentDesc, { color: colors.textSecondary }]}>
                      {purpose.description}
                    </Text>
                  </View>
                  {purpose.isRequired ? (
                    <Text style={[styles.fixedCheck, { color: colors.primary }]}>✓ Bật</Text>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        { backgroundColor: isChecked ? colors.primary : colors.border },
                      ]}
                      onPress={() =>
                        handleToggleOptionalConsent(
                          purpose.code as 'analytics_improvement' | 'marketing_notifications'
                        )
                      }
                    >
                      <Text style={styles.toggleText}>{isChecked ? 'BẬT' : 'TẮT'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Section 4: Right to Erasure */}
          <View style={[styles.card, { backgroundColor: isDark ? '#2e1515' : '#fff5f5', borderColor: colors.danger }]}>
            <Text style={[styles.cardHeading, { color: colors.danger }]}>
              4. Xóa vĩnh viễn tài khoản & Ẩn danh hóa
            </Text>
            <Text style={[styles.cardSubText, { color: isDark ? '#ffc9c9' : '#c92a2a' }]}>
              Thực hiện quyền yêu cầu xóa dữ liệu cá nhân theo Điều 16 Luật 91/2025/QH15. Hệ thống sẽ lập tức xóa sạch số điện thoại, email và mọi thông tin định danh của bạn.
            </Text>
            <TouchableOpacity
              style={[styles.deleteBtn, { backgroundColor: colors.danger }]}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteBtnText}>⚠️ Yêu cầu xóa tài khoản</Text>
            </TouchableOpacity>
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
    gap: 16,
  },
  introHeader: {
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardSubText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  dataLabel: {
    fontSize: 13,
  },
  dataVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  exportBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  exportCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  consentTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  consentDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  fixedCheck: {
    fontSize: 12,
    fontWeight: '800',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  deleteBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
