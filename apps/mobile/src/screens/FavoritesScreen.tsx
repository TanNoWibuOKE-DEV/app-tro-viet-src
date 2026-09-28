import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';

interface FavoritesScreenProps {
  onOpenComparison: () => void;
  onSelectSavedSearch?: (criteria: any) => void;
}

type TabType = 'properties' | 'searches';

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onOpenComparison,
  onSelectSavedSearch,
}) => {
  const { colors, isDark } = useTheme();
  const {
    listings,
    favoriteIds,
    comparisonIds,
    setSelectedListing,
    savedSearches,
    removeSavedSearch,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('properties');

  const favoriteListings = listings.filter((l) => favoriteIds.includes(l.id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* 2-Segmented Tab Control (Section 21) */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'properties' && [styles.activeTabItem, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('properties')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'properties' ? colors.primary : colors.textSecondary },
            ]}
          >
            Phòng đã lưu ({favoriteListings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'searches' && [styles.activeTabItem, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('searches')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'searches' ? colors.primary : colors.textSecondary },
            ]}
          >
            Tìm kiếm đã lưu ({savedSearches.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comparison Floating Bar if at least 2 items selected */}
      {comparisonIds.length >= 2 && activeTab === 'properties' && (
        <View style={[styles.compareBanner, { backgroundColor: colors.primary }]}>
          <Ionicons name="git-compare-outline" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.compareBannerTitle}>
              Đã chọn {comparisonIds.length} phòng để so sánh
            </Text>
            <Text style={styles.compareBannerSub}>
              Đối chiếu chi phí & tiện nghi cạnh nhau
            </Text>
          </View>
          <TouchableOpacity style={styles.compareActionBtn} onPress={onOpenComparison}>
            <Text style={styles.compareActionBtnText}>So sánh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab 1: Saved Properties */}
      {activeTab === 'properties' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {favoriteListings.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1E293B' : '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="heart-outline" size={30} color="#EF4444" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Chưa có phòng nào được lưu
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Khi duyệt phòng, bấm vào biểu tượng trái tim để lưu lại những căn phòng bạn ưng ý nhất.
              </Text>
            </View>
          ) : (
            favoriteListings.map((listing) => (
              <ListingCard
                key={`fav-${listing.id}`}
                listing={listing}
                onPress={() => setSelectedListing(listing)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Tab 2: Saved Searches */}
      {activeTab === 'searches' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {savedSearches.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1E293B' : '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="notifications-outline" size={30} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Chưa có tìm kiếm nào được lưu
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Tại màn hình Tìm kiếm, bấm "Lưu tìm kiếm" để lưu các tiêu chí lọc nhanh cho lần sau.
              </Text>
            </View>
          ) : (
            savedSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => onSelectSavedSearch?.(item.criteria)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.searchName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.searchDate, { color: colors.textSecondary }]}>
                    Lưu ngày: {new Date(item.createdAt).toLocaleDateString('vi-VN')} · Bấm để tìm kiếm →
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    removeSavedSearch(item.id);
                  }}
                >
                  <Text style={{ color: colors.error, fontSize: 13, fontWeight: '700' }}>Xóa</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  compareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  compareBannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  compareBannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  compareActionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compareActionBtnText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 12,
  },
  scroll: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    marginTop: 40,
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
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  searchDate: {
    fontSize: 12,
  },
  deleteBtn: {
    padding: 8,
  },
});
