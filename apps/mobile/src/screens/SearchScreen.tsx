import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';
import {
  PropertyType,
  STANDARD_AMENITIES,
  normalizeVietnameseText,
} from '@troviet/shared';

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: 0, max: 999999999 },
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: '2 - 3,5 triệu', min: 2000000, max: 3500000 },
  { label: '3,5 - 5 triệu', min: 3500000, max: 5000000 },
  { label: 'Trên 5 triệu', min: 5000000, max: 999999999 },
];

const WARDS = [
  { code: 'all', name: 'Toàn thành phố' },
  { code: '48_HAICHAU1', name: 'Phường Hải Châu I' },
  { code: '48_PHUOCMY', name: 'Phường Phước Mỹ (Mỹ Khê)' },
  { code: '48_HOAKHANHBAC', name: 'Phường Hòa Khánh Bắc' },
  { code: '48_HOACUONGNAM', name: 'Phường Hòa Cường Nam' },
];

export const SearchScreen: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const { colors } = useTheme();
  const { listings, setSelectedListing } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | 'all'>('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const toggleAmenity = (code: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const filteredResults = useMemo(() => {
    const published = listings.filter((l) => l.status === 'published');
    const normQuery = normalizeVietnameseText(query);
    const priceConfig = PRICE_RANGES[selectedPriceRangeIndex];

    return published
      .filter((item) => {
        // Price filter
        if (item.monthlyRent < priceConfig.min || item.monthlyRent > priceConfig.max) {
          return false;
        }

        // Ward filter
        if (selectedWard !== 'all' && item.wardCode !== selectedWard) {
          return false;
        }

        // Property type
        if (selectedPropertyType !== 'all' && item.propertyType !== selectedPropertyType) {
          return false;
        }

        // Amenities filter
        if (selectedAmenities.length > 0) {
          const itemAmenityCodes = item.amenities.map((a) => a.code);
          const hasAllSelected = selectedAmenities.every((code) =>
            itemAmenityCodes.includes(code)
          );
          if (!hasAllSelected) return false;
        }

        // Text query search with unaccent support
        if (normQuery.length > 0) {
          const normTitle = normalizeVietnameseText(item.title);
          const normStreet = normalizeVietnameseText(item.street);
          const normWard = normalizeVietnameseText(item.wardName);
          const matches =
            normTitle.includes(normQuery) ||
            normStreet.includes(normQuery) ||
            normWard.includes(normQuery);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.monthlyRent - b.monthlyRent;
        if (sortBy === 'price_desc') return b.monthlyRent - a.monthlyRent;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    listings,
    query,
    selectedPriceRangeIndex,
    selectedWard,
    selectedPropertyType,
    selectedAmenities,
    sortBy,
  ]);

  const activeFilterCount =
    (selectedPriceRangeIndex !== 0 ? 1 : 0) +
    (selectedWard !== 'all' ? 1 : 0) +
    (selectedPropertyType !== 'all' ? 1 : 0) +
    selectedAmenities.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Search & Filter Bar */}
      <View style={[styles.searchHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ marginRight: 6 }}>🔍</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Tìm theo khu vực, đường, trường ĐH..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: colors.textSecondary, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.background,
              borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Text
            style={[
              styles.filterBtnText,
              { color: activeFilterCount > 0 ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            ⚙️ Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Pills Row */}
      <View style={[styles.sortRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sắp xếp:</Text>
        <TouchableOpacity
          style={[styles.sortPill, sortBy === 'newest' && { backgroundColor: colors.background }]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={{ color: sortBy === 'newest' ? colors.primary : colors.textSecondary, fontWeight: '600', fontSize: 12 }}>
            Mới nhất
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortPill, sortBy === 'price_asc' && { backgroundColor: colors.background }]}
          onPress={() => setSortBy('price_asc')}
        >
          <Text style={{ color: sortBy === 'price_asc' ? colors.primary : colors.textSecondary, fontWeight: '600', fontSize: 12 }}>
            Giá tăng dần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortPill, sortBy === 'price_desc' && { backgroundColor: colors.background }]}
          onPress={() => setSortBy('price_desc')}
        >
          <Text style={{ color: sortBy === 'price_desc' ? colors.primary : colors.textSecondary, fontWeight: '600', fontSize: 12 }}>
            Giá giảm dần
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Feed */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.resultsInfoRow}>
          <Text style={[styles.resultsCountText, { color: colors.textSecondary }]}>
            Tìm thấy <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{filteredResults.length}</Text> phòng phù hợp
          </Text>
        </View>

        {filteredResults.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Không tìm thấy phòng phù hợp
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Bạn hãy thử nới rộng khoảng giá hoặc bỏ bớt các tiêu chí tiện nghi để xem thêm kết quả nhé.
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button
                title="Xóa toàn bộ bộ lọc"
                variant="outline"
                onPress={() => {
                  setQuery('');
                  setSelectedPriceRangeIndex(0);
                  setSelectedWard('all');
                  setSelectedPropertyType('all');
                  setSelectedAmenities([]);
                }}
              />
            </View>
          </View>
        ) : (
          filteredResults.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPress={() => setSelectedListing(listing)}
            />
          ))
        )}
      </ScrollView>

      {/* Advanced Filter Modal */}
      <Modal visible={isFilterModalOpen} animationType="slide">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Đóng</Text>
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Bộ lọc tìm kiếm</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedPriceRangeIndex(0);
                setSelectedWard('all');
                setSelectedPropertyType('all');
                setSelectedAmenities([]);
              }}
            >
              <Text style={{ color: colors.warning, fontWeight: '600', fontSize: 13 }}>Đặt lại</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Price Ranges */}
            <Text style={[styles.filterGroupTitle, { color: colors.textPrimary }]}>Khoảng giá thuê</Text>
            <View style={styles.filterChipGrid}>
              {PRICE_RANGES.map((r, idx) => (
                <TouchableOpacity
                  key={r.label}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedPriceRangeIndex === idx ? colors.primary : colors.card,
                      borderColor: selectedPriceRangeIndex === idx ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPriceRangeIndex(idx)}
                >
                  <Text style={{ color: selectedPriceRangeIndex === idx ? '#FFFFFF' : colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ward Selector */}
            <Text style={[styles.filterGroupTitle, { color: colors.textPrimary, marginTop: 18 }]}>Khu vực (Phường)</Text>
            <View style={styles.filterChipGrid}>
              {WARDS.map((w) => (
                <TouchableOpacity
                  key={w.code}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedWard === w.code ? colors.primary : colors.card,
                      borderColor: selectedWard === w.code ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedWard(w.code)}
                >
                  <Text style={{ color: selectedWard === w.code ? '#FFFFFF' : colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                    {w.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amenities Checklist */}
            <Text style={[styles.filterGroupTitle, { color: colors.textPrimary, marginTop: 18 }]}>Tiện nghi bắt buộc</Text>
            <View style={styles.amenitiesCheckGrid}>
              {STANDARD_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity.code);
                return (
                  <TouchableOpacity
                    key={amenity.code}
                    style={[
                      styles.amenityCheckPill,
                      {
                        backgroundColor: checked ? colors.primary : colors.card,
                        borderColor: checked ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleAmenity(amenity.code)}
                  >
                    <Text style={{ color: checked ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                      {checked ? '✓ ' : '+ '}
                      {amenity.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Modal Apply Footer */}
          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <Button
              title={`Áp dụng (${filteredResults.length} phòng)`}
              variant="primary"
              onPress={() => setIsFilterModalOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  filterButton: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
  },
  sortPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  resultsInfoRow: {
    marginBottom: 8,
  },
  resultsCountText: {
    fontSize: 13,
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 16,
    paddingBottom: 80,
  },
  filterGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  filterChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  amenitiesCheckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityCheckPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
});
