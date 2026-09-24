import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';
import {
  PropertyType,
  STANDARD_AMENITIES,
  normalizeVietnameseText,
  parseNaturalLanguageSearch,
  AISearchParseResult,
  formatVND,
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

const AI_PROMPT_SUGGESTIONS = [
  'Phòng trọ Hải Châu < 3tr có máy lạnh',
  'Căn hộ Phước Mỹ gần biển < 5tr',
  'Phòng Hòa Khánh Bắc có gác < 2tr5',
  'Phòng Hòa Cường Nam giờ tự do',
];

export const SearchScreen: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const { colors, isDark } = useTheme();
  const {
    listings,
    setSelectedListing,
    savedSearches,
    saveSearch,
    removeSavedSearch,
  } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [customMaxRent, setCustomMaxRent] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | 'all'>('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSavedSearchesModalOpen, setIsSavedSearchesModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AISearchParseResult | null>(null);

  const toggleAmenity = (code: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const executeAISearch = (text: string) => {
    setQuery(text);
    const result = parseNaturalLanguageSearch(text);
    setAiResult(result);

    if (result.parsedFilter.wardCode) {
      setSelectedWard(result.parsedFilter.wardCode);
    }
    if (result.parsedFilter.propertyType) {
      setSelectedPropertyType(result.parsedFilter.propertyType);
    }
    if (result.parsedFilter.amenityCodes && result.parsedFilter.amenityCodes.length > 0) {
      setSelectedAmenities(result.parsedFilter.amenityCodes);
    }
    if (result.parsedFilter.maxRent) {
      setCustomMaxRent(result.parsedFilter.maxRent);
      setSelectedPriceRangeIndex(0);
    } else {
      setCustomMaxRent(null);
    }
  };

  const clearAISearch = () => {
    setAiResult(null);
    setCustomMaxRent(null);
    setQuery('');
    setSelectedPriceRangeIndex(0);
    setSelectedWard('all');
    setSelectedPropertyType('all');
    setSelectedAmenities([]);
  };

  const applySavedSearch = (savedCriteria: any) => {
    setQuery(savedCriteria.criteria.query || '');
    if (savedCriteria.criteria.wardCode) {
      setSelectedWard(savedCriteria.criteria.wardCode);
    } else {
      setSelectedWard('all');
    }
    if (savedCriteria.criteria.propertyType) {
      setSelectedPropertyType(savedCriteria.criteria.propertyType);
    } else {
      setSelectedPropertyType('all');
    }
    if (savedCriteria.criteria.amenityCodes) {
      setSelectedAmenities(savedCriteria.criteria.amenityCodes);
    } else {
      setSelectedAmenities([]);
    }
    if (savedCriteria.criteria.maxRent) {
      setCustomMaxRent(savedCriteria.criteria.maxRent);
      setSelectedPriceRangeIndex(0);
    } else {
      setCustomMaxRent(null);
    }
    setIsSavedSearchesModalOpen(false);
  };

  const handleSaveCurrentSearch = () => {
    const searchName =
      query.trim() ||
      `Tìm kiếm ${selectedWard !== 'all' ? selectedWard : 'Đà Nẵng'} ${
        customMaxRent ? `< ${formatVND(customMaxRent)}` : ''
      }`;
    saveSearch(searchName, {
      query,
      wardCode: selectedWard !== 'all' ? selectedWard : undefined,
      propertyType: selectedPropertyType !== 'all' ? selectedPropertyType : undefined,
      amenityCodes: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      maxRent: customMaxRent || undefined,
    });
    Alert.alert(
      'Đã lưu tìm kiếm',
      `Đã lưu tiêu chí "${searchName}". Bạn có thể xem lại trong mục "Tìm kiếm đã lưu".`
    );
  };

  useEffect(() => {
    if (initialQuery.trim().length > 0) {
      executeAISearch(initialQuery.trim());
    }
  }, [initialQuery]);

  const filteredResults = useMemo(() => {
    const published = listings.filter((l) => l.status === 'published');
    const normQuery = normalizeVietnameseText(query);
    const priceConfig = PRICE_RANGES[selectedPriceRangeIndex];

    return published
      .filter((item) => {
        // Custom max rent from AI if active
        if (customMaxRent !== null && item.monthlyRent > customMaxRent) {
          return false;
        }

        // Price filter from standard range
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
        if (normQuery.length > 0 && !aiResult) {
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
    customMaxRent,
    selectedWard,
    selectedPropertyType,
    selectedAmenities,
    sortBy,
    aiResult,
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
            placeholder="Tìm tự nhiên (VD: 2tr5, có gác, Hải Châu)..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => executeAISearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: colors.textSecondary, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.aiSearchBtn, { backgroundColor: colors.primary }]}
          onPress={() => executeAISearch(query)}
        >
          <Text style={styles.aiSearchBtnText}>🤖 AI</Text>
        </TouchableOpacity>

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
            ⚙️ {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick AI Suggestions Row */}
      <View style={[styles.suggestionsBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
          <Text style={[styles.promptLabel, { color: colors.textSecondary }]}>🤖 Gợi ý:</Text>
          {AI_PROMPT_SUGGESTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.promptPill, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => executeAISearch(p)}
            >
              <Text style={[styles.promptPillText, { color: colors.textPrimary }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* AI Interpretation Chip (Disciplined & Fact-backed) */}
      {aiResult && (
        <View style={[styles.aiChipBox, { backgroundColor: isDark ? '#1a2332' : '#e7f5ff', borderColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiChipTitle, { color: colors.primary }]}>
              🤖 Trợ lý AI đã hiểu:
            </Text>
            <Text style={[styles.aiChipExplanation, { color: colors.textPrimary }]}>
              {aiResult.explanation}
            </Text>
          </View>
          <View style={styles.aiChipActions}>
            <TouchableOpacity onPress={() => setIsFilterModalOpen(true)} style={styles.aiActionBtn}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAISearch} style={styles.aiActionBtn}>
              <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            Tìm thấy <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{filteredResults.length}</Text> phòng
          </Text>
          <View style={styles.savedActionsRow}>
            <TouchableOpacity style={styles.saveSearchBtn} onPress={handleSaveCurrentSearch}>
              <Text style={[styles.saveSearchBtnText, { color: colors.primary }]}>
                🔔 Lưu
              </Text>
            </TouchableOpacity>
            {savedSearches.length > 0 && (
              <TouchableOpacity
                style={[styles.savedListBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsSavedSearchesModalOpen(true)}
              >
                <Text style={{ fontSize: 11, color: colors.textPrimary, fontWeight: '600' }}>
                  ⭐ Đã lưu ({savedSearches.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
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

      {/* Saved Searches Modal (Phase 5) */}
      <Modal visible={isSavedSearchesModalOpen} animationType="slide">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsSavedSearchesModalOpen(false)}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Đóng</Text>
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
              Tìm kiếm đã lưu ({savedSearches.length})
            </Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {savedSearches.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  Chưa có tìm kiếm nào được lưu
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Khi bạn tìm kiếm phòng ưng ý, hãy nhấn nút "🔔 Lưu" để lưu lại tiêu chí tìm kiếm.
                </Text>
              </View>
            ) : (
              savedSearches.map((saved) => (
                <View
                  key={saved.id}
                  style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.savedName, { color: colors.textPrimary }]}>
                      {saved.name}
                    </Text>
                    <Text style={[styles.savedDate, { color: colors.textSecondary }]}>
                      Tạo: {new Date(saved.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.savedCardActions}>
                    <TouchableOpacity
                      style={[styles.applySavedBtn, { backgroundColor: colors.primary }]}
                      onPress={() => applySavedSearch(saved)}
                    >
                      <Text style={styles.applySavedBtnText}>Áp dụng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteSavedBtn}
                      onPress={() => removeSavedSearch(saved.id)}
                    >
                      <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600' }}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  // Phase 5 AI Search & Saved Searches Styles
  aiSearchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSearchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  suggestionsBar: {
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  promptScroll: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 2,
  },
  promptPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  promptPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiChipBox: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiChipTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  aiChipExplanation: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiChipActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  aiActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  savedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveSearchBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  saveSearchBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  savedListBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  savedName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  savedDate: {
    fontSize: 11,
  },
  savedCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applySavedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applySavedBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteSavedBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
});
