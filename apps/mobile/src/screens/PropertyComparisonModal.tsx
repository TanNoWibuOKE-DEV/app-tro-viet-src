import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';
import {
  formatVND,
  formatArea,
  calculateTotalCosts,
  STANDARD_AMENITIES,
} from '@troviet/shared';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const PropertyComparisonModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { listings, comparisonIds, clearComparison, setSelectedListing } = useApp();

  const comparedListings = listings.filter((l) => comparisonIds.includes(l.id));

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            So sánh {comparedListings.length} phòng trọ
          </Text>
          <TouchableOpacity onPress={clearComparison}>
            <Text style={{ color: colors.warning, fontWeight: '600', fontSize: 13 }}>Bỏ chọn</Text>
          </TouchableOpacity>
        </View>

        {comparedListings.length < 2 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>⚖️</Text>
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
              Vui lòng chọn ít nhất 2 phòng để so sánh
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Bấm "+ So sánh" ở thẻ phòng bất kỳ trên Trang chủ hoặc Phòng đã lưu.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.tableScroll}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tableVertical}>
              {/* Columns Header: Titles & Badges */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary }]}>Phòng so sánh</Text>
                </View>
                {comparedListings.map((item) => (
                  <View key={`th-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Badge level={item.landlordVerificationLevel} />
                    <Text style={[styles.colTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.colAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.street}, {item.wardName}
                    </Text>
                    <TouchableOpacity
                      style={[styles.viewBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        onClose();
                        setSelectedListing(item);
                      }}
                    >
                      <Text style={styles.viewBtnText}>Xem phòng</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Monthly Rent */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary }]}>Giá thuê phòng</Text>
                </View>
                {comparedListings.map((item) => (
                  <View key={`rent-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.valueHighlight, { color: colors.primary }]}>
                      {formatVND(item.monthlyRent)}/tháng
                    </Text>
                  </View>
                ))}
              </View>

              {/* Deposit */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary }]}>Tiền đặt cọc</Text>
                </View>
                {comparedListings.map((item) => (
                  <View key={`dep-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.valueText, { color: colors.textPrimary }]}>
                      {formatVND(item.deposit)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Monthly Estimated Total (Strict Transparent Pricing) */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textPrimary, fontWeight: '800' }]}>
                    Mỗi tháng (ước tính)
                  </Text>
                </View>
                {comparedListings.map((item) => {
                  const calc = calculateTotalCosts(item.costs);
                  return (
                    <View key={`total-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.valueHighlightLarge, { color: colors.primary }]}>
                        {formatVND(calc.monthlyEstimatedTotal)}
                      </Text>
                      {!calc.isFullyTransparent && (
                        <Text style={{ color: colors.warning, fontSize: 10, marginTop: 2 }}>
                          Thiếu {calc.unprovidedCostFields.length} phí
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Move-in total */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary }]}>
                    Cần chuẩn bị khi vào ở
                  </Text>
                </View>
                {comparedListings.map((item) => {
                  const calc = calculateTotalCosts(item.costs);
                  return (
                    <View key={`movein-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.valueText, { color: colors.textPrimary, fontWeight: '700' }]}>
                        {formatVND(calc.initialMoveInTotal)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Area */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary }]}>Diện tích</Text>
                </View>
                {comparedListings.map((item) => (
                  <View key={`area-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.valueText, { color: colors.textPrimary }]}>
                      {formatArea(item.areaSquareMeters)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Electricity Rate */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary }]}>Đơn giá điện</Text>
                </View>
                {comparedListings.map((item) => (
                  <View key={`elec-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.valueText, { color: colors.textPrimary }]}>
                      {formatVND(item.costs.electricityCostPerUnit)}/kWh
                    </Text>
                  </View>
                ))}
              </View>

              {/* Amenities Comparison */}
              <View style={styles.comparisonRow}>
                <View style={[styles.labelCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.rowLabelText, { color: colors.textSecondary, fontWeight: '700' }]}>Tiện nghi</Text>
                </View>
                {comparedListings.map((item) => (
                  <View key={`amen-${item.id}`} style={[styles.dataCol, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {STANDARD_AMENITIES.slice(0, 6).map((amenity) => {
                      const hasAmenity = item.amenities.some((a) => a.code === amenity.code);
                      return (
                        <Text
                          key={amenity.code}
                          style={{
                            fontSize: 11,
                            color: hasAmenity ? colors.textPrimary : colors.textSecondary,
                            marginVertical: 2,
                          }}
                        >
                          {hasAmenity ? '✓ ' : '✕ '} {amenity.name}
                        </Text>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  tableScroll: {
    padding: 12,
  },
  tableVertical: {
    paddingBottom: 60,
  },
  comparisonRow: {
    flexDirection: 'row',
  },
  labelCol: {
    width: 120,
    padding: 10,
    borderWidth: 1,
    justifyContent: 'center',
  },
  rowLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataCol: {
    width: 180,
    padding: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  colAddress: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  viewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  valueHighlight: {
    fontSize: 14,
    fontWeight: '800',
  },
  valueHighlightLarge: {
    fontSize: 16,
    fontWeight: '900',
  },
  valueText: {
    fontSize: 12,
  },
});
