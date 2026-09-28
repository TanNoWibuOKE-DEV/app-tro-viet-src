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
  FloodReport,
  FloodSeverity,
  HISTORICAL_FLOOD_HOTSPOTS,
  createFloodReport,
  upvoteFloodReport,
} from '@troviet/shared';

interface FloodRiskMapModalProps {
  visible: boolean;
  onClose: () => void;
  initialCityCode?: 'danang' | 'hanoi' | 'hcm';
}

export const FloodRiskMapModal: React.FC<FloodRiskMapModalProps> = ({
  visible,
  onClose,
  initialCityCode = 'danang',
}) => {
  const { colors, isDark } = useTheme();
  const [selectedCity, setSelectedCity] = useState<'danang' | 'hanoi' | 'hcm'>(initialCityCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<FloodReport[]>(HISTORICAL_FLOOD_HOTSPOTS);

  // New Report Modal Form
  const [isReporting, setIsReporting] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newWard, setNewWard] = useState('');
  const [newDepth, setNewDepth] = useState('30');
  const [newSeverity, setNewSeverity] = useState<FloodSeverity>('moderate');
  const [newDesc, setNewDesc] = useState('');

  const cityReports = reports.filter((r) => r.cityCode === selectedCity);
  const filteredReports = cityReports.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.streetName.toLowerCase().includes(q) || r.wardSlug.toLowerCase().includes(q);
  });

  const handleUpvote = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updated = upvoteFloodReport(r);
          Alert.alert(
            'Cảm ơn bạn đã xác thực!',
            `Điểm cảnh báo đã nhận được ${updated.upvotes} lượt đồng thuận từ cư dân.`
          );
          return updated;
        }
        return r;
      })
    );
  };

  const handleAddReport = () => {
    if (!newStreet.trim() || !newDesc.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đường và mô tả tình trạng ngập nước.');
      return;
    }

    const report = createFloodReport({
      cityCode: selectedCity,
      wardSlug: newWard.trim().toLowerCase().replace(/\s+/g, '-') || 'khu-vuc-chung',
      streetName: newStreet.trim(),
      latitude: selectedCity === 'danang' ? 16.07 : selectedCity === 'hanoi' ? 21.03 : 10.82,
      longitude: selectedCity === 'danang' ? 108.21 : selectedCity === 'hanoi' ? 105.8 : 106.7,
      severity: newSeverity,
      depthCm: parseInt(newDepth || '20', 10),
      description: newDesc.trim(),
    });

    setReports([report, ...reports]);
    setIsReporting(false);
    setNewStreet('');
    setNewDesc('');
    Alert.alert(
      'Gửi cảnh báo thành công',
      'Cảnh báo của bạn đã được ghi nhận và hiển thị cho cộng đồng người thuê trọ trong khu vực.'
    );
  };

  const getSeverityBadge = (severity: FloodSeverity) => {
    switch (severity) {
      case 'severe':
        return { label: '🔴 Ngập nặng (>50cm)', bg: isDark ? '#450A0A' : '#FEE2E2', text: '#DC2626' };
      case 'moderate':
        return { label: '🟡 Ngập vừa (20-50cm)', bg: isDark ? '#451A03' : '#FEF3C7', text: '#D97706' };
      case 'light':
      default:
        return { label: '🟢 Ngập nhẹ (10-20cm)', bg: isDark ? '#064E3B' : '#DCFCE7', text: '#16A34A' };
    }
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
            🌊 Cảnh Báo Ngập Lụt Mùa Mưa
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {/* City Filter Pills */}
        <View style={[styles.cityRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {[
            { code: 'danang', name: 'Đà Nẵng' },
            { code: 'hanoi', name: 'Hà Nội' },
            { code: 'hcm', name: 'TP. Hồ Chí Minh' },
          ].map((item) => {
            const active = selectedCity === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.cityPill,
                  {
                    backgroundColor: active ? colors.primary : isDark ? '#374151' : '#E5E7EB',
                  },
                ]}
                onPress={() => setSelectedCity(item.code as any)}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: active ? '#FFFFFF' : colors.textPrimary,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Advisory Safety Box */}
          <View style={[styles.infoBanner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.primary }]}>
            <Text style={[styles.bannerTitle, { color: colors.primary }]}>
              🌧️ Kinh nghiệm chọn trọ mùa mưa bão
            </Text>
            <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
              Nếu thuê phòng trọ gần các điểm cảnh báo đỏ, hãy ưu tiên chọn phòng từ tầng 2 trở lên hoặc có gác lửng cao ráo. Tránh để xe máy ở tầng trệt không có gờ chắn sóng khi bão to.
            </Text>
          </View>

          {/* Search & Action Bar */}
          <View style={styles.actionRow}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="🔍 Tìm theo tên đường, phường..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[styles.addReportBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => setIsReporting(true)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>+ Báo ngập</Text>
            </TouchableOpacity>
          </View>

          {/* List of Warning Points */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Điểm ngập lụt được ghi nhận ({filteredReports.length})
          </Text>

          {filteredReports.map((report) => {
            const badge = getSeverityBadge(report.severity);
            return (
              <View
                key={report.id}
                style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: badge.text }}>
                      {badge.label}
                    </Text>
                  </View>
                  {report.verified && (
                    <Text style={styles.verifiedTag}>✓ Đã xác thực cộng đồng</Text>
                  )}
                </View>

                <Text style={[styles.streetName, { color: colors.textPrimary }]}>
                  📍 {report.streetName}
                </Text>

                <Text style={[styles.reportDesc, { color: colors.textSecondary }]}>
                  {report.description}
                </Text>

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Độ sâu ước lượng: ~{report.depthCm} cm
                  </Text>
                  <TouchableOpacity
                    style={[styles.upvoteBtn, { borderColor: colors.border }]}
                    onPress={() => handleUpvote(report.id)}
                  >
                    <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>
                      👍 Đồng thuận ({report.upvotes})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Báo Ngập Mới */}
        <Modal visible={isReporting} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                📢 Báo Cáo Điểm Ngập Nước
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
                Đóng góp dữ liệu giúp sinh viên và người thuê phòng tránh được các khu ngập lụt.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Tên tuyến đường / ngõ hẻm:</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ví dụ: Đường Mẹ Suốt, K233 Xuân Thủy..."
                placeholderTextColor={colors.textSecondary}
                value={newStreet}
                onChangeText={setNewStreet}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Mức độ ngập lụt:</Text>
              <View style={styles.severityPicker}>
                {(['light', 'moderate', 'severe'] as FloodSeverity[]).map((sev) => {
                  const active = newSeverity === sev;
                  return (
                    <TouchableOpacity
                      key={sev}
                      style={[
                        styles.sevBtn,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : isDark
                            ? '#374151'
                            : '#E5E7EB',
                        },
                      ]}
                      onPress={() => setNewSeverity(sev)}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : colors.textPrimary,
                        }}
                      >
                        {sev === 'severe' ? '🔴 Nặng' : sev === 'moderate' ? '🟡 Vừa' : '🟢 Nhẹ'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Mô tả chi tiết:</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Mô tả mức ngập, thời gian nước rút, ảnh hưởng..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={newDesc}
                onChangeText={setNewDesc}
              />

              <View style={styles.modalBtns}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Button title="Hủy bỏ" onPress={() => setIsReporting(false)} variant="secondary" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Button title="Gửi báo cáo" onPress={handleAddReport} variant="primary" />
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
  cityRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  cityPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  content: {
    padding: 16,
  },
  infoBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  addReportBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  reportCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  streetName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  upvoteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  severityPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sevBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
