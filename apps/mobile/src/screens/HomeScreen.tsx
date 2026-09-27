import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { AISearchModal } from './AISearchModal';
import { PropertyType } from '@troviet/shared';

const POPULAR_AREAS = [
  { label: 'Hải Châu (Trung tâm)', query: 'hai chau' },
  { label: 'Phước Mỹ (Gần biển)', query: 'phuoc my' },
  { label: 'Hòa Khánh Bắc (ĐH Bách Khoa)', query: 'hoa khanh bac' },
  { label: 'Hòa Cường Nam', query: 'hoa cuong nam' },
  { label: 'ĐH Duy Tân', query: 'duy tan' },
];

const PROPERTY_CATEGORIES: Array<{ type: PropertyType | 'all'; label: string }> = [
  { type: 'all', label: 'Tất cả' },
  { type: 'room', label: 'Phòng trọ' },
  { type: 'apartment', label: 'Căn hộ mini' },
  { type: 'house', label: 'Nhà nguyên căn' },
  { type: 'shared', label: 'Ở ghép' },
];

interface HomeScreenProps {
  onNavigateToSearch: (query?: string) => void;
  selectedCity?: string;
  onOpenCitySelector?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSearch,
}) => {
  const { colors } = useTheme();
  const { listings, setSelectedListing, userPreferences } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'all'>('all');
  const [isAISearchModalOpen, setIsAISearchModalOpen] = useState(false);

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  // Filter by category
  const filteredListings = useMemo(() => {
    return publishedListings.filter((l) => {
      if (selectedCategory !== 'all' && l.propertyType !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [publishedListings, selectedCategory]);

  // Verified listings
  const verifiedListings = useMemo(
    () =>
      publishedListings.filter(
        (l) => l.landlordVerificationLevel === 'L2' || l.landlordVerificationLevel === 'L3'
      ),
    [publishedListings]
  );

  // Recommended for user based on preferences
  const recommendedListings = useMemo(() => {
    if (!userPreferences) return publishedListings.slice(0, 3);
    const prefs = userPreferences;
    const scored = publishedListings.filter((l) => {
      if (prefs.preferredPropertyTypes && !prefs.preferredPropertyTypes.includes(l.propertyType)) {
        return false;
      }
      if (prefs.maxPrice && l.monthlyRent > prefs.maxPrice) {
        return false;
      }
      return true;
    });
    return scored.length > 0 ? scored.slice(0, 3) : publishedListings.slice(0, 3);
  }, [publishedListings, userPreferences]);

  const handleSearchSubmit = () => {
    if (searchInput.trim().length > 0) {
      onNavigateToSearch(searchInput.trim());
    } else {
      onNavigateToSearch();
    }
  };

  const handleAISearchPrompt = (prompt: string) => {
    onNavigateToSearch(prompt);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Bar Entry */}
      <View style={[styles.searchEntryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Bạn muốn tìm phòng như thế nào?"
            placeholderTextColor={colors.textSecondary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={handleSearchSubmit}
            accessibilityRole="button"
          >
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* AI Search Prompt Entry (Section 9) */}
        <TouchableOpacity
          style={[styles.aiEntryBanner, { backgroundColor: colors.background, borderColor: colors.primary }]}
          onPress={() => setIsAISearchModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, marginRight: 10 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiEntryTitle, { color: colors.primary }]}>
              Tìm phòng thông minh bằng AI
            </Text>
            <Text style={[styles.aiEntrySub, { color: colors.textSecondary }]}>
              "Phòng dưới 2 triệu gần ĐH Duy Tân có máy lạnh" →
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Property Category Filter Pills */}
      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {PROPERTY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.type;
            return (
              <TouchableOpacity
                key={cat.type}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.type)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: isActive ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Section: Phòng dành cho bạn */}
      {recommendedListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Gợi ý dành riêng cho bạn
            </Text>
            <TouchableOpacity onPress={() => onNavigateToSearch()}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {recommendedListings.map((listing) => (
            <ListingCard
              key={`rec-${listing.id}`}
              listing={listing}
              onPress={() => setSelectedListing(listing)}
            />
          ))}
        </View>
      )}

      {/* Section: Phòng mới đăng */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Phòng mới đăng
          </Text>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {filteredListings.length} phòng
          </Text>
        </View>

        {filteredListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onPress={() => setSelectedListing(listing)}
          />
        ))}
      </View>

      {/* Section: Phòng đã xác minh */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Phòng đã xác minh an toàn
          </Text>
        </View>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Chủ nhà đã được đối soát danh tính hoặc giấy tờ cho thuê.
        </Text>

        {verifiedListings.map((listing) => (
          <ListingCard
            key={`verified-${listing.id}`}
            listing={listing}
            onPress={() => setSelectedListing(listing)}
          />
        ))}
      </View>

      {/* Section: Khu vực phổ biến */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
          Khu vực phổ biến tại TP. Đà Nẵng
        </Text>
        <View style={styles.areasGrid}>
          {POPULAR_AREAS.map((area) => (
            <TouchableOpacity
              key={area.query}
              style={[styles.areaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onNavigateToSearch(area.query)}
            >
              <Text style={{ fontSize: 18, marginBottom: 4 }}>📍</Text>
              <Text style={[styles.areaTitle, { color: colors.textPrimary }]}>
                {area.label}
              </Text>
              <Text style={[styles.areaSub, { color: colors.textSecondary }]}>
                Khám phá phòng →
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dedicated AI Search Modal */}
      <AISearchModal
        visible={isAISearchModalOpen}
        onClose={() => setIsAISearchModalOpen(false)}
        onSearch={handleAISearchPrompt}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  searchEntryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  searchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  aiEntryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  aiEntryTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  aiEntrySub: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  areaCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  areaTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  areaSub: {
    fontSize: 11,
  },
});
