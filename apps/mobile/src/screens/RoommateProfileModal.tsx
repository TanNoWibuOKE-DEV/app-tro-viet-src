import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  RoommateProfile,
  calculateRoommateCompatibility,
  formatVND,
} from '@troviet/shared';

interface RoommateProfileModalProps {
  visible: boolean;
  candidate: RoommateProfile | null;
  onClose: () => void;
  onStartChat?: (candidate: RoommateProfile) => void;
}

export const RoommateProfileModal: React.FC<RoommateProfileModalProps> = ({
  visible,
  candidate,
  onClose,
  onStartChat,
}) => {
  const { colors, isDark } = useTheme();
  const { userRoommateProfile, roommateProfiles } = useApp();

  // If currentUser has no profile yet, use the first mock profile as reference for comparison
  const myProfile = userRoommateProfile || roommateProfiles[0];

  const compatibility = useMemo(() => {
    if (!candidate || !myProfile) return null;
    return calculateRoommateCompatibility(myProfile, candidate);
  }, [candidate, myProfile]);

  if (!candidate) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'excellent':
        return '#137333';
      case 'good':
        return '#0066CC';
      case 'moderate':
        return '#B06000';
      default:
        return '#C5221F';
    }
  };

  const getSleepText = (schedule: string) => {
    switch (schedule) {
      case 'early_bird':
        return '🌅 Ngủ sớm dậy sớm';
      case 'night_owl':
        return '🌙 Cú đêm học/làm muộn';
      default:
        return '⏰ Giờ giấc linh hoạt';
    }
  };

  const getSmokingText = (habit: string) => {
    switch (habit) {
      case 'no_smoking':
        return '🚭 Tuyệt đối không thuốc lá';
      case 'balcony_only':
        return '🌿 Chỉ hút ngoài ban công';
      default:
        return '🚬 Thoải mái thuốc lá';
    }
  };

  const getPetText = (habit: string) => {
    switch (habit) {
      case 'no_pets':
        return '🚫 Không nuôi thú cưng';
      case 'has_cats':
        return '🐱 Nuôi mèo cưng';
      case 'has_dogs':
        return '🐶 Nuôi cún cưng';
      default:
        return '🐾 Yêu thích động vật';
    }
  };

  const getCleanText = (level: string) => {
    switch (level) {
      case 'neat_freak':
        return '✨ Rất sạch sẽ, ngăn nắp';
      case 'moderate':
        return '🧹 Gọn gàng vừa phải';
      default:
        return '🛋️ Thoải mái, tự do';
    }
  };

  const handleChat = () => {
    if (onStartChat) {
      onStartChat(candidate);
    } else {
      Alert.alert(
        'Bắt đầu trò chuyện',
        `Mở cuộc trò chuyện tìm hiểu với bạn ${candidate.displayName}? Bạn nên trao đổi thêm về thói quen sinh hoạt trước khi quyết định ký hợp đồng chung.`,
        [{ text: 'Đóng' }]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Hồ sơ ở ghép</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Candidate Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.userRow}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{candidate.displayName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.displayName, { color: colors.textPrimary }]}>{candidate.displayName}</Text>
                  {candidate.age && (
                    <Text style={[styles.ageText, { color: colors.textSecondary }]}>({candidate.age} tuổi)</Text>
                  )}
                </View>
                <Text style={[styles.occupation, { color: colors.textSecondary }]}>{candidate.occupation}</Text>
                <Text style={[styles.genderTag, { color: colors.primary }]}>
                  {candidate.gender === 'male' ? 'Nam' : candidate.gender === 'female' ? 'Nữ' : 'Khác'}
                  {candidate.genderPreference !== 'any'
                    ? ` • Tìm bạn cùng phòng: ${candidate.genderPreference === 'male_only' ? 'Nam' : 'Nữ'}`
                    : ' • Tìm bạn cùng phòng: Nam/Nữ đều được'}
                </Text>
              </View>
            </View>

            <View style={styles.budgetRow}>
              <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Ngân sách tối đa:</Text>
              <Text style={[styles.budgetValue, { color: colors.primary }]}>{formatVND(candidate.budgetMonthlyMax)}/tháng</Text>
            </View>

            {candidate.hasRoom ? (
              <View style={[styles.roomBanner, { backgroundColor: isDark ? '#143321' : '#E6F4EA' }]}>
                <Text style={[styles.roomBannerText, { color: '#137333' }]}>
                  🏠 Đã có phòng sẵn: {candidate.existingListingTitle || 'Căn hộ mini / phòng trọ'}
                </Text>
              </View>
            ) : (
              <View style={[styles.roomBanner, { backgroundColor: isDark ? '#1C2738' : '#EEF5FF' }]}>
                <Text style={[styles.roomBannerText, { color: colors.primary }]}>
                  🔍 Đang tìm phòng cùng bạn mới
                </Text>
              </View>
            )}

            <Text style={[styles.bioText, { color: colors.textPrimary }]}>"{candidate.bio}"</Text>
          </View>

          {/* AI Compatibility Analysis Panel */}
          {compatibility && (
            <View style={[styles.aiCard, { backgroundColor: isDark ? '#1C2738' : '#EEF5FF', borderColor: colors.primary }]}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiHeaderTitle}>🤖 Đánh giá độ hòa hợp sinh hoạt</Text>
                <View style={[styles.tierBadge, { backgroundColor: getTierColor(compatibility.compatibilityTier) }]}>
                  <Text style={styles.tierBadgeText}>{compatibility.tierLabel}</Text>
                </View>
              </View>

              {/* Strengths */}
              {compatibility.matchingStrengths.length > 0 && (
                <View style={styles.pointsBlock}>
                  <Text style={styles.strengthsTitle}>✨ Điểm tương đồng hòa hợp ({compatibility.matchingStrengths.length}):</Text>
                  {compatibility.matchingStrengths.map((str, idx) => (
                    <View key={idx} style={styles.pointRow}>
                      <Text style={[styles.bullet, { color: '#137333' }]}>✓</Text>
                      <Text style={[styles.pointText, { color: colors.textPrimary }]}>{str}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Points to discuss */}
              {compatibility.pointsToDiscuss.length > 0 && (
                <View style={[styles.pointsBlock, { marginTop: 10 }]}>
                  <Text style={styles.discussTitle}>💬 Điểm nên trò chuyện thống nhất trước:</Text>
                  {compatibility.pointsToDiscuss.map((pt, idx) => (
                    <View key={idx} style={styles.pointRow}>
                      <Text style={[styles.bullet, { color: '#B06000' }]}>•</Text>
                      <Text style={[styles.pointText, { color: colors.textPrimary }]}>{pt}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.privacyNote}>
                <Text style={[styles.privacyNoteText, { color: colors.textSecondary }]}>
                  🛡️ Điểm số tính toán dựa trên thói quen sinh hoạt công khai. Trọ Việt khuyến khích hai bên trò chuyện kỹ trước khi ký hợp đồng thuê chung.
                </Text>
              </View>
            </View>
          )}

          {/* Living Habits Breakdown */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🏡 Thói quen sinh hoạt chi tiết</Text>

            <View style={styles.habitRow}>
              <Text style={[styles.habitKey, { color: colors.textSecondary }]}>Nhịp sinh hoạt:</Text>
              <Text style={[styles.habitVal, { color: colors.textPrimary }]}>{getSleepText(candidate.sleepSchedule)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.habitRow}>
              <Text style={[styles.habitKey, { color: colors.textSecondary }]}>Khói thuốc lá:</Text>
              <Text style={[styles.habitVal, { color: colors.textPrimary }]}>{getSmokingText(candidate.smokingHabit)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.habitRow}>
              <Text style={[styles.habitKey, { color: colors.textSecondary }]}>Thú cưng:</Text>
              <Text style={[styles.habitVal, { color: colors.textPrimary }]}>{getPetText(candidate.petHabit)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.habitRow}>
              <Text style={[styles.habitKey, { color: colors.textSecondary }]}>Mức độ ngăn nắp:</Text>
              <Text style={[styles.habitVal, { color: colors.textPrimary }]}>{getCleanText(candidate.cleanlinessLevel)}</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={{ marginTop: 8, marginBottom: 20 }}>
            <Button
              title={`💬 Nhắn tin tìm hiểu với ${candidate.displayName}`}
              onPress={handleChat}
              variant="primary"
            />
          </View>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
  },
  ageText: {
    fontSize: 14,
  },
  occupation: {
    fontSize: 13,
    marginTop: 2,
  },
  genderTag: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  budgetLabel: {
    fontSize: 13,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  roomBanner: {
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  roomBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontStyle: 'italic',
    marginTop: 6,
  },
  aiCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0066CC',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pointsBlock: {
    marginBottom: 4,
  },
  strengthsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#137333',
    marginBottom: 6,
  },
  discussTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B06000',
    marginBottom: 6,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  pointText: {
    fontSize: 12.5,
    flex: 1,
    lineHeight: 18,
  },
  privacyNote: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 8,
    marginTop: 8,
  },
  privacyNoteText: {
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  habitKey: {
    fontSize: 13,
  },
  habitVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
});
