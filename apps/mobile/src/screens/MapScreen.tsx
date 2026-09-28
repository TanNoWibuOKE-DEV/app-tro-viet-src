import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import {
  ListingSummary,
  formatVND,
  formatArea,
  calculateHaversineDistance,
} from '@troviet/shared';

interface Landmark {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const POPULAR_LANDMARKS: Landmark[] = [
  { id: 'all_dn', name: '📍 Đà Nẵng', latitude: 16.060, longitude: 108.210 },
  { id: 'duytan', name: '🎓 ĐH Duy Tân (ĐN)', latitude: 16.0728, longitude: 108.2215 },
  { id: 'bachkhoa_dn', name: '🎓 ĐH Bách Khoa (ĐN)', latitude: 16.0738, longitude: 108.1498 },
  { id: 'kinhte_dn', name: '🎓 ĐH Kinh Tế (ĐN)', latitude: 16.0502, longitude: 108.2346 },
  { id: 'mykhe', name: '🏖️ Biển Mỹ Khê', latitude: 16.0601, longitude: 108.2464 },
  { id: 'dhqg_hn', name: '🎓 ĐHQG Hà Nội', latitude: 21.0368, longitude: 105.7874 },
  { id: 'ftu_hn', name: '🏛️ ĐH Ngoại Thương (HN)', latitude: 21.0245, longitude: 105.8089 },
  { id: 'dhqg_hcm', name: '🎓 Làng ĐH (TP.HCM)', latitude: 10.8703, longitude: 106.7782 },
  { id: 'hutech_hcm', name: '🏢 ĐH HUTECH (HCM)', latitude: 10.8016, longitude: 106.7138 },
];

export const MapScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { listings, setSelectedListing } = useApp();

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark>(POPULAR_LANDMARKS[0]);
  const [activePinListingId, setActivePinListingId] = useState<string | null>(null);

  const publishedListings = useMemo(
    () => listings.filter((l) => l.status === 'published'),
    [listings]
  );

  // Compute distance of each listing to current active landmark
  const listingsWithDistance = useMemo(() => {
    return publishedListings
      .map((item) => {
        const distanceKm = calculateHaversineDistance(
          { latitude: selectedLandmark.latitude, longitude: selectedLandmark.longitude },
          { latitude: item.latitude, longitude: item.longitude }
        );
        return {
          ...item,
          distanceKm,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [publishedListings, selectedLandmark]);

  const activeListing = useMemo(() => {
    if (activePinListingId) {
      return publishedListings.find((l) => l.id === activePinListingId) || null;
    }
    return listingsWithDistance[0] || null;
  }, [activePinListingId, publishedListings, listingsWithDistance]);

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

  // Generate self-contained Leaflet OpenStreetMap HTML
  const mapHtml = useMemo(() => {
    const primaryColor = colors.primary || '#10B981';
    const markersJson = JSON.stringify(
      publishedListings.map((l) => ({
        id: l.id,
        title: l.title,
        lat: l.latitude,
        lng: l.longitude,
        priceText: `${(l.monthlyRent / 1000000).toFixed(1).replace('.0', '')}tr`,
        rentFormatted: formatVND(l.monthlyRent),
      }))
    );

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
      background-color: ${primaryColor};
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 12px;
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease;
      white-space: nowrap;
    }
    .price-pin:hover, .price-pin:active {
      transform: scale(1.15);
      background-color: #059669;
    }
    .landmark-pin {
      background-color: #2563EB;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 12px;
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var centerLat = ${selectedLandmark.latitude};
    var centerLng = ${selectedLandmark.longitude};
    var map = L.map('map', { zoomControl: true }).setView([centerLat, centerLng], 14);

    // Official OpenStreetMap Tile Layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Landmark Target Marker
    var landmarkIcon = L.divIcon({
      className: 'landmark-icon-container',
      html: '<div class="landmark-pin">${selectedLandmark.name}</div>',
      iconSize: [120, 30],
      iconAnchor: [60, 15]
    });
    L.marker([centerLat, centerLng], { icon: landmarkIcon }).addTo(map);

    // Property Pins
    var markers = ${markersJson};
    markers.forEach(function(item) {
      var pinIcon = L.divIcon({
        className: 'price-icon-container',
        html: '<div class="price-pin">' + item.priceText + '</div>',
        iconSize: [60, 26],
        iconAnchor: [30, 13]
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
  }, [selectedLandmark, publishedListings, colors.primary]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top Header / Landmark Selector */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            🗺️ Bản đồ thực tế (OpenStreetMap)
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>
              {publishedListings.length} phòng tọa độ thực
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.landmarkScroll}>
          {POPULAR_LANDMARKS.map((lm) => {
            const active = selectedLandmark.id === lm.id;
            return (
              <TouchableOpacity
                key={lm.id}
                style={[
                  styles.landmarkPill,
                  {
                    backgroundColor: active ? colors.primary : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedLandmark(lm);
                  setActivePinListingId(null);
                }}
              >
                <Text
                  style={{
                    color: active ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {lm.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Real Map Viewport Container */}
      <View style={[styles.mapViewport, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        {Platform.OS === 'web' ? (
          // Web: Render interactive iframe with Leaflet + OSM tiles
          <iframe
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="RealOpenStreetMap"
          />
        ) : (
          // Native: Render Android/iOS WebView with Leaflet + OSM tiles
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={{ flex: 1 }}
            onMessage={handleNativeMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}

        {/* Floating Empty State Hint if zero listings in area */}
        {publishedListings.length === 0 && (
          <View style={[styles.emptyMapFloatingBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
              📍 {selectedLandmark.name}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
              Chưa có tin phòng trọ nào ở khu vực này. Hãy là chủ trọ đầu tiên đăng tin!
            </Text>
          </View>
        )}
      </View>

      {/* Property Preview Card at Bottom */}
      {activeListing && (
        <View style={[styles.bottomCardWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.previewRow}>
            {/* Thumbnail */}
            <View style={[styles.previewThumb, { backgroundColor: colors.border }]}>
              <Text style={{ fontSize: 26 }}>🏡</Text>
            </View>

            {/* Info */}
            <View style={styles.previewInfo}>
              <View style={styles.previewPriceRow}>
                <Text style={[styles.previewPrice, { color: colors.primary }]}>
                  {formatVND(activeListing.monthlyRent)}
                </Text>
                <Text style={[styles.previewPeriod, { color: colors.textSecondary }]}>/tháng</Text>
              </View>

              <Text style={[styles.previewTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {activeListing.title}
              </Text>

              <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                {formatArea(activeListing.areaSquareMeters)} · {activeListing.wardName}
              </Text>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.detailActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setSelectedListing(activeListing)}
          >
            <Text style={styles.detailActionBtnText}>Xem chi tiết phòng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  landmarkScroll: {
    gap: 8,
  },
  landmarkPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  mapViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyMapFloatingBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomCardWrapper: {
    padding: 14,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewPeriod: {
    fontSize: 12,
    marginLeft: 4,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewMeta: {
    fontSize: 12,
  },
  detailActionBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
