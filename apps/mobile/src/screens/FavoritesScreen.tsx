import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';

export const FavoritesScreen: React.FC<{ onOpenComparison: () => void }> = ({
  onOpenComparison,
}) => {
  const { colors } = useTheme();
  const { listings, favoriteIds, comparisonIds, setSelectedListing } = useApp();

  const favoriteListings = listings.filter((l) => favoriteIds.includes(l.id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          ❤️ Phòng trọ đã lưu ({favoriteListings.length})
        </Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Lưu trữ ngoại tuyến — xem lại bất kỳ lúc nào dù mất mạng
        </Text>
      </View>

      {/* Comparison Floating Bar if at least 2 items selected */}
      {comparisonIds.length >= 2 && (
        <View style={[styles.compareBanner, { backgroundColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.compareBannerTitle}>
              ⚖️ Đã chọn {comparisonIds.length} phòng để so sánh
            </Text>
            <Text style={styles.compareBannerSub}>
              Đối chiếu chi phí & tiện nghi cạnh nhau
            </Text>
          </View>
          <TouchableOpacity style={styles.compareActionBtn} onPress={onOpenComparison}>
            <Text style={styles.compareActionBtnText}>So sánh ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {favoriteListings.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🤍</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Bạn chưa lưu phòng nào
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Khi tìm phòng, hãy bấm vào biểu tượng trái tim để lưu lại những căn phòng ưng ý và so sánh chi phí nhé.
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
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
});
