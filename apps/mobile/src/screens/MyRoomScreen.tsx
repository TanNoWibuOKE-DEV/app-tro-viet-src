import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { useResponsiveLayout } from '../utils/responsive';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { TenantLifeHubModal } from './TenantLifeHubModal';
import { ContractDetailModal } from './ContractDetailModal';
import { ViewingHandoverModal } from './ViewingHandoverModal';
import { formatVND } from '@troviet/shared';

export const MyRoomScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { contentMaxWidth } = useResponsiveLayout();
  const { invoices } = useApp();

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isTenantLifeOpen, setIsTenantLifeOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  // Active or mock invoice matching Image 5
  const currentInvoice = invoices[0] || {
    id: 'HD-202610-302',
    contractId: 'ctr-001',
    monthYear: '10/2026',
    listingTitle: 'P.302 — Nhà trọ An Nhiên',
    tenantName: 'Nguyễn Văn An',
    landlordName: 'Anh Minh',
    rentAmount: 3500000,
    electricityKwh: 120,
    electricityAmount: 360000,
    waterM3: 6,
    waterAmount: 120000,
    internetAmount: 100000,
    serviceAmount: 45000,
    parkingAmount: 0,
    totalAmount: 4125000,
    status: 'pending' as const,
    dueDate: '2026-11-05T00:00:00.000Z',
    createdAt: new Date().toISOString(),
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
        {/* Header Title */}
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.mainHeading, { color: colors.textPrimary }]}>
              Phòng của tôi
            </Text>
            <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
              Quản lý hợp đồng thuê, hóa đơn điện nước và dịch vụ phòng trọ
            </Text>
          </View>
        </View>

        {/* Current Active Room Card */}
        <View style={[styles.activeRoomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.activeRoomHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.activeTagRow}>
                <View style={styles.activeStatusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.activeStatusText}>Đang thuê</Text>
                </View>
                <Text style={[styles.contractIdText, { color: colors.textSecondary }]}>
                  Hợp đồng #HD-2026-TRV8
                </Text>
              </View>
              <Text style={[styles.roomName, { color: colors.textPrimary }]}>
                P.302 — Nhà trọ An Nhiên
              </Text>
              <Text style={[styles.roomAddress, { color: colors.textSecondary }]}>
                48/12 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7
              </Text>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.roomThumb}
              resizeMode="cover"
            />
          </View>

          {/* Landlord Contact Bar */}
          <View style={[styles.landlordBar, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-circle-outline" size={18} color="#085F56" style={{ marginRight: 6 }} />
              <Text style={[styles.landlordLabel, { color: colors.textSecondary }]}>
                Chủ trọ: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Anh Minh (0908.123.456)</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsContractOpen(true)}>
              <Text style={styles.viewContractLink}>Hợp đồng &gt;</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Invoice Feature Card (Matching Image 5) */}
        <View style={[styles.invoiceBanner, { backgroundColor: colors.card, borderColor: '#085F56' }]}>
          <View style={styles.invoiceTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={16} color="#085F56" style={{ marginRight: 6 }} />
              <Text style={[styles.invoiceTitle, { color: colors.textPrimary }]}>
                Hóa đơn tiền phòng Tháng {currentInvoice.monthYear}
              </Text>
            </View>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Chưa thanh toán</Text>
            </View>
          </View>

          <View style={styles.invoiceBodyRow}>
            <View>
              <Text style={[styles.invoicePrompt, { color: colors.textSecondary }]}>
                Tổng tiền cần thanh toán
              </Text>
              <Text style={[styles.invoiceAmount, { color: '#085F56' }]}>
                {formatVND(currentInvoice.totalAmount)}
              </Text>
              <Text style={[styles.invoiceDueNote, { color: colors.textSecondary }]}>
                Hạn chót: 05/11/2026 • Còn 3 ngày
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={() => setIsInvoiceOpen(true)}
              activeOpacity={0.88}
            >
              <Ionicons name="qr-code-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.payNowText}>VietQR Thanh Toán</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Management Hub */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Tiện ích & Biên bản phòng trọ
        </Text>

        <View style={styles.utilitiesGrid}>
          {/* Item 1: Biên bản bàn giao */}
          <TouchableOpacity
            style={[styles.utilCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setIsHandoverOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.utilIconCircle, { backgroundColor: '#E6F4F1' }]}>
              <Ionicons name="clipboard-outline" size={20} color="#085F56" />
            </View>
            <Text style={[styles.utilTitle, { color: colors.textPrimary }]}>
              Biên bản bàn giao
            </Text>
            <Text style={[styles.utilSub, { color: colors.textSecondary }]}>
              Số điện/nước đầu kỳ & thiết bị
            </Text>
          </TouchableOpacity>

          {/* Item 2: Dự toán chuyển trọ */}
          <TouchableOpacity
            style={[styles.utilCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setIsTenantLifeOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.utilIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="car-outline" size={20} color="#2563EB" />
            </View>
            <Text style={[styles.utilTitle, { color: colors.textPrimary }]}>
              Dự toán chuyển trọ
            </Text>
            <Text style={[styles.utilSub, { color: colors.textSecondary }]}>
              Xe ba gác & xe tải giá minh bạch
            </Text>
          </TouchableOpacity>

          {/* Item 3: Sửa chữa & Vệ sinh */}
          <TouchableOpacity
            style={[styles.utilCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setIsTenantLifeOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.utilIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="construct-outline" size={20} color="#D97706" />
            </View>
            <Text style={[styles.utilTitle, { color: colors.textPrimary }]}>
              Sửa chữa điện nước
            </Text>
            <Text style={[styles.utilSub, { color: colors.textSecondary }]}>
              Thợ xác minh xử lý trong ngày
            </Text>
          </TouchableOpacity>

          {/* Item 4: Lịch sử thanh toán */}
          <TouchableOpacity
            style={[styles.utilCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setIsInvoiceOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.utilIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="time-outline" size={20} color="#7E22CE" />
            </View>
            <Text style={[styles.utilTitle, { color: colors.textPrimary }]}>
              Đối soát VietQR
            </Text>
            <Text style={[styles.utilSub, { color: colors.textSecondary }]}>
              Tự động gạch nợ sau 30s
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-modals */}
      <InvoiceDetailModal
        visible={isInvoiceOpen}
        invoice={currentInvoice}
        onClose={() => setIsInvoiceOpen(false)}
      />

      <ContractDetailModal
        visible={isContractOpen}
        contract={null}
        onClose={() => setIsContractOpen(false)}
      />

      <TenantLifeHubModal
        visible={isTenantLifeOpen}
        onClose={() => setIsTenantLifeOpen(false)}
      />

      <ViewingHandoverModal
        visible={isHandoverOpen}
        contractId="ctr-001"
        listingTitle="P.302 — Nhà trọ An Nhiên"
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
  headerTitleRow: {
    marginBottom: 16,
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subHeading: {
    fontSize: 12,
    marginTop: 3,
  },
  activeRoomCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeRoomHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  contractIdText: {
    fontSize: 11,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  roomAddress: {
    fontSize: 11,
    lineHeight: 15,
  },
  roomThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginLeft: 10,
  },
  landlordBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  landlordLabel: {
    fontSize: 11,
  },
  viewContractLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#085F56',
  },
  invoiceBanner: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#085F56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  pendingBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  invoiceBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoicePrompt: {
    fontSize: 10,
    fontWeight: '600',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 1,
  },
  invoiceDueNote: {
    fontSize: 10,
    marginTop: 2,
  },
  payNowBtn: {
    backgroundColor: '#085F56',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#085F56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  utilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  utilCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  utilIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  utilTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  utilSub: {
    fontSize: 10,
    lineHeight: 14,
  },
});
