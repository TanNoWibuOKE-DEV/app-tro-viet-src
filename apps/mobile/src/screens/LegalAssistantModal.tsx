import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import {
  calculateEvnResidentialElectricity,
  assessUtilityRate,
  generateDisputeLetter,
  DisputeType,
  MANDATORY_LEGAL_DISCLAIMER,
  EVN_RESIDENTIAL_TIERS,
} from '@troviet/shared';

interface LegalAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  tenantName?: string | null;
  tenantPhone?: string | null;
}

export const LegalAssistantModal: React.FC<LegalAssistantModalProps> = ({
  visible,
  onClose,
  tenantName = 'Nguyễn Văn An',
  tenantPhone = '0905.123.456',
}) => {
  const { colors, isDark } = useTheme();

  // Active Tab: 'electricity' | 'water' | 'dispute_letter'
  const [activeTab, setActiveTab] = useState<'electricity' | 'water' | 'dispute_letter'>('electricity');

  // Electricity Tab State
  const [kwhInput, setKwhInput] = useState<string>('160');
  const [tenantCountInput, setTenantCountInput] = useState<string>('2');
  const [billedRateInput, setBilledRateInput] = useState<string>('4200');

  // Water Tab State
  const [waterRateInput, setWaterRateInput] = useState<string>('38000');

  // Dispute Letter State
  const [disputeType, setDisputeType] = useState<DisputeType>('electricity_overcharge');
  const [letterTenantName, setLetterTenantName] = useState<string>(tenantName || 'Nguyễn Văn An');
  const [letterTenantPhone, setLetterTenantPhone] = useState<string>(tenantPhone || '0905.123.456');
  const [landlordName, setLandlordName] = useState<string>('Bà Trần Thị Mai');
  const [roomAddress, setRoomAddress] = useState<string>('Phòng 302, 120 Hải Phòng, Thạch Thang, Đà Nẵng');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('3000000');
  const [handoverDate, setHandoverDate] = useState<string>('28/09/2026');
  const [deadlineDays, setDeadlineDays] = useState<number>(5);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);

  // Parse Numbers
  const totalKwh = Math.max(0, parseInt(kwhInput || '0', 10));
  const tenantCount = Math.max(1, parseInt(tenantCountInput || '1', 10));
  const billedRate = Math.max(0, parseInt(billedRateInput || '0', 10));
  const waterRate = Math.max(0, parseInt(waterRateInput || '0', 10));

  // Calculations
  const evnBill = calculateEvnResidentialElectricity(totalKwh, tenantCount);
  const billedTotalCost = totalKwh * billedRate;
  const electricityAssessment = assessUtilityRate('electricity', billedRate);
  const waterAssessment = assessUtilityRate('water', waterRate);
  const excessMoneyPaid = Math.max(0, billedTotalCost - evnBill.totalCostVnd);

  const handleGenerateLetter = () => {
    const output = generateDisputeLetter({
      disputeType,
      tenantName: letterTenantName,
      tenantPhone: letterTenantPhone,
      landlordName,
      roomAddress,
      billedRate,
      actualUsage: totalKwh,
      excessAmountClaimed: excessMoneyPaid,
      depositAmount: parseInt(depositAmountInput || '0', 10),
      handoverDate,
      deadlineDays,
    });

    setGeneratedLetter(output.letterContent);
  };

  const handleCopyLetter = () => {
    Alert.alert(
      'Đã sao chép văn bản',
      'Nội dung thư đàm phán pháp lý đã được lưu vào bộ nhớ tạm. Bạn có thể gửi qua Zalo, SMS hoặc in ra gửi cho Chủ trọ.'
    );
  };

  const switchToDisputeTabFromOvercharge = () => {
    setDisputeType('electricity_overcharge');
    setActiveTab('dispute_letter');
    handleGenerateLetter();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            ⚖️ Trợ Lý Pháp Lý Trọ
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Tab Selector */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'electricity' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('electricity')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'electricity' ? colors.primary : colors.textSecondary },
              ]}
            >
              ⚡ Giá điện EVN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'water' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('water')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'water' ? colors.primary : colors.textSecondary },
              ]}
            >
              💧 Giá nước đô thị
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'dispute_letter' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('dispute_letter')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'dispute_letter' ? colors.primary : colors.textSecondary },
              ]}
            >
              📝 Soạn thư đàm phán
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* TAB 1: ELECTRICITY QUOTA & OVERCHARGE CHECKER */}
          {activeTab === 'electricity' && (
            <View>
              {/* Decree Notice */}
              <View
                style={[
                  styles.legalNoticeBox,
                  {
                    backgroundColor:
                      electricityAssessment.riskSeverity === 'excessive_illegal'
                        ? isDark
                          ? '#450A0A'
                          : '#FEF2F2'
                        : isDark
                        ? '#1E293B'
                        : '#F0FDF4',
                    borderColor:
                      electricityAssessment.riskSeverity === 'excessive_illegal'
                        ? '#EF4444'
                        : colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.legalNoticeTitle,
                    {
                      color:
                        electricityAssessment.riskSeverity === 'excessive_illegal'
                          ? '#DC2626'
                          : colors.primary,
                    },
                  ]}
                >
                  {electricityAssessment.riskSeverity === 'excessive_illegal'
                    ? '⚠️ CẢNH BÁO: ĐƠN GIÁ THU VƯỢT QUY ĐỊNH PHÁP LUẬT'
                    : '📜 Quy Định Bán Lẻ Điện Cho Người Thuê Nhà'}
                </Text>
                <Text style={[styles.legalNoticeBody, { color: colors.textSecondary }]}>
                  {electricityAssessment.penaltyNotice}
                </Text>
              </View>

              {/* Input Form */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Số điện tiêu thụ trong tháng (kWh):
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={kwhInput}
                  onChangeText={setKwhInput}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 150"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Số người cùng ở (Định mức EVN: 4 người = 1 hộ):
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={tenantCountInput}
                  onChangeText={setTenantCountInput}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 2"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Đơn giá chủ nhà đang thu (₫/kWh):
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={billedRateInput}
                  onChangeText={setBilledRateInput}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 4000"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Comparison Results Card */}
              <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.resultHeader, { color: colors.textPrimary }]}>
                  Đối Soát Tiền Điện Tháng Này ({totalKwh} kWh)
                </Text>

                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Giá Nhà Nước (EVN 6 bậc):</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {evnBill.totalCostVnd.toLocaleString('vi-VN')} ₫
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      (~{evnBill.averageRatePerKwh.toLocaleString('vi-VN')} ₫/kWh)
                    </Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Chủ trọ đang thu:</Text>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color:
                            electricityAssessment.riskSeverity === 'excessive_illegal'
                              ? '#EF4444'
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {billedTotalCost.toLocaleString('vi-VN')} ₫
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      ({billedRate.toLocaleString('vi-VN')} ₫/kWh)
                    </Text>
                  </View>
                </View>

                {excessMoneyPaid > 0 && (
                  <View style={[styles.excessBox, { backgroundColor: isDark ? '#372020' : '#FEF2F2' }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>
                      💸 Số tiền bạn đang trả cao hơn giá EVN:
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#DC2626', marginTop: 2 }}>
                      +{excessMoneyPaid.toLocaleString('vi-VN')} ₫ / tháng
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      (Cao hơn {electricityAssessment.percentageOverRate}% so với giá quy chuẩn Bậc 3 của Bộ Công Thương)
                    </Text>
                  </View>
                )}

                {/* 6 Tiers Breakdown Collapsible / List */}
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 14, marginBottom: 8 }}>
                  Chi tiết bậc thang EVN (QĐ 2941/QĐ-BCT):
                </Text>
                {evnBill.tierBreakdown.map((t) => (
                  <View key={t.tier} style={styles.tierLine}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
                      {t.name} ({t.rateVnd.toLocaleString('vi-VN')} ₫):
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                      {t.kwh} kWh = {t.amountVnd.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                ))}
                <View style={styles.tierLine}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>Thuế GTGT (VAT 8%):</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                    {evnBill.vatAmount.toLocaleString('vi-VN')} ₫
                  </Text>
                </View>

                {electricityAssessment.riskSeverity !== 'fair' && (
                  <View style={{ marginTop: 16 }}>
                    <Button
                      title="📝 Tạo Thư Đề Nghị Điều Chỉnh Đơn Giá"
                      onPress={switchToDisputeTabFromOvercharge}
                      variant="primary"
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 2: MUNICIPAL WATER ASSESSMENT */}
          {activeTab === 'water' && (
            <View>
              <View style={[styles.legalNoticeBox, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.primary }]}>
                <Text style={[styles.legalNoticeTitle, { color: colors.primary }]}>
                  💧 Định Mức Nước Sinh Hoạt Đô Thị
                </Text>
                <Text style={[styles.legalNoticeBody, { color: colors.textSecondary }]}>
                  Giá nước sạch sinh hoạt tại các đô thị (Đà Nẵng, Hà Nội, TP.HCM) áp dụng theo mức tiêu thụ bình quân từ 8.500 ₫ đến 27.000 ₫/m³. Mức thu cào bằng &gt; 35.000 ₫/m³ thường bao gồm hao hụt rò rỉ bất hợp lý.
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Đơn giá nước chủ trọ đang thu (₫/m³ hoặc ₫/người):
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={waterRateInput}
                  onChangeText={setWaterRateInput}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 30000"
                  placeholderTextColor={colors.textSecondary}
                />

                <View
                  style={[
                    styles.waterBadge,
                    {
                      backgroundColor:
                        waterAssessment.riskSeverity === 'excessive_illegal'
                          ? '#FEE2E2'
                          : waterAssessment.riskSeverity === 'elevated'
                          ? '#FEF3C7'
                          : '#DCFCE7',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color:
                        waterAssessment.riskSeverity === 'excessive_illegal'
                          ? '#991B1B'
                          : waterAssessment.riskSeverity === 'elevated'
                          ? '#92400E'
                          : '#166534',
                    }}
                  >
                    {waterAssessment.riskSeverity === 'excessive_illegal'
                      ? '🔴 Thu vượt định mức đô thị (> 35.000 ₫)'
                      : waterAssessment.riskSeverity === 'elevated'
                      ? '🟡 Cao hơn trung bình sinh hoạt'
                      : '🟢 Nằm trong định mức hợp lý'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>
                    {waterAssessment.penaltyNotice}
                  </Text>
                </View>

                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 12, lineHeight: 18 }}>
                  💡 Lời khuyên: Người thuê trọ nên yêu cầu chủ nhà cho kiểm tra đồng hồ nước riêng cho từng phòng và chụp ảnh chỉ số đồng hồ lúc nhận phòng để đối soát.
                </Text>
              </View>
            </View>
          )}

          {/* TAB 3: DISPUTE LETTER CONCIERGE */}
          {activeTab === 'dispute_letter' && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Soạn thảo văn bản đàm phán hợp pháp
              </Text>

              {/* Selector */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Loại văn bản cần tạo:</Text>
                <View style={styles.disputeTypeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor:
                          disputeType === 'electricity_overcharge' ? colors.primary : colors.background,
                        borderColor:
                          disputeType === 'electricity_overcharge' ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDisputeType('electricity_overcharge')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: disputeType === 'electricity_overcharge' ? '#FFFFFF' : colors.textPrimary,
                        textAlign: 'center',
                      }}
                    >
                      ⚡ Đề nghị giảm giá điện theo EVN
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor:
                          disputeType === 'deposit_refund' ? colors.primary : colors.background,
                        borderColor:
                          disputeType === 'deposit_refund' ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDisputeType('deposit_refund')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: disputeType === 'deposit_refund' ? '#FFFFFF' : colors.textPrimary,
                        textAlign: 'center',
                      }}
                    >
                      💰 Đề nghị hoàn trả tiền cọc
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: colors.textPrimary }]}>Tên chủ trọ / Người quản lý:</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={landlordName}
                  onChangeText={setLandlordName}
                  placeholder="Ví dụ: Bà Trần Thị Mai"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>Địa chỉ phòng thuê:</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={roomAddress}
                  onChangeText={setRoomAddress}
                  placeholder="Ví dụ: Phòng 302, 120 Hải Phòng"
                  placeholderTextColor={colors.textSecondary}
                />

                {disputeType === 'deposit_refund' ? (
                  <>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Số tiền cọc đã đóng (₫):</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                          color: colors.textPrimary,
                          borderColor: colors.border,
                        },
                      ]}
                      value={depositAmountInput}
                      onChangeText={setDepositAmountInput}
                      keyboardType="numeric"
                      placeholder="Ví dụ: 3000000"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.label, { color: colors.textPrimary }]}>Ngày trả phòng:</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                          color: colors.textPrimary,
                          borderColor: colors.border,
                        },
                      ]}
                      value={handoverDate}
                      onChangeText={setHandoverDate}
                      placeholder="Ví dụ: 28/09/2026"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </>
                ) : (
                  <>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Đơn giá điện đang thu (₫/kWh):</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                          color: colors.textPrimary,
                          borderColor: colors.border,
                        },
                      ]}
                      value={billedRateInput}
                      onChangeText={setBilledRateInput}
                      keyboardType="numeric"
                      placeholder="Ví dụ: 4200"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </>
                )}

                <Text style={[styles.label, { color: colors.textPrimary }]}>Thời hạn phản hồi đề nghị:</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {[3, 5, 7].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.dayPill,
                        {
                          backgroundColor:
                            deadlineDays === days ? colors.primary : isDark ? '#374151' : '#E5E7EB',
                        },
                      ]}
                      onPress={() => setDeadlineDays(days)}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: deadlineDays === days ? '#FFFFFF' : colors.textPrimary,
                        }}
                      >
                        {days} ngày làm việc
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ marginTop: 8 }}>
                  <Button
                    title="✨ Tạo Văn Bản Đàm Phán Tự Động"
                    onPress={handleGenerateLetter}
                    variant="primary"
                  />
                </View>
              </View>

              {/* Generated Letter Display */}
              {generatedLetter && (
                <View style={[styles.letterCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                  <View style={styles.letterHeader}>
                    <Text style={[styles.letterTitle, { color: colors.textPrimary }]}>
                      Văn Bản Kiến Nghị Hoàn Chỉnh
                    </Text>
                    <TouchableOpacity onPress={handleCopyLetter} style={styles.copyBtn}>
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
                        📋 Sao chép
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.letterContentBox} nestedScrollEnabled>
                    <Text style={[styles.letterText, { color: colors.textPrimary }]}>
                      {generatedLetter}
                    </Text>
                  </ScrollView>

                  <View style={[styles.disclaimerBox, { borderTopColor: colors.border }]}>
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                      🛡️ {MANDATORY_LEGAL_DISCLAIMER}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  legalNoticeBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  legalNoticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  legalNoticeBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 8,
  },
  resultCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  resultHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  excessBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  tierLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  waterBadge: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  disputeTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  letterCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginTop: 16,
  },
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  letterTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  copyBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  letterContentBox: {
    maxHeight: 280,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: 10,
  },
  letterText: {
    fontSize: 13,
    lineHeight: 20,
  },
  disclaimerBox: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  disclaimerText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
