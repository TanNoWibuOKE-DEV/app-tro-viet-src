import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { useResponsiveLayout } from '../utils/responsive';
import { getListingCoverImage } from '../utils/imageAssets';
import {
  ListingSummary,
  formatVND,
  formatArea,
} from '@troviet/shared';

interface MapScreenProps {
  onBackToHome?: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onBackToHome }) => {
  const { colors, isDark } = useTheme();
  const { insets, contentMaxWidth } = useResponsiveLayout();
  const { listings, setSelectedListing, isFavorite, toggleFavorite } = useApp();

  const [activeRadius, setActiveRadius] = useState<string>('3km');
  const [searchQuery, setSearchQuery] = useState('Khu vực ĐH Tôn Đức Thắng');
  const [activePinListingId, setActivePinListingId] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  const [showBusRoutes, setShowBusRoutes] = useState(false);

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  // Default active listing or user selected
  const activeListing = useMemo(() => {
    if (activePinListingId) {
      return publishedListings.find((l) => l.id === activePinListingId) || publishedListings[0] || null;
    }
    return publishedListings[0] || null;
  }, [activePinListingId, publishedListings]);

  // Center coordinate around Ton Duc Thang University (District 7, TP.HCM)
  const centerLat = 10.7324;
  const centerLng = 106.6992;

  // Listen to web postMessage when running in browser
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleWindowMessage = (event: MessageEvent) => {
        if (event.data && typeof event.data === 'string' && event.data.startsWith('troviet_select_listing:')) {
          const id = event.data.replace('troviet_select_listing:', '');
          setActivePinListingId(id);
        }
      };
      window.addEventListener('message', handleWindowMessage);
      return () => {
        window.removeEventListener('message', handleWindowMessage);
      };
    }
  }, []);

  const handleNativeMessage = (event: any) => {
    try {
      const data = event.nativeEvent.data;
      if (data && typeof data === 'string' && data.startsWith('troviet_select_listing:')) {
        const id = data.replace('troviet_select_listing:', '');
        setActivePinListingId(id);
      }
    } catch (e) {
      // Ignore
    }
  };

  // Generate self-contained Leaflet OpenStreetMap HTML with Radius Circle & Highlight Pin
  const mapHtml = useMemo(() => {
    const primaryColor = '#085F56';
    const markers = [
      { id: 'p1', title: 'Studio ban công Nguyễn Văn Linh', lat: 10.7315, lng: 106.7020, priceText: '3.5tr', rating: '4.9', isHighlight: true },
      { id: 'p2', title: 'Phòng trọ gần RMIT', lat: 10.7360, lng: 106.6930, priceText: '2.8tr', rating: '4.8', isHighlight: false },
      { id: 'p3', title: 'Ký túc xá D1 Tôn Đức Thắng', lat: 10.7280, lng: 106.7040, priceText: '2.5tr', rating: '4.9', isHighlight: false },
      { id: 'p4', title: 'Căn hộ mini ĐH FPT', lat: 10.7380, lng: 106.7060, priceText: '4.2tr', rating: '4.7', isHighlight: false },
      { id: 'p5', title: 'Phòng đúc Trần Xuân Soạn', lat: 10.7290, lng: 106.6970, priceText: '3.2tr', rating: '4.8', isHighlight: false },
    ];

    const markersJson = JSON.stringify(markers);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .price-pin {
      background-color: #FFFFFF;
      color: #0F172A;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 14px;
      border: 1.5px solid #CBD5E1;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .price-pin.active {
      background-color: ${primaryColor};
      color: #FFFFFF;
      border-color: #FFFFFF;
      box-shadow: 0 6px 14px rgba(8, 95, 86, 0.45);
      transform: scale(1.1);
      position: relative;
    }
    .price-pin.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px 5px 0 5px;
      border-style: solid;
      border-color: ${primaryColor} transparent transparent transparent;
    }
    .pin-dot {
      width: 5px;
      height: 5px;
      border-radius: 2.5px;
      background-color: #10B981;
      margin-left: 4px;
    }
    .user-location-pulse {
      width: 22px;
      height: 22px;
      border-radius: 11px;
      background-color: #2563EB;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.25);
    }
    .user-tag {
      background-color: rgba(255, 255, 255, 0.95);
      color: #1E293B;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      white-space: nowrap;
      margin-top: 4px;
      border: 1px solid #E2E8F0;
    }
    .campus-area {
      font-size: 11px;
      font-weight: 800;
      color: #065F46;
      background: rgba(209, 250, 229, 0.85);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px dashed #059669;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var centerLat = ${centerLat};
    var centerLng = ${centerLng};
    var map = L.map('map', { zoomControl: false }).setView([centerLat, centerLng], 15);

    // Light Theme Tile Layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // 3km Radius Circle around user
    var radiusCircle = L.circle([centerLat, centerLng], {
      radius: 900,
      color: '#085F56',
      fillColor: '#085F56',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);

    // User Location Marker
    var userIcon = L.divIcon({
      className: 'user-icon-container',
      html: '<div style="display:flex; flex-direction:column; align-items:center;"><div class="user-location-pulse"></div><div class="user-tag">Vị trí của bạn (Khu A)</div></div>',
      iconSize: [120, 50],
      iconAnchor: [60, 11]
    });
    L.marker([centerLat, centerLng], { icon: userIcon }).addTo(map);

    // Campus Overlays
    var tdtIcon = L.divIcon({
      className: 'campus-container',
      html: '<div class="campus-area">ĐH Tôn Đức Thắng</div>',
      iconSize: [110, 24],
      iconAnchor: [55, 12]
    });
    L.marker([10.7328, 106.7005], { icon: tdtIcon }).addTo(map);

    var rmitIcon = L.divIcon({
      className: 'campus-container',
      html: '<div class="campus-area" style="color:#1E40AF; background:rgba(219,234,254,0.85); border-color:#2563EB;">ĐH RMIT</div>',
      iconSize: [90, 24],
      iconAnchor: [45, 12]
    });
    L.marker([10.7350, 106.6935], { icon: rmitIcon }).addTo(map);

    // Render Price Pins
    var markers = ${markersJson};
    markers.forEach(function(item) {
      var isHighlight = item.isHighlight;
      var html = '<div class="price-pin ' + (isHighlight ? 'active' : '') + '">' +
        item.priceText +
        (isHighlight && item.rating ? ' ★ ' + item.rating : '<span class="pin-dot"></span>') +
        '</div>';

      var pinIcon = L.divIcon({
        className: 'price-container',
        html: html,
        iconSize: [70, 30],
        iconAnchor: [35, 15]
      });

      var marker = L.marker([item.lat, item.lng], { icon: pinIcon }).addTo(map);
      marker.on('click', function() {
        var msg = 'troviet_select_listing:' + item.id;
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(msg);
        } else if (window.parent) {
          window.parent.postMessage(msg, '*');
        }
      });
    });
  </script>
</body>
</html>`;
  }, [centerLat, centerLng]);

  const coverUrl = activeListing ? getListingCoverImage(activeListing) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
  const favorited = activeListing ? isFavorite(activeListing.id) : false;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
        {/* Floating Top Search & Filter Bar */}
        <View
          style={[
            styles.floatingSearchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              marginTop: Math.max(10, insets.top + 6),
            },
          ]}
        >
          {onBackToHome && (
            <TouchableOpacity onPress={onBackToHome} style={styles.searchBackBtn}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          <Ionicons name="search" size={17} color={colors.textSecondary} style={{ marginRight: 6 }} />

          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo khu vực, trường ĐH..."
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={[styles.filterActionBtn, { backgroundColor: '#EFF6FF' }]}
            onPress={() => {}}
            accessibilityLabel="Mở bộ lọc"
          >
            <Ionicons name="options-outline" size={16} color="#085F56" />
          </TouchableOpacity>
        </View>

        {/* Radius Filter Strip */}
        <View style={styles.radiusStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.radiusScroll}
          >
            <TouchableOpacity
              style={[
                styles.radiusPill,
                activeRadius === '1km'
                  ? styles.radiusPillActive
                  : [styles.radiusPillInactive, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
              onPress={() => setActiveRadius('1km')}
            >
              <Text
                style={[
                  styles.radiusText,
                  { color: activeRadius === '1km' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                Bán kính 1km
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radiusPill,
                activeRadius === '3km'
                  ? styles.radiusPillActive
                  : [styles.radiusPillInactive, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
              onPress={() => setActiveRadius('3km')}
            >
              <Ionicons
                name="radio-button-on"
                size={13}
                color={activeRadius === '3km' ? '#FFFFFF' : colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.radiusText,
                  { color: activeRadius === '3km' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                Bán kính 3km
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radiusPill,
                activeRadius === '5km'
                  ? styles.radiusPillActive
                  : [styles.radiusPillInactive, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
              onPress={() => setActiveRadius('5km')}
            >
              <Text
                style={[
                  styles.radiusText,
                  { color: activeRadius === '5km' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                5km
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radiusPill,
                [styles.radiusPillInactive, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
              onPress={() => {}}
            >
              <Ionicons name="storefront-outline" size={13} color="#085F56" style={{ marginRight: 4 }} />
              <Text style={[styles.radiusText, { color: colors.textPrimary }]}>Circle K</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Interactive Map Viewport */}
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              srcDoc={mapHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="TroVietMap"
            />
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={{ flex: 1 }}
              onMessage={handleNativeMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}

          {/* Floating Map Controls on Right (FABs) */}
          <View style={styles.rightFabsWrap}>
            <TouchableOpacity
              style={[styles.fabBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {}}
              accessibilityLabel="Định vị vị trí của tôi"
            >
              <Ionicons name="locate" size={18} color="#085F56" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fabBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setMapLayer(mapLayer === 'standard' ? 'satellite' : 'standard')}
              accessibilityLabel="Đổi lớp bản đồ"
            >
              <Ionicons name="layers-outline" size={18} color="#085F56" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fabBtn,
                {
                  backgroundColor: showBusRoutes ? '#085F56' : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowBusRoutes(!showBusRoutes)}
              accessibilityLabel="Tuyến xe buýt"
            >
              <Ionicons
                name="bus-outline"
                size={18}
                color={showBusRoutes ? '#FFFFFF' : '#085F56'}
              />
            </TouchableOpacity>
          </View>

          {/* Floating Pill: Xem 126 phòng trong khu vực này */}
          <TouchableOpacity
            style={[styles.floatingCountBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {}}
            activeOpacity={0.88}
          >
            <Ionicons name="list" size={14} color="#085F56" style={{ marginRight: 6 }} />
            <Text style={[styles.floatingCountText, { color: colors.textPrimary }]}>
              Xem 126 phòng trong khu vực này
            </Text>
            <Ionicons name="arrow-up-outline" size={13} color={colors.textSecondary} style={{ marginLeft: 4, transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Selected Property Bottom Preview Card */}
        {activeListing && (
          <View style={[styles.bottomPreviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.previewCardInner}>
              {/* Thumbnail with 'Có sẵn' badge */}
              <View style={styles.previewThumbWrap}>
                <Image source={{ uri: coverUrl }} style={styles.previewThumbImg} resizeMode="cover" />
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Có sẵn</Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.previewDetails}>
                <View style={styles.previewTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="navigate-outline" size={11} color="#085F56" style={{ marginRight: 3 }} />
                    <Text style={styles.distanceBadgeText}>Cách 850m • </Text>
                    <Ionicons name="star" size={11} color="#F59E0B" style={{ marginRight: 2 }} />
                    <Text style={styles.ratingBadgeText}>4.9 (38)</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(activeListing.id)}
                    style={styles.heartBtn}
                  >
                    <Ionicons
                      name={favorited ? 'heart' : 'heart-outline'}
                      size={18}
                      color={favorited ? '#EF4444' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.previewTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {activeListing.title || 'Studio ban công Nguyễn Văn Linh'}
                </Text>

                <Text style={[styles.previewUtilitiesText, { color: colors.textSecondary }]} numberOfLines={1}>
                  Điện 3.5k • Nước 20k • Miễn phí wifi & xe
                </Text>

                <View style={styles.previewFooterRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={[styles.previewPriceValue, { color: '#085F56' }]}>
                      {formatVND(activeListing.monthlyRent || 3500000)}
                    </Text>
                    <Text style={[styles.previewPricePeriod, { color: colors.textSecondary }]}>/tháng</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewRoomCtaBtn}
                    onPress={() => setSelectedListing(activeListing)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.viewRoomCtaText}>Xem phòng</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  floatingSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  searchBackBtn: {
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  filterActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusStrip: {
    marginTop: 8,
    marginBottom: 6,
    zIndex: 10,
  },
  radiusScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  radiusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  radiusPillActive: {
    backgroundColor: '#085F56',
  },
  radiusPillInactive: {
    borderWidth: 1,
  },
  radiusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  rightFabsWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 8,
    zIndex: 20,
  },
  fabBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingCountBtn: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 20,
  },
  floatingCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomPreviewCard: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  previewCardInner: {
    flexDirection: 'row',
  },
  previewThumbWrap: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  previewThumbImg: {
    width: '100%',
    height: '100%',
  },
  availableBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  availableBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  previewDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#085F56',
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  heartBtn: {
    padding: 2,
  },
  previewTitleText: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  previewUtilitiesText: {
    fontSize: 11,
    marginTop: 2,
  },
  previewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  previewPriceValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  previewPricePeriod: {
    fontSize: 10,
  },
  viewRoomCtaBtn: {
    backgroundColor: '#085F56',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewRoomCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
