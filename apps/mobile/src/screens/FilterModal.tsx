import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { PropertyType, STANDARD_AMENITIES } from '@troviet/shared';

export interface FilterState {
  priceIndex: number;
  wardCode: string;
  propertyType: PropertyType | 'all';
  amenityCodes: string[];
  conditions: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
  totalMatching: number;
}

export const PRICE_OPTIONS = [
  { label: 'Tất cả giá', min: 0, max: 999999999 },
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: '2 - 3,5 triệu', min: 2000000, max: 3500000 },
  { label: '3,5 - 5 triệu', min: 3500000, max: 5000000 },
  { label: 'Trên 5 triệu', min: 5000000, max: 999999999 },
];

export const WARDS_OPTIONS = [
  { code: 'all', name: 'Toàn thành phố Đà Nẵng' },
  { code: '48_HAICHAU1', name: 'Phường Hải Châu I' },
  { code: '48_PHUOCMY', name: 'Phường Phước Mỹ (Mỹ Khê)' },
  { code: '48_HOAKHANHBAC', name: 'Phường Hòa Khánh Bắc' },
  { code: '48_HOACUONGNAM', name: 'Phường Hòa Cường Nam' },
];

export const ROOM_TYPE_OPTIONS: Array<{ type: PropertyType | 'all'; label: string }> = [
  { type: 'all', label: 'Tất cả' },
  { type: 'room', label: 'Phòng trọ' },
  { type: 'apartment', label: 'Căn hộ mini' },
  { type: 'house', label: 'Nhà nguyên căn' },
  { type: 'shared', label: 'Ở ghép' },
];

export const CONDITION_OPTIONS = [
  { code: 'free_hours', label: 'Giờ giấc tự do' },
  { code: 'no_curfew', label: 'Không chung chủ' },
  { code: 'allow_pets', label: 'Cho phép nuôi thú cưng' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  totalMatching,
}) => {
  const { colors } = useTheme();

  // Local draft state
  const [draft, setDraft] = useState<FilterState>(filters);

  // Accordion open/collapse states
  const [expandedSection, setExpandedSection] = useState<string | null>('price');

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const toggleAmenity = (code: string) => {
    setDraft((prev) => ({
      ...prev,
      amenityCodes: prev.amenityCodes.includes(code)
        ? prev.amenityCodes.filter((c) => c !== code)
        : [...prev.amenityCodes, code],
    }));
  };

  const toggleCondition = (code: string) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(code)
        ? prev.conditions.filter((c) => c !== code)
        : [...prev.conditions, code],
    }));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const cleared: FilterState = {
      priceIndex: 0,
      wardCode: 'all',
      propertyType: 'all',
      amenityCodes: [],
      conditions: [],
    };
    setDraft(cleared);
    onReset();
  };

  // Sync draft when opened
  React.useEffect(() => {
    if (visible) {
      setDraft(filters);
    }
  }, [visible, filters]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityRole="button">
            <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Bộ lọc tìm kiếm
          </Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn} accessibilityRole="button">
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>Đặt lại</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Accordion 1: Giá phòng */}
          <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('price')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
                  💰 Khoảng giá phòng
                </Text>
                <Text style={[styles.accordionSubtitle, { color: colors.primary }]}>
                  {PRICE_OPTIONS[draft.priceIndex].label}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                {expandedSection === 'price' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'price' && (
              <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                <View style={styles.pillsWrap}>
                  {PRICE_OPTIONS.map((item, idx) => {
                    const active = draft.priceIndex === idx;
                    return (
                      <TouchableOpacity
                        key={item.label}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: active ? colors.primary : colors.background,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setDraft((prev) => ({ ...prev, priceIndex: idx }))}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: active ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Accordion 2: Địa điểm (2-tier: Tỉnh/Thành -> Phường) */}
          <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('location')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
                  📍 Địa điểm (Khu vực / Phường)
                </Text>
                <Text style={[styles.accordionSubtitle, { color: colors.primary }]}>
                  {WARDS_OPTIONS.find((w) => w.code === draft.wardCode)?.name || 'Tất cả'}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                {expandedSection === 'location' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'location' && (
              <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                <View style={styles.pillsWrap}>
                  {WARDS_OPTIONS.map((w) => {
                    const active = draft.wardCode === w.code;
                    return (
                      <TouchableOpacity
                        key={w.code}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: active ? colors.primary : colors.background,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setDraft((prev) => ({ ...prev, wardCode: w.code }))}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: active ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {w.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Accordion 3: Loại phòng */}
          <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('room_type')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
                  🏠 Loại hình bất động sản
                </Text>
                <Text style={[styles.accordionSubtitle, { color: colors.primary }]}>
                  {ROOM_TYPE_OPTIONS.find((r) => r.type === draft.propertyType)?.label || 'Tất cả'}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                {expandedSection === 'room_type' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'room_type' && (
              <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                <View style={styles.pillsWrap}>
                  {ROOM_TYPE_OPTIONS.map((item) => {
                    const active = draft.propertyType === item.type;
                    return (
                      <TouchableOpacity
                        key={item.type}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: active ? colors.primary : colors.background,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() =>
                          setDraft((prev) => ({ ...prev, propertyType: item.type }))
                        }
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: active ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Accordion 4: Tiện nghi */}
          <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('amenities')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
                  ✨ Tiện nghi & Nội thất
                </Text>
                <Text style={[styles.accordionSubtitle, { color: colors.primary }]}>
                  {draft.amenityCodes.length > 0
                    ? `Đã chọn ${draft.amenityCodes.length} tiện nghi`
                    : 'Chưa chọn'}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                {expandedSection === 'amenities' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'amenities' && (
              <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                <View style={styles.pillsWrap}>
                  {STANDARD_AMENITIES.map((amenity) => {
                    const active = draft.amenityCodes.includes(amenity.code);
                    return (
                      <TouchableOpacity
                        key={amenity.code}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: active ? colors.primary : colors.background,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => toggleAmenity(amenity.code)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: active ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {active ? '✓ ' : '+ '}
                          {amenity.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Accordion 5: Điều kiện phòng */}
          <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('conditions')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
                  📋 Điều kiện & Giờ giấc
                </Text>
                <Text style={[styles.accordionSubtitle, { color: colors.primary }]}>
                  {draft.conditions.length > 0
                    ? `Đã chọn ${draft.conditions.length} điều kiện`
                    : 'Mặc định'}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                {expandedSection === 'conditions' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'conditions' && (
              <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                <View style={styles.pillsWrap}>
                  {CONDITION_OPTIONS.map((item) => {
                    const active = draft.conditions.includes(item.code);
                    return (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: active ? colors.primary : colors.background,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => toggleCondition(item.code)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: active ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {active ? '✓ ' : '+ '}
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            title={`Áp dụng kết quả (${totalMatching} phòng)`}
            variant="primary"
            onPress={handleApply}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 10,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resetBtn: {
    paddingVertical: 6,
    paddingLeft: 10,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  accordionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  accordionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  accordionBody: {
    padding: 16,
    borderTopWidth: 1,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
});
