import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ListingCosts, calculateTotalCosts, formatVND } from '@troviet/shared';
import { InteractiveCostCalculatorModal } from './InteractiveCostCalculatorModal';

interface CostCardProps {
  costs: ListingCosts;
}

export const CostCard: React.FC<CostCardProps> = ({ costs }) => {
  const { colors } = useTheme();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const result = calculateTotalCosts(costs);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Minh bạch chi phí</Text>
        <TouchableOpacity
          style={[styles.calcBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setIsCalculatorOpen(true)}
        >
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            🧮 Tùy chỉnh mức dùng
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 2 Main Figures */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Mỗi tháng (ước tính)</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatVND(result.monthlyEstimatedTotal)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Cần chuẩn bị khi vào ở</Text>
          <Text style={[styles.summaryValueSecondary, { color: colors.textPrimary }]}>
            {formatVND(result.initialMoveInTotal)}
          </Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            (Gồm cọc + tiền tháng đầu)
          </Text>
        </View>
      </View>

      <InteractiveCostCalculatorModal
        visible={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        costs={costs}
      />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Breakdown */}
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tiền phòng:</Text>
        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
          {formatVND(costs.monthlyRent)}/tháng
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tiền điện:</Text>
        <Text
          style={[
            styles.detailValue,
            {
              color:
                costs.electricityBillingType === 'unprovided'
                  ? colors.warning
                  : colors.textPrimary,
            },
          ]}
        >
          {costs.electricityBillingType === 'unprovided'
            ? 'Chủ trọ chưa cung cấp'
            : `${formatVND(costs.electricityCostPerUnit)}/kWh`}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tiền nước:</Text>
        <Text
          style={[
            styles.detailValue,
            {
              color:
                costs.waterBillingType === 'unprovided'
                  ? colors.warning
                  : colors.textPrimary,
            },
          ]}
        >
          {costs.waterBillingType === 'unprovided'
            ? 'Chủ trọ chưa cung cấp'
            : `${formatVND(costs.waterCostPerUnit)}/m³`}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Internet / Wifi:</Text>
        <Text
          style={[
            styles.detailValue,
            {
              color:
                costs.internetBillingType === 'unprovided'
                  ? colors.warning
                  : colors.textPrimary,
            },
          ]}
        >
          {costs.internetBillingType === 'unprovided'
            ? 'Chủ trọ chưa cung cấp'
            : `${formatVND(costs.internetCost)}/tháng`}
        </Text>
      </View>

      {/* Unprovided warnings banner if not fully transparent */}
      {!result.isFullyTransparent && (
        <View style={[styles.warningBanner, { backgroundColor: colors.badgeL1 }]}>
          <Text style={[styles.warningBannerText, { color: colors.badgeL1Text }]}>
            ℹ Có {result.unprovidedCostFields.length} khoản chi phí chủ trọ chưa công bố. Vui lòng xác nhận trước khi đặt cọc.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  calcBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryValueSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningBanner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  warningBannerText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
