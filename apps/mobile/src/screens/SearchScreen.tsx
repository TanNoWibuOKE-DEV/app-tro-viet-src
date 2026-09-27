import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';
import { FilterModal, FilterState, PRICE_OPTIONS, WARDS_OPTIONS, ROOM_TYPE_OPTIONS } from './FilterModal';
import { AISearchModal } from './AISearchModal';
import {
  PropertyType,
  normalizeVietnameseText,
  parseNaturalLanguageSearch,
  AISearchParseResult,
  formatVND,
} from '@troviet/shared';

interface SearchScreenProps {
  initialQuery?: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ initialQuery = '' }) => {
  const { colors, isDark } = useTheme();
  const { listings, setSelectedListing, saveSearch } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({
    priceIndex: 0,
    wardCode: 'all',
    propertyType: 'all',
    amenityCodes: [],
    conditions: [],
  });
  const [customMaxRent, setCustomMaxRent] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAISearchModalOpen, setIsAISearchModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AISearchParseResult | null>(null);

  const executeAISearch = (text: string) => {
    setQuery(text);
    const result = parseNaturalLanguageSearch(text);
    setAiResult(result);

    setFilters((prev) => ({
      ...prev,
      wardCode: result.parsedFilter.wardCode || prev.wardCode,
      propertyType: result.parsedFilter.propertyType || prev.propertyType,
      amenityCodes:
        result.parsedFilter.amenityCodes && result.parsedFilter.amenityCodes.length > 0
          ? result.parsedFilter.amenityCodes
          : prev.amenityCodes,
    }));

    if (result.parsedFilter.maxRent) {
      setCustomMaxRent(result.parsedFilter.maxRent);
    } else {
      setCustomMaxRent(null);
    }
  };

  const clearAISearch = () => {
    setAiResult(null);
    setCustomMaxRent(null);
    setQuery('');
  };

  const handleResetFilters = () => {
    setFilters({
      priceIndex: 0,
      wardCode: 'all',
      propertyType: 'all',
      amenityCodes: [],
      conditions: [],
    });
    setCustomMaxRent(null);
    setQuery('');
    setAiResult(null);
  };

  const handleSaveSearch = () => {
    const searchName =
      query.trim() ||
      `Tìm kiếm ${filters.wardCode !== 'all' ? filters.wardCode : 'Đà Nẵng'} ${
        customMaxRent ? `< ${formatVND(customMaxRent)}` : ''
      }`;

    saveSearch(searchName, {
      query,
      wardCode: filters.wardCode !== 'all' ? filters.wardCode : undefined,
      propertyType: filters.propertyType !== 'all' ? filters.propertyType : undefined,
      amenityCodes: filters.amenityCodes.length > 0 ? filters.amenityCodes : undefined,
      maxRent: customMaxRent || undefined,
    });

    Alert.alert(
      'Đã lưu tìm kiếm',
      `Đã lưu tiêu chí "${searchName}". Bạn có thể xem lại trong mục "Đã lưu".`
    );
  };

  useEffect(() => {
    if (initialQuery.trim().length > 0) {
      executeAISearch(initialQuery.trim());
    }
  }, [initialQuery]);

  // Compute filtered results
  const filteredResults = useMemo(() => {
    const published = listings.filter((l) => l.status === 'published');
    const normQuery = normalizeVietnameseText(query);
    const priceConfig = PRICE_OPTIONS[filters.priceIndex];

    return published
      .filter((item) => {
        // Custom max rent from AI if parsed
        if (customMaxRent !== null && item.monthlyRent > customMaxRent) {
          return false;
        }

        // Price range
        if (item.monthlyRent < priceConfig.min || item.monthlyRent > priceConfig.max) {
          return false;
        }

        // Ward filter
        if (filters.wardCode !== 'all' && item.wardCode !== filters.wardCode) {
          return false;
        }

        // Property type
        if (filters.propertyType !== 'all' && item.propertyType !== filters.propertyType) {
          return false;
        }

        // Amenities filter
        if (filters.amenityCodes.length > 0) {
          const itemAmenityCodes = item.amenities.map((a) => a.code);
          const hasAll = filters.amenityCodes.every((code) => itemAmenityCodes.includes(code));
          if (!hasAll) return false;
        }

        // Conditions filter
        if (filters.conditions.length > 0) {
          const itemAmenityCodes = item.amenities.map((a) => a.code);
          const hasConditions = filters.conditions.every((cond) =>
            itemAmenityCodes.includes(cond)
          );
          if (!hasConditions) return false;
        }

        // Text query search
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
  }, [listings, query, filters, customMaxRent, sortBy, aiResult]);

  const activeFilterCount =
    (filters.priceIndex !== 0 ? 1 : 0) +
    (filters.wardCode !== 'all' ? 1 : 0) +
    (filters.propertyType !== 'all' ? 1 : 0) +
    filters.amenityCodes.length +
    filters.conditions.length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top Search Bar */}
      <View style={[styles.topSearchBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Khu vực, trường học, địa điểm..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => executeAISearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 4 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.aiBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsAISearchModalOpen(true)}
          accessibilityRole="button"
        >
          <Text style={styles.aiBtnText}>✨ AI</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Filter Chips (Section 11) */}
      <View style={[styles.quickFiltersRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersScroll}>
          {/* Main Filter Modal Trigger */}
          <TouchableOpacity
            style={[
              styles.filterTriggerPill,
              {
                backgroundColor: activeFilterCount > 0 ? colors.primary : colors.background,
                borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Text
              style={[
                styles.filterTriggerText,
                { color: activeFilterCount > 0 ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              ⚙️ Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Quick Price Pill */}
          <TouchableOpacity
            style={[
              styles.quickPill,
              {
                backgroundColor: filters.priceIndex !== 0 ? '#ECFDF5' : colors.background,
                borderColor: filters.priceIndex !== 0 ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Text
              style={[
                styles.quickPillText,
                { color: filters.priceIndex !== 0 ? colors.primary : colors.textPrimary },
              ]}
            >
              Giá: {PRICE_OPTIONS[filters.priceIndex].label}
            </Text>
          </TouchableOpacity>

          {/* Quick Property Type Pill */}
          <TouchableOpacity
            style={[
              styles.quickPill,
              {
                backgroundColor: filters.propertyType !== 'all' ? '#ECFDF5' : colors.background,
                borderColor: filters.propertyType !== 'all' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Text
              style={[
                styles.quickPillText,
                { color: filters.propertyType !== 'all' ? colors.primary : colors.textPrimary },
              ]}
            >
              Loại: {ROOM_TYPE_OPTIONS.find((r) => r.type === filters.propertyType)?.label}
            </Text>
          </TouchableOpacity>

          {/* Quick Ward Pill */}
          <TouchableOpacity
            style={[
              styles.quickPill,
              {
                backgroundColor: filters.wardCode !== 'all' ? '#ECFDF5' : colors.background,
                borderColor: filters.wardCode !== 'all' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Text
              style={[
                styles.quickPillText,
                { color: filters.wardCode !== 'all' ? colors.primary : colors.textPrimary },
              ]}
            >
              {WARDS_OPTIONS.find((w) => w.code === filters.wardCode)?.name}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* AI Interpretation Alert if active */}
      {aiResult && (
        <View style={[styles.aiChipBox, { backgroundColor: isDark ? '#1a2332' : '#E0F2FE', borderColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiChipTitle, { color: colors.primary }]}>
              🤖 Trợ lý AI đã hiểu:
            </Text>
            <Text style={[styles.aiChipText, { color: colors.textPrimary }]}>
              {aiResult.explanation}
            </Text>
          </View>
          <TouchableOpacity onPress={clearAISearch} style={styles.aiClearBtn}>
            <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>✕ Bỏ</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Header: Count & Save */}
      <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.resultsCountText, { color: colors.textPrimary }]}>
          {filteredResults.length} phòng tại TP. Đà Nẵng
        </Text>
        <TouchableOpacity style={styles.saveSearchBtn} onPress={handleSaveSearch}>
          <Text style={[styles.saveSearchText, { color: colors.primary }]}>
            🔔 Lưu tìm kiếm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Feed */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredResults.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Không có phòng phù hợp
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Thử nới rộng khoảng giá hoặc xóa bớt tiêu chí bộ lọc để xem thêm phòng nhé.
            </Text>
            <View style={{ marginTop: 16 }}>
              <Button title="Xóa bộ lọc" variant="outline" onPress={handleResetFilters} />
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

      {/* Accordion Filter Modal */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
        totalMatching={filteredResults.length}
      />

      {/* Dedicated AI Search Modal */}
      <AISearchModal
        visible={isAISearchModalOpen}
        onClose={() => setIsAISearchModalOpen(false)}
        onSearch={executeAISearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  aiBtn: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  quickFiltersRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  quickFiltersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTriggerPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTriggerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  aiChipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiChipTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiChipText: {
    fontSize: 12,
  },
  aiClearBtn: {
    padding: 6,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveSearchBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveSearchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyBox: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
