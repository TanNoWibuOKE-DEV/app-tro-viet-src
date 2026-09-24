import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  getAllAreaInsights,
  getWardAreaInsight,
  WardAreaInsight,
  formatVND,
} from '@troviet/shared';

interface AreaInsightsModalProps {
  visible: boolean;
  initialWardCode?: string;
  onClose: () => void;
}

export const AreaInsightsModal: React.FC<AreaInsightsModalProps> = ({
  visible,
  initialWardCode = '48_HAICHAU1',
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  const allInsights = getAllAreaInsights();
  const [selectedWardCode, setSelectedWardCode] = useState<string>(initialWardCode);

  const insight: WardAreaInsight = getWardAreaInsight(selectedWardCode);

  const getTrendBadge = () => {
    switch (insight.trend) {
      case 'increasing':
        return { label: `📈 Tăng ${insight.changePercent}% (6 tháng)`, bg: isDark ? '#332914' : '#FEF7E0', text: '#B06000' };
      case 'decreasing':
        return { label: `📉 Giảm ${insight.changePercent}% (6 tháng)`, bg: isDark ? '#143321' : '#E6F4EA', text: '#137333' };
      default:
        return { label: `➡️ Ổn định (+${insight.changePercent}%)`, bg: isDark ? '#1C2738' : '#EEF5FF', text: '#0066CC' };
    }
  };

  const trendBadge = getTrendBadge();

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mặt bằng giá thị trường</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Ward selector chips */}
          <Text style={[styles.filterHeading, { color: colors.textSecondary }]}>Chọn phường / khu vực tại TP. Đà Nẵng:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {allInsights.map((item) => {
              const isSelected = item.wardCode === selectedWardCode;
              return (
                <TouchableOpacity
                  key={item.wardCode}
                  onPress={() => setSelectedWardCode(item.wardCode)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {item.wardName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Area Summary Card */}
          <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.wardNameTitle, { color: colors.textPrimary }]}>{insight.wardName}</Text>
                <Text style={[styles.districtSub, { color: colors.textSecondary }]}>Khu vực {insight.districtLegacyName} cũ</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: trendBadge.bg }]}>
                <Text style={[styles.badgeText, { color: trendBadge.text }]}>{trendBadge.label}</Text>
              </View>
            </View>

            <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{insight.summary}</Text>

            {/* Price benchmarks */}
            <View style={styles.benchmarksRow}>
              <View style={[styles.benchmarkCol, { backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}>
                <Text style={[styles.benchmarkLabel, { color: colors.textSecondary }]}>Phòng trọ phổ thông</Text>
                <Text style={[styles.benchmarkPrice, { color: colors.primary }]}>{formatVND(insight.roomAvgRent)}</Text>
                <Text style={[styles.benchmarkUnit, { color: colors.textSecondary }]}>Trung bình / tháng</Text>
              </View>

              <View style={[styles.benchmarkCol, { backgroundColor: isDark ? '#1F2937' : '#F8F9FA' }]}>
                <Text style={[styles.benchmarkLabel, { color: colors.textSecondary }]}>Căn hộ mini / Studio</Text>
                <Text style={[styles.benchmarkPrice, { color: '#00897B' }]}>{formatVND(insight.apartmentAvgRent)}</Text>
                <Text style={[styles.benchmarkUnit, { color: colors.textSecondary }]}>Trung bình / tháng</Text>
              </View>
            </View>
          </View>

          {/* 6-Month Price Trend Table */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📊 Lịch sử biến động giá 6 tháng gần nhất</Text>
            <View style={[styles.tableHeader, { backgroundColor: isDark ? '#1F2937' : '#F1F3F4' }]}>
              <Text style={[styles.tableHCol, { flex: 1, color: colors.textSecondary }]}>Thời gian</Text>
              <Text style={[styles.tableHCol, { flex: 1.5, textAlign: 'right', color: colors.textSecondary }]}>Phòng trọ</Text>
              <Text style={[styles.tableHCol, { flex: 1.5, textAlign: 'right', color: colors.textSecondary }]}>Căn hộ mini</Text>
            </View>
            {insight.priceHistory.map((pt, idx) => (
              <View
                key={pt.month}
                style={[
                  styles.tableRow,
                  { borderBottomColor: colors.border },
                  idx % 2 === 1 && { backgroundColor: isDark ? '#16191F' : '#FAFAFA' },
                ]}
              >
                <Text style={[styles.tableCell, { flex: 1, color: colors.textPrimary, fontWeight: '600' }]}>{pt.month}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', color: colors.primary, fontWeight: '600' }]}>
                  {formatVND(pt.roomRentAvg)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', color: '#00897B', fontWeight: '600' }]}>
                  {formatVND(pt.apartmentRentAvg)}
                </Text>
              </View>
            ))}
          </View>

          {/* Utility Baselines */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>⚡ Khung giá điện & nước tham chiếu tại Đà Nẵng</Text>
            <View style={styles.utilityItem}>
              <Text style={[styles.utilityLabel, { color: colors.textPrimary }]}>💡 Điện sinh hoạt:</Text>
              <Text style={[styles.utilityVal, { color: colors.textSecondary }]}>3.000 - 3.800 đ/kWh (đồng hồ riêng)</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.utilityItem}>
              <Text style={[styles.utilityLabel, { color: colors.textPrimary }]}>💧 Nước sinh hoạt:</Text>
              <Text style={[styles.utilityVal, { color: colors.textSecondary }]}>12.000 - 18.000 đ/m³ (hoặc 40k-60k/người)</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.utilityItem}>
              <Text style={[styles.utilityLabel, { color: colors.textPrimary }]}>🌐 Internet cáp quang:</Text>
              <Text style={[styles.utilityVal, { color: colors.textSecondary }]}>50.000 - 80.000 đ/phòng/tháng</Text>
            </View>
          </View>

          {/* Area Highlights */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📍 Điểm nổi bật & Lời khuyên chọn phòng</Text>
            {insight.highlights.map((h, i) => (
              <View key={i} style={styles.highlightItem}>
                <Text style={styles.highlightBullet}>✓</Text>
                <Text style={[styles.highlightText, { color: colors.textPrimary }]}>{h}</Text>
              </View>
            ))}
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
  filterHeading: {
    fontSize: 13,
    marginBottom: 8,
  },
  chipsScroll: {
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  mainCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  wardNameTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  districtSub: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 14,
  },
  benchmarksRow: {
    flexDirection: 'row',
    gap: 10,
  },
  benchmarkCol: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  benchmarkLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  benchmarkPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  benchmarkUnit: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableHCol: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12.5,
  },
  utilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  utilityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  utilityVal: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightBullet: {
    fontSize: 14,
    color: '#137333',
    fontWeight: '700',
    marginRight: 8,
  },
  highlightText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
