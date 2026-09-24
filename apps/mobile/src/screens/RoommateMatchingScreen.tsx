import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  RoommateProfile,
  calculateRoommateCompatibility,
  formatVND,
  SleepSchedule,
  SmokingHabit,
  PetHabit,
  CleanlinessLevel,
  GenderPreference,
} from '@troviet/shared';
import { RoommateProfileModal } from './RoommateProfileModal';

interface RoommateMatchingScreenProps {
  visible: boolean;
  onClose: () => void;
  onStartChat?: (candidate: RoommateProfile) => void;
}

export const RoommateMatchingScreen: React.FC<RoommateMatchingScreenProps> = ({
  visible,
  onClose,
  onStartChat,
}) => {
  const { colors, isDark } = useTheme();
  const { roommateProfiles, userRoommateProfile, createRoommateProfile, currentUser } = useApp();

  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<RoommateProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formDisplayName, setFormDisplayName] = useState(currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Bạn mới');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formAge, setFormAge] = useState('22');
  const [formOccupation, setFormOccupation] = useState('Sinh viên');
  const [formBudget, setFormBudget] = useState('1800000');
  const [formSleep, setFormSleep] = useState<SleepSchedule>('flexible');
  const [formSmoking, setFormSmoking] = useState<SmokingHabit>('no_smoking');
  const [formPet, setFormPet] = useState<PetHabit>('no_pets');
  const [formClean, setFormClean] = useState<CleanlinessLevel>('moderate');
  const [formGenderPref, setFormGenderPref] = useState<GenderPreference>('any');
  const [formBio, setFormBio] = useState('Tính tình vui vẻ, hòa đồng, muốn tìm bạn cùng phòng lâu dài.');

  const myProfile = userRoommateProfile || roommateProfiles[0];

  const filteredCandidates = useMemo(() => {
    return roommateProfiles.filter((p) => {
      if (currentUser && p.userId === currentUser.id) return false; // don't show self in candidate feed
      if (!p.isActive) return false;
      if (selectedGender !== 'all' && p.gender !== selectedGender) return false;
      if (selectedWard !== 'all' && !p.targetWards.includes(selectedWard)) return false;
      return true;
    });
  }, [roommateProfiles, currentUser, selectedGender, selectedWard]);

  const handleCreateSubmit = () => {
    const budget = parseInt(formBudget, 10);
    if (isNaN(budget) || budget <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập mức ngân sách hợp lệ.');
      return;
    }

    createRoommateProfile({
      userId: currentUser?.id || `user-${Date.now()}`,
      displayName: formDisplayName.trim(),
      gender: formGender,
      age: parseInt(formAge, 10) || 20,
      occupation: formOccupation.trim(),
      budgetMonthlyMax: budget,
      targetWards: ['48_HOAKHANHBAC', '48_HAICHAU1'],
      sleepSchedule: formSleep,
      smokingHabit: formSmoking,
      petHabit: formPet,
      cleanlinessLevel: formClean,
      genderPreference: formGenderPref,
      bio: formBio.trim(),
      hasRoom: false,
      isActive: true,
    });

    setShowCreateModal(false);
    Alert.alert('Thành công', 'Hồ sơ tìm người ở ghép của bạn đã được đăng thành công!');
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Tìm người ở ghép</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
            <Text style={[styles.addBtnText, { color: colors.primary }]}>➕ Đăng hồ sơ</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Intro Banner */}
          <View style={[styles.banner, { backgroundColor: isDark ? '#1C2738' : '#EEF5FF', borderColor: colors.primary }]}>
            <Text style={[styles.bannerTitle, { color: colors.primary }]}>🤝 Ghép ở ghép thông minh Trọ Việt</Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Tính toán độ hòa hợp dựa trên thói quen thức ngủ, khói thuốc lá, thú cưng và ngân sách đóng góp minh bạch.
            </Text>
          </View>

          {/* Gender Filter Pills */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Lọc theo giới tính:</Text>
            <View style={styles.pillsRow}>
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'male', label: 'Chỉ Nam' },
                { key: 'female', label: 'Chỉ Nữ' },
              ].map((item) => {
                const active = selectedGender === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setSelectedGender(item.key as any)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: active ? '#FFFFFF' : colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Ward Filter Pills */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Khu vực mong muốn:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardScroll}>
              {[
                { code: 'all', name: 'Toàn TP. Đà Nẵng' },
                { code: '48_HOAKHANHBAC', name: 'Hòa Khánh Bắc (ĐH Bách Khoa)' },
                { code: '48_HAICHAU1', name: 'Hải Châu 1 (Trung tâm)' },
                { code: '48_PHUOCMY', name: 'Phước Mỹ (Gần biển)' },
                { code: '48_HOACUONGNAM', name: 'Hòa Cường Nam' },
              ].map((w) => {
                const active = selectedWard === w.code;
                return (
                  <TouchableOpacity
                    key={w.code}
                    onPress={() => setSelectedWard(w.code)}
                    style={[
                      styles.wardPill,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: active ? '#FFFFFF' : colors.textPrimary }]}>
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Candidates List */}
          <Text style={[styles.listHeading, { color: colors.textSecondary }]}>
            Danh sách người tìm ở ghép ({filteredCandidates.length}):
          </Text>

          {filteredCandidates.map((candidate) => {
            const comp = myProfile ? calculateRoommateCompatibility(myProfile, candidate) : null;
            return (
              <TouchableOpacity
                key={candidate.id}
                onPress={() => setSelectedCandidate(candidate)}
                style={[styles.candidateCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.candidateHeader}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{candidate.displayName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.candidateName, { color: colors.textPrimary }]}>
                        {candidate.displayName}
                      </Text>
                      {comp && (
                        <View
                          style={[
                            styles.compBadge,
                            {
                              backgroundColor:
                                comp.compatibilityScore >= 80 ? '#137333' : comp.compatibilityScore >= 60 ? '#0066CC' : '#B06000',
                            },
                          ]}
                        >
                          <Text style={styles.compBadgeText}>
                            {comp.compatibilityScore}% hòa hợp
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.candidateSub, { color: colors.textSecondary }]}>
                      {candidate.occupation} {candidate.age ? `• ${candidate.age} tuổi` : ''} • {candidate.gender === 'male' ? 'Nam' : 'Nữ'}
                    </Text>
                  </View>
                </View>

                {/* Habit Badges Row */}
                <View style={styles.tagsRow}>
                  <View style={[styles.tag, { backgroundColor: isDark ? '#1F2937' : '#F1F3F4' }]}>
                    <Text style={[styles.tagText, { color: colors.textPrimary }]}>
                      {candidate.smokingHabit === 'no_smoking' ? '🚭 Không khói thuốc' : '🚬 Có hút thuốc'}
                    </Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: isDark ? '#1F2937' : '#F1F3F4' }]}>
                    <Text style={[styles.tagText, { color: colors.textPrimary }]}>
                      {candidate.sleepSchedule === 'night_owl' ? '🌙 Cú đêm' : '🌅 Ngủ sớm'}
                    </Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: isDark ? '#1F2937' : '#F1F3F4' }]}>
                    <Text style={[styles.tagText, { color: colors.textPrimary }]}>
                      {candidate.petHabit === 'no_pets' ? '🚫 Không thú cưng' : '🐾 Yêu thú cưng'}
                    </Text>
                  </View>
                </View>

                <View style={styles.budgetRow}>
                  <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Ngân sách đóng góp:</Text>
                  <Text style={[styles.budgetValue, { color: colors.primary }]}>{formatVND(candidate.budgetMonthlyMax)}/tháng</Text>
                </View>

                <Text style={[styles.bioPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                  "{candidate.bio}"
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={[styles.detailLink, { color: colors.primary }]}>Xem chi tiết độ hòa hợp →</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Modal: Roommate Profile & AI Match Review */}
        <RoommateProfileModal
          visible={!!selectedCandidate}
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStartChat={onStartChat}
        />

        {/* Modal: Create Profile Form */}
        <Modal visible={showCreateModal} animationType="slide">
          <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Tạo hồ sơ tìm ở ghép</Text>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.formLabel, { color: colors.textPrimary }]}>Tên hiển thị / Biệt danh:</Text>
                <TextInput
                  value={formDisplayName}
                  onChangeText={setFormDisplayName}
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                />

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Giới tính:</Text>
                <View style={styles.pillsRow}>
                  <TouchableOpacity
                    onPress={() => setFormGender('male')}
                    style={[styles.pill, { backgroundColor: formGender === 'male' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formGender === 'male' ? '#FFFFFF' : colors.textPrimary }}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormGender('female')}
                    style={[styles.pill, { backgroundColor: formGender === 'female' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formGender === 'female' ? '#FFFFFF' : colors.textPrimary }}>Nữ</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Nghề nghiệp / Trường học:</Text>
                <TextInput
                  value={formOccupation}
                  onChangeText={setFormOccupation}
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                  placeholder="e.g. Sinh viên ĐH Bách Khoa"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Ngân sách tối đa hàng tháng (đ):</Text>
                <TextInput
                  value={formBudget}
                  onChangeText={setFormBudget}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                />

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Thói quen thức ngủ:</Text>
                <View style={styles.pillsRow}>
                  <TouchableOpacity
                    onPress={() => setFormSleep('early_bird')}
                    style={[styles.pill, { backgroundColor: formSleep === 'early_bird' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formSleep === 'early_bird' ? '#FFFFFF' : colors.textPrimary }}>Ngủ sớm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormSleep('night_owl')}
                    style={[styles.pill, { backgroundColor: formSleep === 'night_owl' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formSleep === 'night_owl' ? '#FFFFFF' : colors.textPrimary }}>Cú đêm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormSleep('flexible')}
                    style={[styles.pill, { backgroundColor: formSleep === 'flexible' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formSleep === 'flexible' ? '#FFFFFF' : colors.textPrimary }}>Linh hoạt</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Khói thuốc lá:</Text>
                <View style={styles.pillsRow}>
                  <TouchableOpacity
                    onPress={() => setFormSmoking('no_smoking')}
                    style={[styles.pill, { backgroundColor: formSmoking === 'no_smoking' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formSmoking === 'no_smoking' ? '#FFFFFF' : colors.textPrimary }}>Không thuốc lá</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormSmoking('balcony_only')}
                    style={[styles.pill, { backgroundColor: formSmoking === 'balcony_only' ? colors.primary : colors.background, borderColor: colors.border }]}
                  >
                    <Text style={{ color: formSmoking === 'balcony_only' ? '#FFFFFF' : colors.textPrimary }}>Ngoài ban công</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Giới thiệu ngắn về bản thân:</Text>
                <TextInput
                  value={formBio}
                  onChangeText={setFormBio}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                />

                <View style={{ marginTop: 20 }}>
                  <Button
                    title="🚀 Xuất bản hồ sơ ở ghép"
                    onPress={handleCreateSubmit}
                    variant="primary"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
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
  addBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  wardScroll: {
    flexDirection: 'row',
  },
  wardPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  listHeading: {
    fontSize: 13,
    marginBottom: 10,
    marginTop: 6,
  },
  candidateCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
  },
  candidateSub: {
    fontSize: 12,
    marginTop: 2,
  },
  compBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  budgetLabel: {
    fontSize: 12,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  bioPreview: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  detailLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
});
