import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { AISearchModal } from './AISearchModal';
import { AnimatedScalePressable } from '../components/AnimatedScalePressable';
import { PropertyType, calculateListingRankingScore } from '@troviet/shared';

const POPULAR_AREAS = [
  { label: 'Hải Châu', university: 'ĐH Kỹ Thuật Y Dược', city: 'Đà Nẵng', query: 'hai chau' },
  { label: 'Ngũ Hành Sơn', university: 'ĐH Kinh Tế (ĐUE)', city: 'Đà Nẵng', query: 'ngu hanh son' },
  { label: 'Cầu Giấy', university: 'ĐHQG & Sư Phạm HN', city: 'Hà Nội', query: 'cau giay' },
  { label: 'Đống Đa', university: 'ĐH Ngoại Thương (FTU)', city: 'Hà Nội', query: 'dong da' },
  { label: 'Thủ Đức', university: 'Làng ĐH Quốc Gia', city: 'TP.HCM', query: 'thu duc' },
  { label: 'Bình Thạnh', university: 'ĐH HUTECH & GTVT', city: 'TP.HCM', query: 'binh thanh' },
];

interface CategoryItem {
  type: PropertyType | 'all';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PROPERTY_CATEGORIES: CategoryItem[] = [
  { type: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { type: 'room', label: 'Phòng trọ', icon: 'bed-outline' },
  { type: 'apartment', label: 'Căn hộ mini', icon: 'business-outline' },
  { type: 'house', label: 'Nhà nguyên căn', icon: 'home-outline' },
  { type: 'shared', label: 'Ở ghép', icon: 'people-outline' },
];

interface HomeScreenProps {
  onNavigateToSearch: (query?: string) => void;
  selectedCity?: string;
  onOpenCitySelector?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSearch,
  selectedCity,
}) => {
  const { colors, isDark } = useTheme();
  const { listings, setSelectedListing, userPreferences } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'all'>('all');
  const [isAISearchModalOpen, setIsAISearchModalOpen] = useState(false);

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  // Filter by category and sort by VIP ranking score
  const filteredListings = useMemo(() => {
    const list = publishedListings.filter((l) => {
      if (selectedCategory !== 'all' && l.propertyType !== selectedCategory) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const scoreA = calculateListingRankingScore(80, a.vipTier, a.createdAt);
      const scoreB = calculateListingRankingScore(80, b.vipTier, b.createdAt);
      return scoreB - scoreA;
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
      {/* Modern Search Hero Card */}
      <View style={[styles.searchEntryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={19} color={colors.primary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Bạn muốn tìm phòng ở đâu, giá bao nhiêu?"
            placeholderTextColor={colors.textSecondary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput('')} style={{ padding: 4, marginRight: 4 }}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={handleSearchSubmit}
            accessibilityRole="button"
          >
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* AI Search Prompt Entry with Gradient Background */}
        <AnimatedScalePressable
          style={styles.aiEntryWrapper}
          onPress={() => setIsAISearchModalOpen(true)}
        >
          <LinearGradient
            colors={isDark ? ['#064E3B', '#0F172A'] : ['#ECFDF5', '#F0FDF4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.aiEntryBanner, { borderColor: '#10B981' }]}
          >
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={18} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.aiEntryTitle, { color: isDark ? '#A7F3D0' : '#047857' }]}>
                  Tìm phòng thông minh bằng AI
                </Text>
                <View style={styles.newTag}>
                  <Text style={styles.newTagText}>MỚI</Text>
                </View>
              </View>
              <Text style={[styles.aiEntrySub, { color: colors.textSecondary }]}>
                "Dưới 3tr gần ĐH Bách Khoa có gác lửng, giờ tự do"
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#059669" />
          </LinearGradient>
        </AnimatedScalePressable>
      </View>

      {/* Property Category Filter Pills */}
      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {PROPERTY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.type;
            return (
              <AnimatedScalePressable
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
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: isActive ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {cat.label}
                </Text>
              </AnimatedScalePressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Section: Phòng dành cho bạn */}
      {recommendedListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flame" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Gợi ý dành riêng cho bạn
              </Text>
            </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flash-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Phòng mới đăng
            </Text>
          </View>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {filteredListings.length} phòng
          </Text>
        </View>

        {filteredListings.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="home-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Chưa có tin phòng trọ nào
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Hệ thống đang ở trạng thái dữ liệu sạch. Hãy là người đầu tiên đăng tin hoặc nạp dữ liệu từ CSDL!
            </Text>
          </View>
        ) : (
          filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPress={() => setSelectedListing(listing)}
            />
          ))
        )}
      </View>

      {/* Section: Phòng đã xác minh */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Phòng đã xác minh an toàn
            </Text>
          </View>
        </View>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Chủ nhà đã được đối soát CCCD chip và giấy tờ thực địa (Trust Score ≥ 80).
        </Text>

        {verifiedListings.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="shield-outline" size={28} color={colors.textSecondary} style={{ marginBottom: 6 }} />
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Chưa có phòng trọ nào đạt chứng nhận xác minh L2/L3.
            </Text>
          </View>
        ) : (
          verifiedListings.map((listing) => (
            <ListingCard
              key={`verified-${listing.id}`}
              listing={listing}
              onPress={() => setSelectedListing(listing)}
            />
          ))
        )}
      </View>

      {/* Section: Cụm Trường Đại học & Khu vực phổ biến */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="school-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Cụm Làng Đại Học & Khu Trọng Điểm
            </Text>
          </View>
        </View>
        <View style={styles.areasGrid}>
          {POPULAR_AREAS.map((area) => (
            <AnimatedScalePressable
              key={area.query}
              style={[styles.areaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onNavigateToSearch(area.query)}
            >
              <View style={styles.areaHeaderRow}>
                <Ionicons name="location-sharp" size={14} color={colors.primary} />
                <Text style={[styles.areaCityBadge, { color: colors.textSecondary }]}>
                  {area.city}
                </Text>
              </View>
              <Text style={[styles.areaTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {area.label}
              </Text>
              <Text style={[styles.areaUniversity, { color: colors.primary }]} numberOfLines={1}>
                {area.university}
              </Text>
              <View style={styles.areaActionRow}>
                <Text style={[styles.areaSub, { color: colors.textSecondary }]}>
                  Khám phá
                </Text>
                <Ionicons name="arrow-forward" size={12} color={colors.textSecondary} />
              </View>
            </AnimatedScalePressable>
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  aiEntryWrapper: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  aiEntryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiEntryTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  newTag: {
    marginLeft: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  aiEntrySub: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  areaCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  areaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  areaCityBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  areaTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  areaUniversity: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  areaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  areaSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
