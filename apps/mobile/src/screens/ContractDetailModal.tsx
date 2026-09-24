import React, { useState, useMemo } from 'react';
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
  RentalContract,
  analyzeContractTerms,
  redactContractPII,
  LEGAL_DISCLAIMER,
  formatVND,
} from '@troviet/shared';

interface ContractDetailModalProps {
  visible: boolean;
  contract: RentalContract | null;
  onClose: () => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  visible,
  contract,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const { currentUser, signContract, terminateContract } = useApp();

  const [showFullText, setShowFullText] = useState(false);
  const [useRedactedText, setUseRedactedText] = useState(true);

  // Compute AI analysis on contract text
  const analysisResult = useMemo(() => {
    if (!contract?.contractText) return null;
    return analyzeContractTerms(contract.contractText);
  }, [contract?.contractText]);

  if (!contract) return null;

  const isTenant = currentUser?.role === 'tenant' || currentUser?.id === contract.tenantId;
  const isLandlord = currentUser?.role === 'landlord' || currentUser?.id === contract.landlordId;

  const tenantSigned = !!contract.tenantSignedAt;
  const landlordSigned = !!contract.landlordSignedAt;
  const canSign = (isTenant && !tenantSigned) || (isLandlord && !landlordSigned);

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'active':
        return { label: '🟢 Đang hiệu lực', bg: isDark ? '#143321' : '#E6F4EA', text: '#137333' };
      case 'pending_signature':
        return { label: '🟡 Chờ ký kết', bg: isDark ? '#332914' : '#FEF7E0', text: '#B06000' };
      case 'terminated':
        return { label: '🔴 Đã thanh lý', bg: isDark ? '#331414' : '#FCE8E6', text: '#C5221F' };
      case 'expired':
        return { label: '⚪ Đã hết hạn', bg: isDark ? '#2D3139' : '#F1F3F4', text: '#5F6368' };
      default:
        return { label: '⚪ Bản nháp', bg: isDark ? '#2D3139' : '#F1F3F4', text: '#5F6368' };
    }
  };

  const statusBadge = getStatusBadge();

  const handleSign = () => {
    const role = isLandlord ? 'landlord' : 'tenant';
    Alert.alert(
      'Ký xác nhận hợp đồng điện tử',
      `Bạn xác nhận đồng ý với toàn bộ các điều khoản trong hợp đồng thuê "${contract.listingTitle}" với tư cách ${role === 'landlord' ? 'Chủ trọ' : 'Khách thuê'}?`,
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: '✍️ Tôi đồng ý ký',
          onPress: () => {
            signContract(contract.id, role);
            Alert.alert('Thành công', 'Hợp đồng đã được ký điện tử thành công!');
          },
        },
      ]
    );
  };

  const handleTerminate = () => {
    Alert.alert(
      'Thanh lý hợp đồng',
      'Bạn có chắc chắn muốn thanh lý hợp đồng này trước thời hạn? Vui lòng đảm bảo hai bên đã thống nhất biên bản bàn giao phòng và hoàn trả cọc.',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xác nhận thanh lý',
          style: 'destructive',
          onPress: () => {
            terminateContract(contract.id);
            Alert.alert('Đã thanh lý', 'Hợp đồng đã được chuyển sang trạng thái đã thanh lý.');
          },
        },
      ]
    );
  };

  const displayedContractText = useRedactedText
    ? redactContractPII(contract.contractText)
    : contract.contractText;

  const riskFindings = analysisResult
    ? analysisResult.findings.filter((f) => f.type === 'risk' || f.type === 'warning')
    : [];
  const fairFindings = analysisResult
    ? analysisResult.findings.filter((f) => f.type === 'fair')
    : [];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Hợp đồng thuê phòng</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Status Header */}
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View>
                <Text style={[styles.listingTitle, { color: colors.textPrimary }]}>{contract.listingTitle}</Text>
                <Text style={[styles.contractIdText, { color: colors.textSecondary }]}>Mã HĐ: {contract.id}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusBadge.bg }]}>
                <Text style={[styles.badgeText, { color: statusBadge.text }]}>{statusBadge.label}</Text>
              </View>
            </View>
          </View>

          {/* Parties & Dates */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>👥 Các bên tham gia & Ký kết</Text>

            <View style={styles.partyItem}>
              <View style={styles.partyInfo}>
                <Text style={[styles.partyRole, { color: colors.primary }]}>BÊN CHO THUÊ (BÊN A):</Text>
                <Text style={[styles.partyName, { color: colors.textPrimary }]}>{contract.landlordName}</Text>
              </View>
              <Text style={[styles.signStatus, { color: landlordSigned ? '#137333' : '#B06000' }]}>
                {landlordSigned ? '✅ Đã ký điện tử' : '⏳ Chưa ký'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.partyItem}>
              <View style={styles.partyInfo}>
                <Text style={[styles.partyRole, { color: colors.primary }]}>BÊN THUÊ (BÊN B):</Text>
                <Text style={[styles.partyName, { color: colors.textPrimary }]}>{contract.tenantName}</Text>
              </View>
              <Text style={[styles.signStatus, { color: tenantSigned ? '#137333' : '#B06000' }]}>
                {tenantSigned ? '✅ Đã ký điện tử' : '⏳ Chưa ký'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.termGrid}>
              <View style={styles.termCol}>
                <Text style={[styles.termLabel, { color: colors.textSecondary }]}>Giá thuê hàng tháng</Text>
                <Text style={[styles.termValue, { color: colors.primary }]}>{formatVND(contract.monthlyRent)}/tháng</Text>
              </View>
              <View style={styles.termCol}>
                <Text style={[styles.termLabel, { color: colors.textSecondary }]}>Tiền đặt cọc</Text>
                <Text style={[styles.termValue, { color: colors.textPrimary }]}>{formatVND(contract.depositAmount)}</Text>
              </View>
            </View>

            <View style={[styles.termGrid, { marginTop: 10 }]}>
              <View style={styles.termCol}>
                <Text style={[styles.termLabel, { color: colors.textSecondary }]}>Ngày bắt đầu</Text>
                <Text style={[styles.termValue, { color: colors.textPrimary }]}>{contract.startDate.split('T')[0]}</Text>
              </View>
              <View style={styles.termCol}>
                <Text style={[styles.termLabel, { color: colors.textSecondary }]}>Ngày kết thúc</Text>
                <Text style={[styles.termValue, { color: colors.textPrimary }]}>{contract.endDate.split('T')[0]}</Text>
              </View>
            </View>
          </View>

          {/* AI Contract Analysis Panel */}
          {analysisResult && (
            <View style={[styles.aiCard, { backgroundColor: isDark ? '#1C2738' : '#EEF5FF', borderColor: colors.primary }]}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiHeaderTitle}>🤖 Phân tích hợp đồng bằng AI</Text>
                <View style={[
                  styles.scoreBadge,
                  { backgroundColor: analysisResult.fairnessScore >= 80 ? '#137333' : analysisResult.fairnessScore >= 60 ? '#B06000' : '#C5221F' }
                ]}>
                  <Text style={styles.scoreText}>Điểm minh bạch: {analysisResult.fairnessScore}/100</Text>
                </View>
              </View>

              <Text style={[styles.aiSummary, { color: colors.textPrimary }]}>
                {analysisResult.summary}
              </Text>

              {/* Privacy protection notice */}
              <View style={[styles.privacyBox, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
                <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                  🛡️ <Text style={{ fontWeight: '600' }}>Bảo mật PII:</Text> Số CCCD, SĐT và STK ngân hàng đã được lọc tự động trước khi xử lý theo Luật 91/2025/QH15.
                </Text>
              </View>

              {/* Detected Risks / Traps */}
              {riskFindings.length > 0 ? (
                <View style={styles.riskList}>
                  <Text style={styles.riskSectionTitle}>⚠️ Điều khoản cần lưu ý ({riskFindings.length}):</Text>
                  {riskFindings.map((risk, index) => (
                    <View key={index} style={[styles.riskItem, { backgroundColor: isDark ? '#3D2020' : '#FDE8E8' }]}>
                      <View style={styles.riskHeaderRow}>
                        <Text style={styles.riskTitle}>{risk.title}</Text>
                        <View style={[styles.riskSeverity, { backgroundColor: risk.type === 'risk' ? '#C5221F' : '#B06000' }]}>
                          <Text style={styles.riskSeverityText}>
                            {risk.type === 'risk' ? 'Rủi ro cao' : 'Cần lưu ý'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.riskDesc, { color: colors.textPrimary }]}>{risk.explanation}</Text>
                      {risk.recommendation && (
                        <Text style={styles.suggestedText}>💡 Gợi ý điều chỉnh: {risk.recommendation}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.safeBanner, { backgroundColor: isDark ? '#143321' : '#E6F4EA' }]}>
                  <Text style={styles.safeBannerText}>✅ Không phát hiện bẫy cọc hoặc điều khoản bất thường.</Text>
                </View>
              )}

              {/* Fair clauses found */}
              {fairFindings.length > 0 && (
                <View style={styles.fairList}>
                  <Text style={styles.fairSectionTitle}>✨ Điều khoản bảo vệ quyền lợi hai bên:</Text>
                  {fairFindings.map((fair, idx) => (
                    <View key={idx} style={styles.fairItem}>
                      <Text style={styles.fairBullet}>•</Text>
                      <Text style={[styles.fairText, { color: colors.textPrimary }]}>{fair.title}: {fair.explanation}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Mandatory Legal Disclaimer */}
              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerTitle}>⚖️ Lưu ý pháp lý:</Text>
                <Text style={styles.disclaimerText}>{LEGAL_DISCLAIMER}</Text>
              </View>
            </View>
          )}

          {/* Full Contract Document Viewer */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.textViewerHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📄 Văn bản hợp đồng</Text>
              <TouchableOpacity
                onPress={() => setUseRedactedText(!useRedactedText)}
                style={[styles.toggleBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.toggleBtnText, { color: colors.primary }]}>
                  {useRedactedText ? '👁️ Hiện thông tin đầy đủ' : '🔒 Ẩn danh PII'}
                </Text>
              </TouchableOpacity>
            </View>

            {showFullText ? (
              <View>
                <View style={[styles.codeBlock, { backgroundColor: isDark ? '#121417' : '#F8F9FA' }]}>
                  <Text style={[styles.contractText, { color: colors.textPrimary }]}>{displayedContractText}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowFullText(false)}
                  style={styles.collapseBtn}
                >
                  <Text style={[styles.collapseBtnText, { color: colors.primary }]}>▲ Thu gọn văn bản</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowFullText(true)}
                style={[styles.expandBtn, { backgroundColor: isDark ? '#1F2937' : '#F1F3F4' }]}
              >
                <Text style={[styles.expandBtnText, { color: colors.primary }]}>▼ Xem toàn văn hợp đồng ({displayedContractText.length} ký tự)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            {canSign && (
              <View style={{ marginBottom: 12 }}>
                <Button
                  title={`✍️ Ký xác nhận hợp đồng (${isLandlord ? 'Chủ trọ' : 'Khách thuê'})`}
                  onPress={handleSign}
                  variant="primary"
                />
              </View>
            )}

            {contract.status === 'active' && (
              <View style={{ marginBottom: 12 }}>
                <Button
                  title="🛑 Thanh lý / Chấm dứt hợp đồng"
                  onPress={handleTerminate}
                  variant="outline"
                />
              </View>
            )}
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
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    maxWidth: 220,
  },
  contractIdText: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  partyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  partyInfo: {
    flex: 1,
  },
  partyRole: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  partyName: {
    fontSize: 15,
    fontWeight: '600',
  },
  signStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  termGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termCol: {
    flex: 1,
  },
  termLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  termValue: {
    fontSize: 15,
    fontWeight: '700',
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
    marginBottom: 10,
  },
  aiHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0066CC',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  aiSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  privacyBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  riskList: {
    marginBottom: 12,
  },
  riskSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C5221F',
    marginBottom: 8,
  },
  riskItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  riskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C5221F',
    flex: 1,
  },
  riskSeverity: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  riskSeverityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  riskDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  suggestedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
  },
  safeBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  safeBannerText: {
    color: '#137333',
    fontSize: 12,
    fontWeight: '600',
  },
  fairList: {
    marginBottom: 12,
  },
  fairSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#137333',
    marginBottom: 6,
  },
  fairItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  fairBullet: {
    fontSize: 14,
    color: '#137333',
    marginRight: 6,
  },
  fairText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  disclaimerBox: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 10,
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  textViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contractText: {
    fontFamily: 'monospace',
    fontSize: 11.5,
    lineHeight: 18,
  },
  collapseBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  collapseBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 8,
  },
});
