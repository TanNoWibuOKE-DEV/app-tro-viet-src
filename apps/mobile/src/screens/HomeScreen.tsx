import React, { useState } from 'react';
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
import { PropertyType } from '@troviet/shared';

const POPULAR_ALIASES = [
  { label: '🏖️ Khu Mỹ Khê', query: 'khu my khe' },
  { label: '🎓 Gần ĐH Duy Tân', query: 'gan dh duy tan' },
  { label: '📚 Gần ĐH Bách Khoa', query: 'gan dh bach khoa' },
  { label: '🏙️ Hải Châu cũ', query: 'hai chau' },
];

const PROPERTY_CATEGORIES: Array<{ type: PropertyType | 'all'; label: string }> = [
  { type: 'all', label: 'Tất cả' },
  { type: 'room', label: 'Phòng trọ' },
  { type: 'apartment', label: 'Căn hộ mini' },
  { type: 'house', label: 'Nhà nguyên căn' },
  { type: 'shared', label: 'Ở ghép' },
];

export const HomeScreen: React.FC<{ onNavigateToSearch: (query?: string) => void }> = ({
  onNavigateToSearch,
}) => {
  const { colors } = useTheme();
  const { listings, setSelectedListing } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'all'>('all');

  const publishedListings = listings.filter((l) => l.status === 'published');

  const filteredListings = publishedListings.filter((l) => {
    if (selectedCategory !== 'all' && l.propertyType !== selectedCategory) {
      return false;
    }
    return true;
  });

  const verifiedListings = publishedListings.filter(
    (l) => l.landlordVerificationLevel === 'L2' || l.landlordVerificationLevel === 'L3'
  );

  const handleSearchSubmit = () => {
    onNavigateToSearch(searchInput.trim());
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Header Banner */}
      <View style={[styles.headerBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.bannerQuestion, { color: colors.textPrimary }]}>
          Bạn đang tìm phòng ở đâu?
        </Text>
        <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
          Tìm đúng chỗ — Thuê an tâm tại TP. Đà Nẵng
        </Text>

        {/* Search Bar Input */}
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Tìm theo khu vực, trường ĐH, tên đường..."
            placeholderTextColor={colors.textSecondary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={handleSearchSubmit} style={[styles.searchGoBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.searchGoText}>Tìm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Popular Aliases (Habitual search pills) */}
        <Text style={[styles.aliasLabel, { color: colors.textSecondary }]}>
          Khu vực phổ biến theo thói quen:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aliasScroll}>
          {POPULAR_ALIASES.map((item) => (
            <TouchableOpacity
              key={item.query}
              style={[styles.aliasPill, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => onNavigateToSearch(item.query)}
            >
              <Text style={[styles.aliasPillText, { color: colors.textPrimary }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Pills */}
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

      {/* Section 1: Mới đăng */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Phòng mới đăng hôm nay
          </Text>
          <Text style={[styles.badgeCount, { color: colors.primary }]}>
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

      {/* Section 2: Đã xác minh uy tín */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            ⭐ Chủ trọ đã xác minh uy tín (L2/L3)
          </Text>
        </View>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Chủ nhà đã được kiểm tra danh tính hoặc quyền cho thuê thực tế.
        </Text>

        {verifiedListings.map((listing) => (
          <ListingCard
            key={`verified-${listing.id}`}
            listing={listing}
            onPress={() => setSelectedListing(listing)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  headerBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  bannerQuestion: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  searchGoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchGoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  aliasLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  aliasScroll: {
    gap: 8,
  },
  aliasPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  aliasPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
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
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 10,
  },
  badgeCount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
