import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';
import {
  ListingCosts,
  calculateTotalCosts,
  formatVND,
  DEFAULT_CONSUMPTION,
  ConsumptionAssumptions,
} from '@troviet/shared';

interface Props {
  visible: boolean;
  onClose: () => void;
  costs: ListingCosts;
}

export const InteractiveCostCalculatorModal: React.FC<Props> = ({
  visible,
  onClose,
  costs,
}) => {
  const { colors } = useTheme();

  const [assumptions, setAssumptions] = useState<ConsumptionAssumptions>({
    peopleCount: DEFAULT_CONSUMPTION.peopleCount || 1,
    vehiclesCount: DEFAULT_CONSUMPTION.vehiclesCount || 1,
    monthlyElectricityUnitsKwh: DEFAULT_CONSUMPTION.monthlyElectricityUnitsKwh || 80,
    monthlyWaterUnitsM3: DEFAULT_CONSUMPTION.monthlyWaterUnitsM3 || 4,
  });

  const result = calculateTotalCosts(costs, assumptions);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Máy tính tổng chi phí cá nhân
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Result Highlight Card */}
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resultTitle, { color: colors.textSecondary }]}>
              Ước tính hàng tháng theo nhu cầu của bạn
            </Text>
            <Text style={[styles.mainTotal, { color: colors.primary }]}>
              {formatVND(result.monthlyEstimatedTotal)}
            </Text>
            <Text style={[styles.moveInTotal, { color: colors.textPrimary }]}>
              Cần chuẩn bị khi vào ở: <Text style={{ fontWeight: '800' }}>{formatVND(result.initialMoveInTotal)}</Text>
            </Text>
            <Text style={[styles.subNote, { color: colors.textSecondary }]}>
              (Đã gồm tiền cọc {formatVND(costs.deposit)} + tiền tháng đầu tiên)
            </Text>

            {!result.isFullyTransparent && (
              <View style={[styles.warningBox, { backgroundColor: colors.badgeL1 }]}>
                <Text style={[styles.warningText, { color: colors.badgeL1Text }]}>
                  ⚠️ Lưu ý: Chủ trọ chưa cung cấp {result.unprovidedCostFields.map((f) => f.label).join(', ')}. Hãy hỏi rõ chủ nhà trước khi cọc.
                </Text>
              </View>
            )}
          </View>

          {/* Adjustments Controls */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.groupHeading, { color: colors.textPrimary }]}>
              Điều chỉnh mức sử dụng giả định
            </Text>

            {/* People Count */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Số người ở:</Text>
            <View style={styles.pillsRow}>
              {[1, 2, 3, 4].map((num) => {
                const active = assumptions.peopleCount === num;
                return (
                  <TouchableOpacity
                    key={`people-${num}`}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setAssumptions((prev) => ({ ...prev, peopleCount: num }))}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '700' }}>
                      {num} người
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Vehicles Count */}
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 14 }]}>Số lượng xe máy gửi:</Text>
            <View style={styles.pillsRow}>
              {[0, 1, 2, 3].map((num) => {
                const active = assumptions.vehiclesCount === num;
                return (
                  <TouchableOpacity
                    key={`vehicles-${num}`}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setAssumptions((prev) => ({ ...prev, vehiclesCount: num }))}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '700' }}>
                      {num} xe
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Electricity usage preset */}
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 14 }]}>
              Điện dùng dự kiến ({assumptions.monthlyElectricityUnitsKwh} kWh / tháng):
            </Text>
            <View style={styles.pillsRow}>
              {[
                { kwh: 50, label: '50 kWh (Ít dùng)' },
                { kwh: 80, label: '80 kWh (Có máy lạnh vừa)' },
                { kwh: 120, label: '120 kWh (Dùng nhiều)' },
              ].map((item) => {
                const active = assumptions.monthlyElectricityUnitsKwh === item.kwh;
                return (
                  <TouchableOpacity
                    key={`elec-${item.kwh}`}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setAssumptions((prev) => ({ ...prev, monthlyElectricityUnitsKwh: item.kwh }))}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Water usage preset */}
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 14 }]}>
              Nước dùng dự kiến ({assumptions.monthlyWaterUnitsM3} m³ / tháng):
            </Text>
            <View style={styles.pillsRow}>
              {[2, 4, 6, 8].map((m3) => {
                const active = assumptions.monthlyWaterUnitsM3 === m3;
                return (
                  <TouchableOpacity
                    key={`water-${m3}`}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setAssumptions((prev) => ({ ...prev, monthlyWaterUnitsM3: m3 }))}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '700' }}>
                      {m3} m³
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Breakdown Table */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.groupHeading, { color: colors.textPrimary }]}>Chi tiết từng khoản</Text>

            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary }}>Tiền phòng cố định:</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{formatVND(result.knownMonthlyCosts.rent)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary }}>
                Tiền điện ({assumptions.monthlyElectricityUnitsKwh} kWh):
              </Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {formatVND(result.knownMonthlyCosts.electricity)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary }}>
                Tiền nước ({assumptions.monthlyWaterUnitsM3} m³ hoặc {assumptions.peopleCount} người):
              </Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {formatVND(result.knownMonthlyCosts.water)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary }}>Internet / Wifi:</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {formatVND(result.knownMonthlyCosts.internet)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary }}>Gửi xe ({assumptions.vehiclesCount} xe):</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {formatVND(result.knownMonthlyCosts.parking)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary }}>Phí dịch vụ / vệ sinh:</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {formatVND(result.knownMonthlyCosts.service)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button title="Đã hiểu & Quay lại chi tiết phòng" variant="primary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 90,
  },
  resultCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  mainTotal: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },
  moveInTotal: {
    fontSize: 14,
    marginTop: 2,
  },
  subNote: {
    fontSize: 11,
    marginTop: 4,
  },
  warningBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  groupHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
