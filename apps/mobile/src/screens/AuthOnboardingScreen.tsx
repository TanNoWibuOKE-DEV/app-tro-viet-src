import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { PropertyType, UserRole } from '@troviet/shared';

const PREFERRED_TYPES: Array<{ type: PropertyType; label: string }> = [
  { type: 'room', label: 'Phòng trọ' },
  { type: 'apartment', label: 'Căn hộ mini' },
  { type: 'house', label: 'Nhà nguyên căn' },
  { type: 'shared', label: 'Ở ghép' },
];

const BUDGET_OPTIONS = [
  { label: 'Dưới 2 triệu', max: 2000000 },
  { label: '2 - 3,5 triệu', max: 3500000 },
  { label: '3,5 - 5 triệu', max: 5000000 },
  { label: 'Trên 5 triệu', max: 10000000 },
];

const PREFERRED_WARDS = [
  { code: '48_HAICHAU1', name: 'Phường Hải Châu I (Trung tâm)' },
  { code: '48_PHUOCMY', name: 'Phường Phước Mỹ (Gần biển Mỹ Khê)' },
  { code: '48_HOAKHANHBAC', name: 'Phường Hòa Khánh Bắc (Khu ĐH Bách Khoa)' },
  { code: '48_HOACUONGNAM', name: 'Phường Hòa Cường Nam' },
];

export const AuthOnboardingScreen: React.FC = () => {
  const { colors } = useTheme();
  const { currentUser, mockLoginAs, userPreferences, setUserPreferences } = useApp();

  // Onboarding state
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(
    userPreferences?.preferredPropertyTypes || ['room']
  );
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(1);
  const [selectedWardCodes, setSelectedWardCodes] = useState<string[]>(
    userPreferences?.preferredWardCodes || ['48_HAICHAU1']
  );

  const toggleType = (t: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const toggleWard = (code: string) => {
    setSelectedWardCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSavePreferences = () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Chưa chọn loại phòng', 'Vui lòng chọn ít nhất 1 loại hình phòng trọ mong muốn.');
      return;
    }

    setUserPreferences({
      userId: currentUser?.id || 'u-1',
      preferredPropertyTypes: selectedTypes,
      maxPrice: BUDGET_OPTIONS[selectedBudgetIndex].max,
      preferredWardCodes: selectedWardCodes,
    });

    Alert.alert('Đã lưu nhu cầu tìm trọ', 'Hệ thống sẽ ưu tiên gợi ý các căn phòng phù hợp nhất với bạn.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Account Info Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.userRow}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{currentUser?.fullName.charAt(0) || 'U'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{currentUser?.fullName}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{currentUser?.email}</Text>
            <View style={{ marginTop: 4 }}>
              <Badge level={currentUser?.verificationLevel || 'none'} />
            </View>
          </View>
        </View>

        {/* Fast Role Switcher */}
        <View style={[styles.roleSwitchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.roleSwitchTitle, { color: colors.textSecondary }]}>
            Chuyển đổi góc nhìn vai trò (Dành cho thử nghiệm):
          </Text>
          <View style={styles.roleBtnRow}>
            {[
              { role: 'tenant', label: '👤 Người thuê' },
              { role: 'landlord', label: '🏠 Chủ trọ' },
              { role: 'admin', label: '🛡️ Quản trị viên' },
            ].map((item) => {
              const active = currentUser?.role === item.role;
              return (
                <TouchableOpacity
                  key={item.role}
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => mockLoginAs(item.role as UserRole)}
                >
                  <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Onboarding Preferences Survey */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          🎯 Nhu cầu tìm trọ của bạn (Onboarding)
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          3 câu hỏi nhanh giúp Trọ Việt cá nhân hóa kết quả tìm kiếm ngay lập tức.
        </Text>

        {/* Question 1: Property Types */}
        <Text style={[styles.qTitle, { color: colors.textPrimary }]}>
          1. Bạn đang tìm loại phòng nào?
        </Text>
        <View style={styles.optionsWrap}>
          {PREFERRED_TYPES.map((t) => {
            const checked = selectedTypes.includes(t.type);
            return (
              <TouchableOpacity
                key={t.type}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: checked ? colors.primary : colors.background,
                    borderColor: checked ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleType(t.type)}
              >
                <Text style={{ color: checked ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  {checked ? '✓ ' : '+ '}
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Question 2: Monthly Budget */}
        <Text style={[styles.qTitle, { color: colors.textPrimary, marginTop: 16 }]}>
          2. Ngân sách tiền phòng hàng tháng tối đa?
        </Text>
        <View style={styles.optionsWrap}>
          {BUDGET_OPTIONS.map((b, idx) => {
            const active = selectedBudgetIndex === idx;
            return (
              <TouchableOpacity
                key={b.label}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: active ? colors.primary : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedBudgetIndex(idx)}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Question 3: Preferred Wards */}
        <Text style={[styles.qTitle, { color: colors.textPrimary, marginTop: 16 }]}>
          3. Khu vực bạn ưu tiên tại TP. Đà Nẵng?
        </Text>
        <View style={styles.optionsWrap}>
          {PREFERRED_WARDS.map((w) => {
            const checked = selectedWardCodes.includes(w.code);
            return (
              <TouchableOpacity
                key={w.code}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: checked ? colors.primary : colors.background,
                    borderColor: checked ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleWard(w.code)}
              >
                <Text style={{ color: checked ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  {checked ? '✓ ' : '+ '}
                  {w.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 20 }}>
          <Button title="Lưu nhu cầu & Xem phòng phù hợp" variant="primary" onPress={handleSavePreferences} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  roleSwitchBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 6,
  },
  roleSwitchTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 16,
  },
  qTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
