import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { DataManagementModal } from './DataManagementModal';
import { LandlordDashboardScreen } from './LandlordDashboardScreen';
import { ContractDetailModal } from './ContractDetailModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { AreaInsightsModal } from './AreaInsightsModal';
import { RoommateMatchingScreen } from './RoommateMatchingScreen';
import { ViewingHandoverModal } from './ViewingHandoverModal';
import { PropertyType, UserRole, RentalContract, RentInvoice } from '@troviet/shared';

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
  const { currentUser, mockLoginAs, userPreferences, setUserPreferences, contracts, invoices } = useApp();

  // Onboarding state
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(
    userPreferences?.preferredPropertyTypes || ['room']
  );
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(1);
  const [selectedWardCodes, setSelectedWardCodes] = useState<string[]>(
    userPreferences?.preferredWardCodes || ['48_HAICHAU1']
  );
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  // Phase 6 & 7 modals state
  const [isLandlordDashboardOpen, setIsLandlordDashboardOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<RentInvoice | null>(null);
  const [isAreaInsightsOpen, setIsAreaInsightsOpen] = useState(false);
  const [isRoommateMatchingOpen, setIsRoommateMatchingOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

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

      {/* Phase 6: Rent & Tenancy Management Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          🏢 Quản lý Thuê & Hợp đồng Trọ Việt
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Hợp đồng điện tử minh bạch, phân tích điều khoản bằng AI và thanh toán VietQR NAPAS 24/7.
        </Text>

        <View style={{ gap: 10 }}>
          {currentUser?.role === 'landlord' ? (
            <Button
              title="🏠 Bảng điều khiển Chủ trọ (Hợp đồng & Hóa đơn)"
              variant="primary"
              onPress={() => setIsLandlordDashboardOpen(true)}
            />
          ) : (
            <>
              <Button
                title={`📑 Hợp đồng thuê của tôi (${contracts.length})`}
                variant="primary"
                onPress={() => {
                  if (contracts.length > 0) {
                    setSelectedContract(contracts[0]);
                  } else {
                    Alert.alert('Chưa có hợp đồng', 'Hiện bạn chưa có hợp đồng thuê nào.');
                  }
                }}
              />
              <Button
                title={`💳 Hóa đơn tiền phòng & VietQR (${invoices.length})`}
                variant="secondary"
                onPress={() => {
                  if (invoices.length > 0) {
                    setSelectedInvoice(invoices[0]);
                  } else {
                    Alert.alert('Chưa có hóa đơn', 'Hiện bạn chưa có hóa đơn tiền phòng nào.');
                  }
                }}
              />
            </>
          )}

          <Button
            title="📊 Xem mặt bằng giá thị trường Đà Nẵng (6 tháng)"
            variant="outline"
            onPress={() => setIsAreaInsightsOpen(true)}
          />

          <Button
            title="🤝 Tìm bạn ở ghép (AI Habit Match)"
            variant="secondary"
            onPress={() => setIsRoommateMatchingOpen(true)}
          />

          <Button
            title="📋 Biên bản bàn giao nhận phòng & Công tơ"
            variant="outline"
            onPress={() => setIsHandoverOpen(true)}
          />
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

      {/* L2 Landlord Verification Application */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          🛡️ Xác minh danh tính chủ nhà (Cấp L2)
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Tăng độ tin cậy của tin đăng và nhận huy hiệu xanh xác thực danh tính.
        </Text>

        {currentUser?.verificationLevel === 'L2' || currentUser?.verificationLevel === 'L3' ? (
          <View style={[styles.l2SuccessBox, { backgroundColor: colors.badgeL2 }]}>
            <Text style={{ color: colors.badgeL2Text, fontWeight: '800', fontSize: 14 }}>
              ✓ Bạn đã đạt cấp L2 — Danh tính chủ trọ đã xác minh thành công!
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Họ và tên theo CCCD:</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={{ color: colors.textPrimary }}>{currentUser?.fullName}</Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Số căn cước công dân (12 số):</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={{ color: colors.textPrimary }}>048185001234</Text>
            </View>

            <View style={[styles.docPreview, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                📄 Đã tải lên ảnh mặt trước & sau CCCD [MẪU - DEV]
              </Text>
            </View>

            <Button
              title="Gửi hồ sơ kiểm duyệt L2"
              variant="primary"
              onPress={() => {
                Alert.alert(
                  'Gửi yêu cầu xác minh L2',
                  'Hồ sơ định danh của bạn đã được chuyển đến Ban quản trị Trọ Việt để đối soát.',
                  [{ text: 'Đã hiểu' }]
                );
              }}
            />
          </View>
        )}
      </View>

      {/* Privacy and Data Rights Section (Law 91/2025/QH15) */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          ⚖️ Bảo mật & Quyền riêng tư (Luật 91/2025/QH15)
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Minh bạch dữ liệu thu thập, quyền xuất bản sao dữ liệu và quyền yêu cầu xóa tài khoản.
        </Text>

        <View style={{ gap: 10 }}>
          <Button
            title="🛡️ Chính sách quyền riêng tư & Điều khoản"
            variant="outline"
            onPress={() => setIsPrivacyPolicyOpen(true)}
          />

          <Button
            title="🔒 Quyền dữ liệu của tôi (Xuất JSON / Xóa tài khoản)"
            variant="secondary"
            onPress={() => setIsDataManagementOpen(true)}
          />
        </View>
      </View>

      {/* Modals */}
      <PrivacyPolicyModal
        visible={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      <DataManagementModal
        visible={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      {/* Phase 6 Modals */}
      <LandlordDashboardScreen
        visible={isLandlordDashboardOpen}
        onClose={() => setIsLandlordDashboardOpen(false)}
      />

      <ContractDetailModal
        visible={!!selectedContract}
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
      />

      <InvoiceDetailModal
        visible={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      <AreaInsightsModal
        visible={isAreaInsightsOpen}
        onClose={() => setIsAreaInsightsOpen(false)}
      />

      {/* Phase 7 Roommate Matching Modal */}
      <RoommateMatchingScreen
        visible={isRoommateMatchingOpen}
        onClose={() => setIsRoommateMatchingOpen(false)}
      />

      {/* Phase 7 Property Handover Modal */}
      <ViewingHandoverModal
        visible={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
      />
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
  l2SuccessBox: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBox: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  docPreview: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
