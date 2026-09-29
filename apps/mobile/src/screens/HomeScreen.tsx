import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { useResponsiveLayout } from '../utils/responsive';
import { getListingCoverImage } from '../utils/imageAssets';
import { AISearchModal } from './AISearchModal';
import { FilterModal, FilterState } from './FilterModal';
import { ListingSummary, formatVND } from '@troviet/shared';

interface HomeScreenProps {
  onNavigateToSearch: (query?: string) => void;
  onOpenMap?: () => void;
  selectedCity?: string;
  onOpenCitySelector?: () => void;
  onSelectProperty?: (listing: ListingSummary) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSearch,
  onOpenMap,
  onOpenCitySelector,
  onSelectProperty,
}) => {
  const { colors, isDark } = useTheme();
  const { listings, setSelectedListing, isFavorite, toggleFavorite } = useApp();
  const { contentMaxWidth } = useResponsiveLayout();

  const [searchInput, setSearchInput] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<string>('near_me');
  const [selectedQuickTag, setSelectedQuickTag] = useState<string | null>(null);
  const [isAISearchModalOpen, setIsAISearchModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Dynamic greeting according to local time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Chào buổi sáng ☀️'
      : currentHour < 18
      ? 'Chào buổi chiều 🌤️'
      : 'Chào buổi tối 👋';

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  const radiusPills = [
    { key: 'near_me', label: 'Gần tôi', hasPin: true },
    { key: '1km', label: '1 km', hasPin: false },
    { key: '3km', label: '3 km', hasPin: false },
    { key: '5km', label: '5 km', hasPin: false },
    { key: '10km', label: '10 km', hasPin: false },
  ];

  const quickFeaturePills = [
    { key: 'under3m', label: '💰 Dưới 3 triệu', query: 'Dưới 3 triệu' },
    { key: 'ac', label: '❄️ Có máy lạnh', query: 'Máy lạnh' },
    { key: 'loft', label: '⚡ Có gác lửng', query: 'Gác lửng' },
    { key: 'free_parking', label: '🛵 Free gửi xe', query: 'Gửi xe' },
    { key: 'free_time', label: '🚪 Giờ giấc tự do', query: 'Tự do' },
  ];

  // Sample data fallback with realistic Vietnamese rental information
  const nearbyListings = useMemo(() => {
    if (publishedListings.length >= 2) return publishedListings.slice(0, 4);
    return [
      {
        id: 'demo-near-1',
        title: 'Studio ban công Nguyễn Văn Linh',
        district: 'Quận 7',
        distance: '850m',
        rating: '4.9 (23)',
        tags: 'Máy lạnh • Gác • 24/7',
        price: 3500000,
        statusLabel: 'Còn trống',
        imageUrl:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'demo-near-2',
        title: 'Căn hộ mini Lê Văn Lương',
        district: 'Nhà Bè',
        distance: '1.2 km',
        rating: '4.8 (19)',
        tags: 'Full nội thất • Bếp riêng',
        price: 3800000,
        statusLabel: 'Còn trống',
        imageUrl:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      },
    ];
  }, [publishedListings]);

  // Featured student highlight
  const studentHighlight = {
    id: 'demo-student-1',
    campusDistance: 'Cách TĐT 500m',
    bikeFree: 'Free xe máy',
    title: 'Ký túc xá dịch vụ & Phòng khép kín D1',
    subtitle: 'Khu an ninh cao, camera 24/7, có bảo vệ',
    price: 2100000,
    priceNote: 'Giá trọn gói sinh viên',
    imageUrl:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
  };

  // Newly posted listings
  const newlyPosted = [
    {
      id: 'demo-new-1',
      title: 'Phòng đúc nguyên căn Trần Xuân Soạn',
      address: 'Gần cầu Kênh Tẻ, tiện sang Q4, Q1',
      price: 3200000,
      area: '20m²',
      badge1: 'Chủ nhà xác thực',
      badge2: '0đ phụ phí ẩn',
      badge2Color: '#D97706',
      badge2Bg: '#FEF3C7',
      imageUrl:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'demo-new-2',
      title: 'Phòng full nội thất cao cấp Huỳnh Tấn Phát',
      address: 'Gần ngã 4 Phú Thuận, view thoáng...',
      price: 4100000,
      area: '25m²',
      badge1: 'Chủ nhà xác thực',
      badge2: 'Cửa vân tay',
      badge2Color: '#0284C7',
      badge2Bg: '#E0F2FE',
      imageUrl:
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleSearchSubmit = () => {
    if (searchInput.trim().length > 0) {
      onNavigateToSearch(searchInput.trim());
    } else {
      onNavigateToSearch();
    }
  };

  const handleSelectListingItem = (id: string) => {
    const found = publishedListings.find((l) => l.id === id);
    if (found) {
      setSelectedListing(found);
      onSelectProperty?.(found);
    } else if (publishedListings.length > 0) {
      setSelectedListing(publishedListings[0]);
      onSelectProperty?.(publishedListings[0]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
        {/* Top Greeting Section */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
              {greeting}
            </Text>
            <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
              Tìm trọ minh bạch, tiện nghi quanh bạn
            </Text>
          </View>

          {/* University location pill */}
          <TouchableOpacity
            style={[styles.univPill, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onOpenCitySelector}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={13} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={[styles.univText, { color: colors.textPrimary }]}>ĐH FPT TP.HCM</Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        {/* Search Bar Input */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Bạn muốn tìm trọ ở đâu?"
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
            style={[styles.filterBtn, { backgroundColor: '#EFF6FF' }]}
            onPress={() => setIsFilterModalOpen(true)}
            accessibilityLabel="Bộ lọc nâng cao"
          >
            <Ionicons name="options-outline" size={16} color="#085F56" />
            <View style={styles.filterDotBadge} />
          </TouchableOpacity>
        </View>

        {/* BÁN KÍNH QUÉT PHÒNG Bar */}
        <View style={styles.radiusHeaderRow}>
          <Text style={styles.radiusHeaderTitle}>BÁN KÍNH QUÉT PHÒNG</Text>
          <TouchableOpacity style={styles.gpsLocationRow} onPress={onOpenMap}>
            <Ionicons name="locate-outline" size={13} color="#085F56" style={{ marginRight: 3 }} />
            <Text style={styles.gpsLocationText}>Vị trí GPS chuẩn</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Radius Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.radiusPillsScroll}
        >
          {radiusPills.map((pill) => {
            const isActive = selectedRadius === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                style={[
                  styles.radiusChip,
                  {
                    backgroundColor: isActive ? '#E6F4F1' : colors.card,
                    borderColor: isActive ? '#085F56' : colors.border,
                  },
                ]}
                onPress={() => setSelectedRadius(pill.key)}
                activeOpacity={0.7}
              >
                {pill.hasPin && (
                  <Ionicons name="location" size={13} color="#EF4444" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.radiusChipText,
                    { color: isActive ? '#085F56' : colors.textPrimary, fontWeight: isActive ? '800' : '600' },
                  ]}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feature Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFeaturesScroll}
        >
          {quickFeaturePills.map((tag) => {
            const isActive = selectedQuickTag === tag.key;
            return (
              <TouchableOpacity
                key={tag.key}
                style={[
                  styles.quickFeatureChip,
                  {
                    backgroundColor: isActive ? '#085F56' : colors.card,
                    borderColor: isActive ? '#085F56' : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedQuickTag(isActive ? null : tag.key);
                  onNavigateToSearch(tag.query);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickFeatureText,
                    { color: isActive ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SECTION 1: Phòng gần bạn */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.sectionAccentBar} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Phòng gần bạn
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateToSearch()}>
              <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScroll}
          >
            {nearbyListings.map((item: any) => {
              const favorited = isFavorite(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.carouselCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleSelectListingItem(item.id)}
                  activeOpacity={0.88}
                >
                  {/* Photo with Overlay Badges */}
                  <View style={styles.cardImageWrap}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                    {/* Distance Pill */}
                    <View style={styles.distanceBadge}>
                      <Ionicons name="walk-outline" size={11} color="#FFFFFF" style={{ marginRight: 2 }} />
                      <Text style={styles.distanceBadgeText}>{item.distance}</Text>
                    </View>
                    {/* Heart Button */}
                    <TouchableOpacity
                      style={styles.heartCircle}
                      onPress={() => toggleFavorite(item.id)}
                      accessibilityLabel="Lưu yêu thích"
                    >
                      <Ionicons
                        name={favorited ? 'heart' : 'heart-outline'}
                        size={16}
                        color={favorited ? '#EF4444' : '#0F172A'}
                      />
                    </TouchableOpacity>
                    {/* Rating Pill */}
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={11} color="#F59E0B" style={{ marginRight: 2 }} />
                      <Text style={styles.ratingPillText}>{item.rating}</Text>
                    </View>
                  </View>

                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardDistrictRow}>
                      <Ionicons name="business-outline" size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
                      <Text style={[styles.cardDistrictText, { color: colors.textSecondary }]}>
                        {item.district}
                      </Text>
                    </View>

                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={[styles.cardTags, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.tags}
                    </Text>

                    <View style={styles.cardPriceRow}>
                      <Text style={[styles.cardPriceValue, { color: '#085F56' }]}>
                        {formatVND(item.price)}
                      </Text>
                      <View style={styles.vacantBadge}>
                        <Text style={styles.vacantBadgeText}>{item.statusLabel}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SECTION 2: Được sinh viên quan tâm */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionTitleRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.sectionAccentBar} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Được sinh viên quan tâm
                </Text>
              </View>
              <Text style={[styles.sectionSubText, { color: colors.textSecondary }]}>
                Khu vực gần ĐH Tôn Đức Thắng & ĐH FPT
              </Text>
            </View>
          </View>

          {/* Student Banner Card */}
          <TouchableOpacity
            style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleSelectListingItem(studentHighlight.id)}
            activeOpacity={0.9}
          >
            {/* Top Badges Row */}
            <View style={styles.studentTopRow}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={[styles.studentTag, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="school-outline" size={11} color="#0284C7" style={{ marginRight: 3 }} />
                  <Text style={[styles.studentTagText, { color: '#0284C7' }]}>
                    {studentHighlight.campusDistance}
                  </Text>
                </View>
                <View style={[styles.studentTag, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="bicycle-outline" size={11} color="#0F766E" style={{ marginRight: 3 }} />
                  <Text style={[styles.studentTagText, { color: '#0F766E' }]}>
                    {studentHighlight.bikeFree}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => toggleFavorite(studentHighlight.id)}>
                <Ionicons
                  name={isFavorite(studentHighlight.id) ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite(studentHighlight.id) ? '#EF4444' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.studentTitle, { color: colors.textPrimary }]}>
              {studentHighlight.title}
            </Text>

            <View style={styles.studentSubRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#085F56" style={{ marginRight: 4 }} />
              <Text style={[styles.studentSub, { color: colors.textSecondary }]}>
                {studentHighlight.subtitle}
              </Text>
            </View>

            <View style={styles.studentFooterRow}>
              <View>
                <Text style={[styles.studentPricePrompt, { color: colors.textSecondary }]}>
                  {studentHighlight.priceNote}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.studentPriceValue, { color: '#085F56' }]}>
                    {formatVND(studentHighlight.price)}
                  </Text>
                  <Text style={[styles.studentPriceUnit, { color: colors.textSecondary }]}>/người/tháng</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.studentCtaBtn}
                onPress={() => handleSelectListingItem(studentHighlight.id)}
              >
                <Text style={styles.studentCtaText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: Phòng mới đăng */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.sectionAccentBar} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Phòng mới đăng
              </Text>
            </View>
            <Text style={[styles.timeAgoHint, { color: colors.textSecondary }]}>
              Vừa cập nhật 10 phút trước
            </Text>
          </View>

          {/* Vertical Compact Listing Items */}
          <View style={styles.newlyPostedList}>
            {newlyPosted.map((item) => {
              const favorited = isFavorite(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.newPostCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleSelectListingItem(item.id)}
                  activeOpacity={0.88}
                >
                  {/* Left Thumbnail with Area Tag */}
                  <View style={styles.newPostThumbWrap}>
                    <Image source={{ uri: item.imageUrl }} style={styles.newPostThumb} resizeMode="cover" />
                    <View style={styles.areaBadge}>
                      <Text style={styles.areaBadgeText}>{item.area}</Text>
                    </View>
                  </View>

                  {/* Right Content */}
                  <View style={styles.newPostContent}>
                    <View style={styles.newPostBadgeRow}>
                      <View style={styles.verifiedMiniTag}>
                        <Ionicons name="checkmark-circle" size={10} color="#085F56" style={{ marginRight: 2 }} />
                        <Text style={styles.verifiedMiniText}>{item.badge1}</Text>
                      </View>
                      <View style={[styles.customMiniTag, { backgroundColor: item.badge2Bg }]}>
                        <Text style={[styles.customMiniText, { color: item.badge2Color }]}>
                          {item.badge2}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.newPostTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.newPostAddressRow}>
                      <Ionicons name="location" size={11} color="#EF4444" style={{ marginRight: 2 }} />
                      <Text style={[styles.newPostAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>

                    <View style={styles.newPostFooterRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={[styles.newPostPrice, { color: '#085F56' }]}>
                          {formatVND(item.price)}
                        </Text>
                        <Text style={[styles.newPostPeriod, { color: colors.textSecondary }]}>/tháng</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => toggleFavorite(item.id)}
                        style={styles.newPostHeartBtn}
                        accessibilityLabel="Lưu"
                      >
                        <Ionicons
                          name={favorited ? 'heart' : 'heart-outline'}
                          size={17}
                          color={favorited ? '#EF4444' : '#64748B'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Sub-modals */}
      <AISearchModal
        visible={isAISearchModalOpen}
        onClose={() => setIsAISearchModalOpen(false)}
        onSearch={(query) => onNavigateToSearch(query)}
      />

      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={{
          priceIndex: 0,
          wardCode: 'all',
          propertyType: 'all',
          amenityCodes: [],
          conditions: [],
        }}
        totalMatching={publishedListings.length}
        onReset={() => {}}
        onApply={(filterCriteria: FilterState) => {
          setIsFilterModalOpen(false);
          onNavigateToSearch();
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  univPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  univText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterDotBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#085F56',
  },
  radiusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  radiusHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  gpsLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsLocationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#085F56',
  },
  radiusPillsScroll: {
    gap: 8,
    marginBottom: 12,
  },
  radiusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  radiusChipText: {
    fontSize: 12,
  },
  quickFeaturesScroll: {
    gap: 8,
    marginBottom: 20,
  },
  quickFeatureChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickFeatureText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionAccentBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#085F56',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubText: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#085F56',
  },
  timeAgoHint: {
    fontSize: 11,
  },
  carouselScroll: {
    gap: 12,
  },
  carouselCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImageWrap: {
    height: 130,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heartCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ratingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardContent: {
    padding: 10,
  },
  cardDistrictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardDistrictText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  cardTags: {
    fontSize: 11,
    marginBottom: 8,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPriceValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  vacantBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vacantBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  studentCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  studentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  studentTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  studentTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  studentSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentSub: {
    fontSize: 11,
  },
  studentFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentPricePrompt: {
    fontSize: 10,
    fontWeight: '500',
  },
  studentPriceValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  studentPriceUnit: {
    fontSize: 10,
    marginLeft: 2,
  },
  studentCtaBtn: {
    backgroundColor: '#085F56',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  studentCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  newlyPostedList: {
    gap: 12,
  },
  newPostCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  newPostThumbWrap: {
    width: 86,
    height: 86,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
  },
  newPostThumb: {
    width: '100%',
    height: '100%',
  },
  areaBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  areaBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  newPostContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  newPostBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  verifiedMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedMiniText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#085F56',
  },
  customMiniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customMiniText: {
    fontSize: 9,
    fontWeight: '700',
  },
  newPostTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginVertical: 2,
  },
  newPostAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newPostAddress: {
    fontSize: 11,
  },
  newPostFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  newPostPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  newPostPeriod: {
    fontSize: 10,
  },
  newPostHeartBtn: {
    padding: 2,
  },
});
