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
  RentalContract,
  RentInvoice,
  formatVND,
  calculateMonthlyInvoice,
  generateVietQRLink,
  calculateLandlordFinancialSummary,
  ListingSummary,
} from '@troviet/shared';
import { ContractDetailModal } from './ContractDetailModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { AreaInsightsModal } from './AreaInsightsModal';
import { ListingPromotionModal } from './ListingPromotionModal';

interface LandlordDashboardScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const LandlordDashboardScreen: React.FC<LandlordDashboardScreenProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const { contracts, invoices, createInvoice, listings } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'contracts' | 'invoices'>('analytics');

  // Modals state
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<RentInvoice | null>(null);
  const [selectedListingForPromotion, setSelectedListingForPromotion] = useState<ListingSummary | null>(null);
  const [showAreaInsights, setShowAreaInsights] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  // Financial analytics calculation
  const financialSummary = useMemo(() => {
    return calculateLandlordFinancialSummary({
      landlordId: 'u-landlord-1',
      contracts,
      invoices,
      totalManagedRooms: Math.max(contracts.length + 1, 4),
      periodMonthYear: '10/2026',
    });
  }, [contracts, invoices]);

  const handleExportFinancialReport = () => {
    Alert.alert(
      '📊 Báo cáo Tài chính Chủ trọ',
      `[Tháng 10/2026]\n\n• Doanh thu dự kiến: ${formatVND(financialSummary.totalExpectedRevenue)}\n• Thực thu đã về: ${formatVND(financialSummary.totalCollectedRevenue)}\n• Chưa thu / Công nợ: ${formatVND(financialSummary.totalPendingRevenue + financialSummary.totalOverdueRevenue)}\n• Tỷ lệ lấp đầy: ${financialSummary.occupancyRatePercent}%\n• Tỷ lệ thu đúng hạn: ${financialSummary.onTimeCollectionRatePercent}%\n\nDữ liệu đã sẵn sàng để xuất báo cáo kế toán.`
    );
  };

  // New Invoice form state
  const [newInvContractId, setNewInvContractId] = useState<string>(contracts[0]?.id || '');
  const [newInvMonth, setNewInvMonth] = useState<string>('10/2026');
  const [newInvPrevElec, setNewInvPrevElec] = useState<string>('100');
  const [newInvCurrElec, setNewInvCurrElec] = useState<string>('195'); // 95 kWh
  const [newInvElecPrice, setNewInvElecPrice] = useState<string>('3500');
  const [newInvWaterM3, setNewInvWaterM3] = useState<string>('4');
  const [newInvWaterPrice, setNewInvWaterPrice] = useState<string>('15000');
  const [newInvInternet, setNewInvInternet] = useState<string>('50000');

  // Compute metrics
  const activeContractsCount = contracts.filter((c) => c.status === 'active').length;
  const pendingContractsCount = contracts.filter((c) => c.status === 'pending_signature').length;
  const totalPotentialRevenue = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyRent, 0);

  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending');
  const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleCreateInvoiceSubmit = () => {
    const contract = contracts.find((c) => c.id === newInvContractId);
    if (!contract) {
      Alert.alert('Lỗi', 'Vui lòng chọn một hợp đồng hợp lệ.');
      return;
    }

    const prevElec = parseInt(newInvPrevElec, 10) || 0;
    const currElec = parseInt(newInvCurrElec, 10) || 0;
    const elecPrice = parseInt(newInvElecPrice, 10) || 3500;
    const waterM3 = parseInt(newInvWaterM3, 10) || 0;
    const waterPrice = parseInt(newInvWaterPrice, 10) || 15000;
    const internet = parseInt(newInvInternet, 10) || 0;

    const calcResult = calculateMonthlyInvoice({
      contractId: contract.id,
      invoiceCode: `INV-${Date.now().toString().slice(-6)}`,
      periodMonth: newInvMonth,
      monthlyRent: contract.monthlyRent,
      electricityBillingType: 'meter',
      previousElectricityMeter: prevElec,
      currentElectricityMeter: currElec,
      electricityCostPerUnit: elecPrice,
      waterBillingType: 'meter',
      currentWaterMeter: waterM3,
      previousWaterMeter: 0,
      waterCostPerUnit: waterPrice,
      internetCost: internet,
    });

    const vietqr = generateVietQRLink({
      bankBin: '970422',
      bankName: 'MBBank',
      accountNumber: '0905123456',
      accountName: contract.landlordName || 'CHU TRO',
      amount: calcResult.totalAmount,
      description: `TROVIET ${calcResult.invoiceCode}`,
    });

    const elecItem = calcResult.lineItems.find((i) => i.id === 'electricity');
    const waterItem = calcResult.lineItems.find((i) => i.id === 'water');

    const created = createInvoice({
      contractId: contract.id,
      listingId: contract.listingId,
      listingTitle: contract.listingTitle,
      landlordId: contract.landlordId,
      landlordName: contract.landlordName,
      tenantId: contract.tenantId,
      tenantName: contract.tenantName,
      monthYear: newInvMonth,
      rentAmount: contract.monthlyRent,
      electricityAmount: elecItem?.amount || 0,
      electricityKwh: calcResult.electricityUsageKwh,
      waterAmount: waterItem?.amount || 0,
      waterM3: calcResult.waterUsageM3,
      internetAmount: internet,
      serviceAmount: 0,
      totalAmount: calcResult.totalAmount,
      status: 'pending',
      vietqrUrl: vietqr.qrImageUrl,
    });

    setShowCreateInvoiceModal(false);
    setSelectedInvoice(created);
    Alert.alert('Thành công', `Đã xuất hóa đơn tháng ${newInvMonth} với số tiền ${formatVND(created.totalAmount)} kèm mã VietQR NAPAS!`);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Quản lý phòng & Hợp đồng</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setSelectedListingForPromotion(listings[0] || null)}
              style={styles.vipBtn}
            >
              <Text style={styles.vipBtnText}>💎 Gói VIP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAreaInsights(true)} style={styles.insightsBtn}>
              <Text style={[styles.insightsBtnText, { color: colors.primary }]}>📊 Thị trường</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Dashboard Summary Cards */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Hợp đồng hiệu lực</Text>
              <Text style={[styles.metricNumber, { color: colors.primary }]}>{activeContractsCount}</Text>
              <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                {pendingContractsCount > 0 ? `+${pendingContractsCount} chờ ký` : 'Tất cả đã ký'}
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Doanh thu dự kiến</Text>
              <Text style={[styles.metricNumber, { color: '#00897B' }]}>{formatVND(totalPotentialRevenue)}</Text>
              <Text style={[styles.metricSub, { color: colors.textSecondary }]}>tháng hiện tại</Text>
            </View>
          </View>

          {pendingRevenue > 0 && (
            <View style={[styles.pendingAlert, { backgroundColor: isDark ? '#332914' : '#FEF7E0' }]}>
              <Text style={[styles.pendingAlertText, { color: '#B06000' }]}>
                ⏳ Đang có {pendingInvoices.length} hóa đơn chưa thu ({formatVND(pendingRevenue)}).
              </Text>
            </View>
          )}

          {/* Navigation Tabs */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? '#1F2937' : '#F1F3F4' }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('analytics')}
              style={[
                styles.tabBtn,
                activeTab === 'analytics' && { backgroundColor: colors.card, shadowColor: '#000', elevation: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'analytics' ? colors.primary : colors.textSecondary, fontWeight: activeTab === 'analytics' ? '700' : '500' },
                ]}
              >
                📊 Tài chính
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('contracts')}
              style={[
                styles.tabBtn,
                activeTab === 'contracts' && { backgroundColor: colors.card, shadowColor: '#000', elevation: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'contracts' ? colors.primary : colors.textSecondary, fontWeight: activeTab === 'contracts' ? '700' : '500' },
                ]}
              >
                📑 Hợp đồng ({contracts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('invoices')}
              style={[
                styles.tabBtn,
                activeTab === 'invoices' && { backgroundColor: colors.card, shadowColor: '#000', elevation: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'invoices' ? colors.primary : colors.textSecondary, fontWeight: activeTab === 'invoices' ? '700' : '500' },
                ]}
              >
                💳 Hóa đơn ({invoices.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Analytics Tab Content */}
          {activeTab === 'analytics' && (
            <View>
              {/* Financial Summary Cards */}
              <View style={[styles.finCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.finHeaderRow}>
                  <Text style={[styles.finHeading, { color: colors.textPrimary }]}>Dòng tiền tháng {financialSummary.periodMonthYear}</Text>
                  <TouchableOpacity onPress={handleExportFinancialReport} style={[styles.exportBtn, { borderColor: colors.primary }]}>
                    <Text style={[styles.exportBtnText, { color: colors.primary }]}>📥 Báo cáo</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.finGrid}>
                  <View style={[styles.finTile, { backgroundColor: colors.background }]}>
                    <Text style={[styles.finTileLabel, { color: colors.textSecondary }]}>Thực thu đã về</Text>
                    <Text style={[styles.finTileVal, { color: '#137333' }]}>{formatVND(financialSummary.totalCollectedRevenue)}</Text>
                    <Text style={[styles.finTileSub, { color: colors.textSecondary }]}>Đã gạch nợ VietQR</Text>
                  </View>

                  <View style={[styles.finTile, { backgroundColor: colors.background }]}>
                    <Text style={[styles.finTileLabel, { color: colors.textSecondary }]}>Chưa thu / Nợ</Text>
                    <Text style={[styles.finTileVal, { color: '#B06000' }]}>{formatVND(financialSummary.totalPendingRevenue + financialSummary.totalOverdueRevenue)}</Text>
                    <Text style={[styles.finTileSub, { color: colors.textSecondary }]}>{financialSummary.overdueAlerts.length} hóa đơn quá hạn</Text>
                  </View>

                  <View style={[styles.finTile, { backgroundColor: colors.background }]}>
                    <Text style={[styles.finTileLabel, { color: colors.textSecondary }]}>Tỷ lệ lấp đầy</Text>
                    <Text style={[styles.finTileVal, { color: colors.primary }]}>{financialSummary.occupancyRatePercent}%</Text>
                    <Text style={[styles.finTileSub, { color: colors.textSecondary }]}>{financialSummary.occupiedRooms}/{financialSummary.totalRooms} phòng đã thuê</Text>
                  </View>

                  <View style={[styles.finTile, { backgroundColor: colors.background }]}>
                    <Text style={[styles.finTileLabel, { color: colors.textSecondary }]}>Đúng hạn</Text>
                    <Text style={[styles.finTileVal, { color: '#00897B' }]}>{financialSummary.onTimeCollectionRatePercent}%</Text>
                    <Text style={[styles.finTileSub, { color: colors.textSecondary }]}>Chỉ số uy tín thu</Text>
                  </View>
                </View>
              </View>

              {/* Revenue Breakdown */}
              <View style={[styles.finCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
                <Text style={[styles.finHeading, { color: colors.textPrimary, marginBottom: 12 }]}>Cơ cấu nguồn thu dự kiến</Text>
                
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownKey, { color: colors.textPrimary }]}>🏠 Tiền thuê phòng:</Text>
                  <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>{formatVND(financialSummary.breakdown.rentAmount)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownKey, { color: colors.textPrimary }]}>💡 Tiền điện công tơ:</Text>
                  <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>{formatVND(financialSummary.breakdown.electricityAmount)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownKey, { color: colors.textPrimary }]}>💧 Tiền nước sinh hoạt:</Text>
                  <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>{formatVND(financialSummary.breakdown.waterAmount)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownKey, { color: colors.textPrimary }]}>📶 Internet & Dịch vụ:</Text>
                  <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>{formatVND(financialSummary.breakdown.serviceAmount)}</Text>
                </View>
              </View>

              {/* 6-Month Trend */}
              <View style={[styles.finCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
                <Text style={[styles.finHeading, { color: colors.textPrimary, marginBottom: 12 }]}>Xu hướng doanh thu 6 tháng gần nhất</Text>
                {financialSummary.trend6Months.map((item) => {
                  const percent = item.expectedAmount > 0 ? Math.min(100, Math.round((item.collectedAmount / item.expectedAmount) * 100)) : 0;
                  return (
                    <View key={item.monthYear} style={styles.trendRow}>
                      <Text style={[styles.trendMonth, { color: colors.textSecondary }]}>{item.monthYear}</Text>
                      <View style={[styles.trendBarBg, { backgroundColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
                        <View style={[styles.trendBarFill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.trendVal, { color: colors.textPrimary }]}>{formatVND(item.collectedAmount)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Contracts Tab Content */}
          {activeTab === 'contracts' && (
            <View>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Danh sách hợp đồng thuê:</Text>
              {contracts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedContract(item)}
                  style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.listingTitle}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            item.status === 'active'
                              ? isDark ? '#143321' : '#E6F4EA'
                              : isDark ? '#332914' : '#FEF7E0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: item.status === 'active' ? '#137333' : '#B06000',
                          },
                        ]}
                      >
                        {item.status === 'active' ? '🟢 Hiệu lực' : '🟡 Chờ ký'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Khách thuê: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.tenantName}</Text>
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Giá thuê: <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatVND(item.monthlyRent)}/tháng</Text>
                  </Text>
                  <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
                    Thời hạn: {item.startDate.split('T')[0]} → {item.endDate.split('T')[0]}
                  </Text>

                  <View style={styles.cardActionRow}>
                    <Text style={[styles.actionLink, { color: colors.primary }]}>Xem chi tiết & Phân tích AI →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Invoices Tab Content */}
          {activeTab === 'invoices' && (
            <View>
              <View style={styles.invoiceHeaderRow}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Hóa đơn tiền phòng & điện nước:</Text>
                <TouchableOpacity
                  onPress={() => setShowCreateInvoiceModal(true)}
                  style={[styles.createInvBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.createInvBtnText}>➕ Tạo hóa đơn mới</Text>
                </TouchableOpacity>
              </View>

              {invoices.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  onPress={() => setSelectedInvoice(inv)}
                  style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                      Tháng {inv.monthYear} - {inv.listingTitle}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            inv.status === 'paid'
                              ? isDark ? '#143321' : '#E6F4EA'
                              : isDark ? '#332914' : '#FEF7E0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: inv.status === 'paid' ? '#137333' : '#B06000',
                          },
                        ]}
                      >
                        {inv.status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Khách thuê: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{inv.tenantName}</Text>
                  </Text>

                  <View style={styles.amountRow}>
                    <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Tổng thanh toán:</Text>
                    <Text style={[styles.amountValue, { color: colors.primary }]}>{formatVND(inv.totalAmount)}</Text>
                  </View>

                  <View style={styles.cardActionRow}>
                    <Text style={[styles.actionLink, { color: colors.primary }]}>Xem mã VietQR & Chi tiết →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Modal: Contract Details & AI Analysis */}
        <ContractDetailModal
          visible={!!selectedContract}
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />

        {/* Modal: Invoice Details & VietQR */}
        <InvoiceDetailModal
          visible={!!selectedInvoice}
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />

        {/* Modal: Area Insights */}
        <AreaInsightsModal
          visible={showAreaInsights}
          onClose={() => setShowAreaInsights(false)}
        />

        {/* Modal: Create Invoice Form */}
        <Modal visible={showCreateInvoiceModal} animationType="slide">
          <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCreateInvoiceModal(false)} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Tạo hóa đơn tiền phòng</Text>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.formLabel, { color: colors.textPrimary }]}>Kỳ thanh toán (Tháng/Năm):</Text>
                <TextInput
                  value={newInvMonth}
                  onChangeText={setNewInvMonth}
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                  placeholder="e.g. 10/2026"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Hợp đồng áp dụng:</Text>
                {contracts.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setNewInvContractId(c.id)}
                    style={[
                      styles.contractChoice,
                      {
                        borderColor: newInvContractId === c.id ? colors.primary : colors.border,
                        backgroundColor: newInvContractId === c.id ? (isDark ? '#1C2738' : '#EEF5FF') : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.contractChoiceTitle, { color: colors.textPrimary }]}>{c.listingTitle}</Text>
                    <Text style={[styles.contractChoiceSub, { color: colors.textSecondary }]}>
                      Khách: {c.tenantName} - Giá phòng: {formatVND(c.monthlyRent)}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 14 }]}>Chỉ số điện (kWh):</Text>
                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputSub, { color: colors.textSecondary }]}>Số cũ</Text>
                    <TextInput
                      value={newInvPrevElec}
                      onChangeText={setNewInvPrevElec}
                      keyboardType="numeric"
                      style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.inputSub, { color: colors.textSecondary }]}>Số mới</Text>
                    <TextInput
                      value={newInvCurrElec}
                      onChangeText={setNewInvCurrElec}
                      keyboardType="numeric"
                      style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                    />
                  </View>
                </View>

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Đơn giá điện (đ/kWh):</Text>
                <TextInput
                  value={newInvElecPrice}
                  onChangeText={setNewInvElecPrice}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                />

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Số khối nước (m³):</Text>
                <TextInput
                  value={newInvWaterM3}
                  onChangeText={setNewInvWaterM3}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                />

                <Text style={[styles.formLabel, { color: colors.textPrimary, marginTop: 12 }]}>Cước Internet (đ/tháng):</Text>
                <TextInput
                  value={newInvInternet}
                  onChangeText={setNewInvInternet}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}
                />

                <View style={{ marginTop: 20 }}>
                  <Button
                    title="🧾 Tính toán & Xuất hóa đơn VietQR"
                    onPress={handleCreateInvoiceSubmit}
                    variant="primary"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {selectedListingForPromotion && (
          <ListingPromotionModal
            visible={selectedListingForPromotion !== null}
            listing={selectedListingForPromotion}
            onClose={() => setSelectedListingForPromotion(null)}
          />
        )}
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
  vipBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  vipBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  insightsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  insightsBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11.5,
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
  },
  pendingAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  pendingAlertText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
  },
  sectionHeading: {
    fontSize: 13,
    marginBottom: 10,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12.5,
    marginBottom: 3,
  },
  itemDate: {
    fontSize: 11.5,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardActionRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  actionLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  createInvBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createInvBtnText: {
    color: '#FFFFFF',
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
  contractChoice: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  contractChoiceTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  contractChoiceSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputSub: {
    fontSize: 11,
    marginBottom: 4,
  },
  finCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  finHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  finHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  exportBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  finGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  finTile: {
    width: '48%',
    borderRadius: 10,
    padding: 12,
  },
  finTileLabel: {
    fontSize: 11.5,
    marginBottom: 4,
  },
  finTileVal: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  finTileSub: {
    fontSize: 10.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  breakdownKey: {
    fontSize: 13,
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  trendMonth: {
    width: 60,
    fontSize: 12,
    fontWeight: '600',
  },
  trendBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  trendVal: {
    width: 90,
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'right',
  },
});
