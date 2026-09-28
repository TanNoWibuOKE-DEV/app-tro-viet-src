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
import { Badge } from '../components/Badge';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { DataManagementModal } from './DataManagementModal';
import { LandlordDashboardScreen } from './LandlordDashboardScreen';
import { ContractDetailModal } from './ContractDetailModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { AreaInsightsModal } from './AreaInsightsModal';
import { RoommateMatchingScreen } from './RoommateMatchingScreen';
import { ViewingHandoverModal } from './ViewingHandoverModal';
import { AdminModerationScreen } from './AdminModerationScreen';
import { LandlordPostScreen } from './LandlordPostScreen';
import { UserRole, RentalContract, RentInvoice } from '@troviet/shared';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  isDestructive,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuTextCol}>
        <Text
          style={[
            styles.menuTitle,
            { color: isDestructive ? colors.error : colors.textPrimary },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {badge && (
        <View style={[styles.menuBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Text style={[styles.menuChevron, { color: colors.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
};

export const AuthOnboardingScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const {
    currentUser,
    mockLoginAs,
    contracts,
    invoices,
    verificationRequests,
    reports,
    listings,
  } = useApp();

  // Modals state
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isLandlordDashboardOpen, setIsLandlordDashboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<RentInvoice | null>(null);
  const [isAreaInsightsOpen, setIsAreaInsightsOpen] = useState(false);
  const [isRoommateMatchingOpen, setIsRoommateMatchingOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isL2ModalOpen, setIsL2ModalOpen] = useState(false);

  // Admin pending counts
  const pendingListings = listings.filter((l) => l.status === 'pending_review').length;
  const pendingVerifications = verificationRequests.filter((v) => v.status === 'pending').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const totalAdminTasks = pendingListings + pendingVerifications + pendingReports;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. User Hero Card (Section 27) */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {currentUser?.fullName.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {currentUser?.fullName || 'Người dùng'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {currentUser?.email || 'user@troviet.vn'}
            </Text>
            <View style={{ marginTop: 6 }}>
              <Badge level={currentUser?.verificationLevel || 'none'} />
            </View>
          </View>
        </View>

        {/* Landlord Mode Switcher (Section 28) */}
        {currentUser?.role === 'landlord' && (
          <View style={[styles.modeSwitchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.modeSwitchTitle, { color: colors.textSecondary }]}>
              Chế độ hiện tại:
            </Text>
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modePill, { backgroundColor: colors.primary }]}
                onPress={() => setIsLandlordDashboardOpen(true)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                  🏠 Mở bảng điều khiển Chủ trọ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Demo Fast Role Switcher */}
        <View style={[styles.roleSwitchContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.roleSwitchCaption, { color: colors.textSecondary }]}>
            Góc nhìn trải nghiệm (Dành cho thử nghiệm):
          </Text>
          <View style={styles.roleBtnGroup}>
            {[
              { role: 'tenant', label: '👤 Người thuê' },
              { role: 'landlord', label: '🏠 Chủ trọ' },
              { role: 'admin', label: '🛡️ Admin' },
            ].map((item) => {
              const active = currentUser?.role === item.role;
              return (
                <TouchableOpacity
                  key={item.role}
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.background,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => mockLoginAs(item.role as UserRole)}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : colors.textPrimary,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* 2. Group: Quản lý Thuê & Dịch vụ (Section 24, 26, 27) */}
      <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
          QUẢN LÝ THUÊ & DỊCH VỤ
        </Text>

        <MenuItem
          icon="📑"
          title="Hợp đồng của tôi"
          subtitle="Hợp đồng điện tử & Phân tích điều khoản bằng AI"
          badge={contracts.length > 0 ? `${contracts.length}` : undefined}
          onPress={() => {
            if (contracts.length > 0) {
              setSelectedContract(contracts[0]);
            } else {
              Alert.alert('Chưa có hợp đồng', 'Hiện bạn chưa có hợp đồng thuê nào trong hệ thống.');
            }
          }}
        />

        <MenuItem
          icon="💳"
          title="Hóa đơn & Thanh toán VietQR"
          subtitle="Thanh toán tiền phòng chuyển khoản 24/7"
          badge={invoices.length > 0 ? `${invoices.length}` : undefined}
          onPress={() => {
            if (invoices.length > 0) {
              setSelectedInvoice(invoices[0]);
            } else {
              Alert.alert('Chưa có hóa đơn', 'Hiện bạn chưa có hóa đơn tiền phòng nào.');
            }
          }}
        />

        <MenuItem
          icon="📋"
          title="Biên bản bàn giao nhận phòng"
          subtitle="Chốt chỉ số công tơ điện nước & tình trạng phòng"
          onPress={() => setIsHandoverOpen(true)}
        />

        <MenuItem
          icon="🤝"
          title="Tìm người ở ghép (AI Match)"
          subtitle="Gợi ý bạn cùng phòng hợp thói quen & ngân sách"
          onPress={() => setIsRoommateMatchingOpen(true)}
        />

        <MenuItem
          icon="📊"
          title="Mặt bằng giá thị trường các khu vực"
          subtitle="Biểu đồ xu hướng giá 6 tháng tại các phường"
          onPress={() => setIsAreaInsightsOpen(true)}
        />
      </View>

      {/* 3. Group: Tài khoản & Bảo mật (Section 27) */}
      <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
          TÀI KHOẢN & BẢO MẬT
        </Text>

        <MenuItem
          icon="🛡️"
          title="Xác minh danh tính CCCD (Cấp L2)"
          subtitle={
            currentUser?.verificationLevel === 'L2' || currentUser?.verificationLevel === 'L3'
              ? '✓ Bạn đã hoàn thành xác minh CCCD'
              : 'Gửi hồ sơ định danh nhận huy hiệu xanh'
          }
          onPress={() => setIsL2ModalOpen(true)}
        />

        <MenuItem
          icon="🔒"
          title="Quyền riêng tư & Quản lý dữ liệu"
          subtitle="Tuân thủ Luật 91/2025/QH15 (Xuất JSON / Xóa tài khoản)"
          onPress={() => setIsDataManagementOpen(true)}
        />

        <MenuItem
          icon="📄"
          title="Điều khoản dịch vụ & Chính sách"
          subtitle="Cam kết minh bạch và phòng ngừa lừa đảo"
          onPress={() => setIsPrivacyPolicyOpen(true)}
        />
      </View>

      {/* 4. Group: Quản trị & Hệ thống (Section 28 & 29) */}
      <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
          HỆ THỐNG
        </Text>

        {currentUser?.role === 'admin' && (
          <MenuItem
            icon="🛡️"
            title="Cổng Quản trị viên (Admin Moderation)"
            subtitle="Kiểm duyệt tin đăng, hồ sơ L2 và báo cáo vi phạm"
            badge={totalAdminTasks > 0 ? `${totalAdminTasks} cần duyệt` : undefined}
            onPress={() => setIsAdminOpen(true)}
          />
        )}

        {currentUser?.role === 'landlord' && (
          <MenuItem
            icon="➕"
            title="Đăng tin cho thuê mới"
            subtitle="Tạo tin đăng phòng trọ mới tại TP. Đà Nẵng"
            onPress={() => setIsPostOpen(true)}
          />
        )}

        <MenuItem
          icon="🚪"
          title="Đăng xuất"
          isDestructive={true}
          onPress={() => {
            Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive', onPress: () => Alert.alert('Đã đăng xuất') },
            ]);
          }}
        />
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

      <RoommateMatchingScreen
        visible={isRoommateMatchingOpen}
        onClose={() => setIsRoommateMatchingOpen(false)}
      />

      <ViewingHandoverModal
        visible={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
      />

      {/* Admin Moderation Modal */}
      <Modal visible={isAdminOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsAdminOpen(false)}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>← Đóng Admin</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Bảng điều khiển Admin</Text>
            <View style={{ width: 60 }} />
          </View>
          <AdminModerationScreen />
        </View>
      </Modal>

      {/* Landlord Post Modal */}
      <Modal visible={isPostOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsPostOpen(false)}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>← Đóng</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Đăng tin phòng trọ</Text>
            <View style={{ width: 40 }} />
          </View>
          <LandlordPostScreen onSuccess={() => setIsPostOpen(false)} />
        </View>
      </Modal>

      {/* L2 Verification Modal */}
      <Modal visible={isL2ModalOpen} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border, marginHorizontal: -20, marginTop: -20, marginBottom: 20 }]}>
            <TouchableOpacity onPress={() => setIsL2ModalOpen(false)}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>← Trở lại</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Xác minh CCCD</Text>
            <View style={{ width: 50 }} />
          </View>

          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 }}>
            🛡️ Hồ sơ xác thực danh tính (Cấp L2)
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
            Đối soát căn cước công dân gắn chip để tăng độ uy tín tài khoản trên Trọ Việt.
          </Text>

          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Họ và tên:</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
              {currentUser?.fullName}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Số CCCD (12 số):</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
              048185001234
            </Text>
            <Text style={{ fontSize: 12, color: colors.success, fontWeight: '700' }}>
              ✓ Đã tải ảnh mặt trước & mặt sau CCCD [MẪU - DEV]
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.l2SubmitBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setIsL2ModalOpen(false);
              Alert.alert('Đã gửi hồ sơ', 'Hồ sơ xác thực CCCD đã được gửi đến ban quản trị Trọ Việt để đối soát.');
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Gửi yêu cầu xác minh L2</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  profileCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  modeSwitchBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginTop: 14,
  },
  modeSwitchTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  modeToggleRow: {
    flexDirection: 'row',
  },
  modePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleSwitchContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 14,
  },
  roleSwitchCaption: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  menuGroup: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  menuChevron: {
    fontSize: 20,
    fontWeight: '400',
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  l2SubmitBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
});
