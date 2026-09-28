import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import {
  VehicleType,
  VEHICLE_SPECS,
  SPECIAL_SURCHARGE_ITEMS,
  calculateMovingCost,
  createServiceRequest,
  ServiceRequestRecord,
  ServiceType,
} from '@troviet/shared';

interface TenantLifeHubModalProps {
  visible: boolean;
  onClose: () => void;
  tenantId?: string | null;
  tenantName?: string | null;
}

export const TenantLifeHubModal: React.FC<TenantLifeHubModalProps> = ({
  visible,
  onClose,
  tenantId = 'user-current-tenant',
  tenantName = 'Nguyễn Văn An',
}) => {
  const safeTenantId = tenantId || 'user-current-tenant';
  const safeTenantName = tenantName || 'Nguyễn Văn An';
  const { colors, isDark } = useTheme();

  // Active Tab: 'moving' | 'services' | 'history'
  const [activeTab, setActiveTab] = useState<'moving' | 'services' | 'history'>('moving');

  // Moving Calculator Form State
  const [vehicleType, setVehicleType] = useState<VehicleType>('ba_gac');
  const [distanceKm, setDistanceKm] = useState<number>(3.5);
  const [floorPickup, setFloorPickup] = useState<number>(1);
  const [hasElevatorPickup, setHasElevatorPickup] = useState<boolean>(true);
  const [floorDropoff, setFloorDropoff] = useState<number>(1);
  const [hasElevatorDropoff, setHasElevatorDropoff] = useState<boolean>(true);
  const [includePorter, setIncludePorter] = useState<boolean>(false);
  const [selectedSpecialItems, setSelectedSpecialItems] = useState<string[]>([]);
  const [pickupAddress, setPickupAddress] = useState('120 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng');
  const [destinationAddress, setDestinationAddress] = useState('45 Ngô Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng');
  const [scheduledDate, setScheduledDate] = useState('01/10/2026 - 08:30 Sáng');

  // Local Booking History
  const [bookings, setBookings] = useState<ServiceRequestRecord[]>([
    {
      id: 'srv-init-1',
      requestCode: 'SRV392102',
      tenantId: safeTenantId,
      serviceType: 'moving',
      status: 'confirmed',
      pickupAddress: 'Khu ký túc xá ĐH Sư Phạm, Đà Nẵng',
      destinationAddress: 'K234 Nguyễn Tri Phương, Hòa Cường Bắc, Đà Nẵng',
      scheduledDate: '25/09/2026 09:00',
      estimatedCost: 320000,
      details: { vehicle: 'ba_gac', distanceKm: 4.5 },
      partnerName: 'Đội xe Ba Gác Bác Hùng (Đã xác minh)',
      partnerPhone: '0905.889.213',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Real-time calculation
  const costBreakdown = calculateMovingCost({
    distanceKm,
    vehicleType,
    floorPickup,
    hasElevatorPickup,
    floorDropoff,
    hasElevatorDropoff,
    includePorter,
    specialItemIds: selectedSpecialItems,
  });

  const toggleSpecialItem = (itemId: string) => {
    if (selectedSpecialItems.includes(itemId)) {
      setSelectedSpecialItems(selectedSpecialItems.filter((id) => id !== itemId));
    } else {
      setSelectedSpecialItems([...selectedSpecialItems, itemId]);
    }
  };

  const handleBookMoving = () => {
    const newRequest = createServiceRequest({
      tenantId: safeTenantId,
      serviceType: 'moving',
      pickupAddress,
      destinationAddress,
      scheduledDate,
      estimatedCost: costBreakdown.totalCostVnd,
      details: {
        vehicleType,
        distanceKm,
        floorPickup,
        hasElevatorPickup,
        floorDropoff,
        hasElevatorDropoff,
        includePorter,
        specialItemIds: selectedSpecialItems,
      },
      notes: `Người đặt: ${safeTenantName} - Cần hỗ trợ chuyển đúng giờ`,
    });

    setBookings([newRequest, ...bookings]);
    Alert.alert(
      'Đặt lịch chuyển trọ thành công!',
      `Mã yêu cầu: ${newRequest.requestCode}\nTổng chi phí dự toán: ${costBreakdown.totalCostVnd.toLocaleString('vi-VN')} ₫\n\nĐối tác vận chuyển được gắn nhãn xác minh sẽ liên hệ bạn trước giờ hẹn 30 phút để xác nhận lộ trình.`
    );
    setActiveTab('history');
  };

  const handleBookOtherService = (serviceType: ServiceType, name: string, estimatedCost: number) => {
    const newRequest = createServiceRequest({
      tenantId: safeTenantId,
      serviceType,
      scheduledDate: 'Ngày mai - 09:00',
      estimatedCost,
      details: { serviceName: name },
      notes: `Yêu cầu dịch vụ ${name}`,
    });

    setBookings([newRequest, ...bookings]);
    Alert.alert(
      'Đặt dịch vụ thành công!',
      `Bạn đã đặt "${name}".\nMã đặt chỗ: ${newRequest.requestCode}\nGiá dự toán: ${estimatedCost.toLocaleString('vi-VN')} ₫.\nThợ địa phương đã xác minh danh tính sẽ liên hệ sớm nhất.`
    );
    setActiveTab('history');
  };

  const otherServices = [
    {
      type: 'cleaning' as ServiceType,
      title: '🧹 Dọn phòng & Vệ sinh công nghiệp',
      price: 250000,
      desc: 'Tẩy ố sàn gạch, lau kính, khử mùi ẩm mốc trước khi nhận hoặc trả phòng trọ.',
    },
    {
      type: 'plumbing_electrical' as ServiceType,
      title: '🔧 Sửa chữa điện nước & Chống rò rỉ',
      price: 150000,
      desc: 'Thay van vòi sen, sửa chập điện, thông tắc lavabo bồn cầu nhanh chóng.',
    },
    {
      type: 'ac_maintenance' as ServiceType,
      title: '❄️ Bảo dưỡng & Vệ sinh Máy lạnh',
      price: 180000,
      desc: 'Xịt rửa dàn nóng, dàn lạnh, kiểm tra áp suất gas máy lạnh làm mát sâu tiết kiệm điện.',
    },
    {
      type: 'laundry' as ServiceType,
      title: '🧺 Giặt sấy lấy liền & Giặt chăn mền',
      price: 60000,
      desc: 'Giao nhận tận cửa phòng trọ, thơm tho sạch khuẩn cho sinh viên & dân văn phòng.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            🚚 Tiện Ích Sinh Hoạt Trọ
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'moving' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('moving')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'moving' ? colors.primary : colors.textSecondary },
              ]}
            >
              Dự toán Chuyển trọ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'services' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('services')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'services' ? colors.primary : colors.textSecondary },
              ]}
            >
              Sửa chữa & Vệ sinh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'history' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'history' ? colors.primary : colors.textSecondary },
              ]}
            >
              Lịch sử ({bookings.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* TAB 1: MOVING CALCULATOR */}
          {activeTab === 'moving' && (
            <View>
              {/* Introduction Banner */}
              <View style={[styles.banner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.primary }]}>
                <Text style={[styles.bannerTitle, { color: colors.primary }]}>
                  📦 Bảng Giá Chuyển Trọ Minh Bạch
                </Text>
                <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
                  Cam kết báo giá trọn gói trước chuyến đi, chuẩn hóa cước xe theo kilômét và phụ phí thang bộ, tuyệt đối không phát sinh phụ phí vô lý.
                </Text>
              </View>

              {/* 1. Chọn Phương Tiện */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                1. Chọn phương tiện phù hợp
              </Text>
              <View style={styles.vehicleList}>
                {(['ba_gac', 'truck_small_750kg', 'truck_large_1250kg'] as VehicleType[]).map((vKey) => {
                  const spec = VEHICLE_SPECS[vKey];
                  const isSelected = vehicleType === vKey;
                  return (
                    <TouchableOpacity
                      key={vKey}
                      style={[
                        styles.vehicleCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setVehicleType(vKey)}
                    >
                      <View style={styles.vehicleHeader}>
                        <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                          {vKey === 'ba_gac' ? '🛺' : '🚚'} {spec.shortName}
                        </Text>
                        <Text style={[styles.vehiclePrice, { color: colors.primary }]}>
                          {spec.basePriceVnd.toLocaleString('vi-VN')} ₫
                          <Text style={{ fontSize: 11, color: colors.textSecondary }}> / 4km đầu</Text>
                        </Text>
                      </View>
                      <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]}>
                        {spec.recommendedFor}
                      </Text>
                      <Text style={[styles.vehicleSpecTag, { color: colors.textSecondary }]}>
                        Tải trọng: {spec.maxCapacityKg} kg • Kích thước: {spec.dimensions}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 2. Cự Ly Vận Chuyển */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                2. Cự ly vận chuyển (km)
              </Text>
              <View style={[styles.counterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.counterBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                  onPress={() => setDistanceKm(Math.max(1, Math.round((distanceKm - 0.5) * 10) / 10))}
                >
                  <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
                </TouchableOpacity>

                <View style={styles.counterValue}>
                  <Text style={[styles.counterNumber, { color: colors.primary }]}>{distanceKm} km</Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {distanceKm <= 4 ? 'Trong gói 4km đầu' : `Vượt ${Math.ceil(distanceKm - 4)} km`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.counterBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                  onPress={() => setDistanceKm(Math.round((distanceKm + 0.5) * 10) / 10)}
                >
                  <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>

              {/* 3. Lối vào & Thang bộ */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                3. Điều kiện lầu & Thang máy
              </Text>
              <View style={[styles.floorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Điểm Đi */}
                <View style={styles.floorRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                      Điểm bốc đồ (Chỗ cũ): Tầng {floorPickup}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {hasElevatorPickup ? 'Có thang máy' : 'Đi thang bộ (+50k/tầng)'}
                    </Text>
                  </View>
                  <View style={styles.stepperMini}>
                    <TouchableOpacity
                      onPress={() => setFloorPickup(Math.max(1, floorPickup - 1))}
                      style={[styles.miniBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.textPrimary, fontWeight: '700', marginHorizontal: 8 }}>
                      Tầng {floorPickup}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setFloorPickup(floorPickup + 1)}
                      style={[styles.miniBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.switchRow}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>Có thang máy vận chuyển</Text>
                  <Switch
                    value={hasElevatorPickup}
                    onValueChange={setHasElevatorPickup}
                    trackColor={{ false: '#9CA3AF', true: colors.primary }}
                  />
                </View>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

                {/* Điểm Đến */}
                <View style={styles.floorRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                      Điểm dỡ đồ (Chỗ mới): Tầng {floorDropoff}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {hasElevatorDropoff ? 'Có thang máy' : 'Đi thang bộ (+50k/tầng)'}
                    </Text>
                  </View>
                  <View style={styles.stepperMini}>
                    <TouchableOpacity
                      onPress={() => setFloorDropoff(Math.max(1, floorDropoff - 1))}
                      style={[styles.miniBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.textPrimary, fontWeight: '700', marginHorizontal: 8 }}>
                      Tầng {floorDropoff}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setFloorDropoff(floorDropoff + 1)}
                      style={[styles.miniBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.switchRow}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>Có thang máy vận chuyển</Text>
                  <Switch
                    value={hasElevatorDropoff}
                    onValueChange={setHasElevatorDropoff}
                    trackColor={{ false: '#9CA3AF', true: colors.primary }}
                  />
                </View>
              </View>

              {/* 4. Dịch vụ Bốc Xếp & Đồ Cồng Kềnh */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                4. Dịch vụ thêm & Đồ cồng kềnh
              </Text>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                      Bốc xếp trọn gói 2 đầu (+{VEHICLE_SPECS[vehicleType].porterBaseVnd.toLocaleString('vi-VN')} ₫)
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Tài xế & phụ xe bốc dỡ vào tận trong phòng trọ cho bạn
                    </Text>
                  </View>
                  <Switch
                    value={includePorter}
                    onValueChange={setIncludePorter}
                    trackColor={{ false: '#9CA3AF', true: colors.primary }}
                  />
                </View>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
                  Thiết bị cồng kềnh phụ thu:
                </Text>
                {SPECIAL_SURCHARGE_ITEMS.map((item) => {
                  const isChecked = selectedSpecialItems.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemCheckRow,
                        { backgroundColor: isChecked ? (isDark ? '#1E293B' : '#F0FDF4') : 'transparent' },
                      ]}
                      onPress={() => toggleSpecialItem(item.id)}
                    >
                      <Text style={{ fontSize: 16, marginRight: 8 }}>{isChecked ? '✅' : '⬜'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                          {item.description}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                        +{item.surchargeVnd.toLocaleString('vi-VN')} ₫
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 5. TỔNG CHI PHÍ & ĐẶT LỊCH */}
              <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <Text style={[styles.breakdownTitle, { color: colors.textPrimary }]}>
                  Dự Toán Chi Phí Chi Tiết
                </Text>

                <View style={styles.priceRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Cước xe ({VEHICLE_SPECS[vehicleType].shortName} - {distanceKm} km):
                  </Text>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                    {costBreakdown.distanceCost.toLocaleString('vi-VN')} ₫
                  </Text>
                </View>

                {costBreakdown.totalStairsSurcharge > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Phụ phí thang bộ:</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                      +{costBreakdown.totalStairsSurcharge.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                )}

                {costBreakdown.porterCost > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Phí bốc xếp:</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                      +{costBreakdown.porterCost.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                )}

                {costBreakdown.specialItemsCost > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Đồ cồng kềnh:</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                      +{costBreakdown.specialItemsCost.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                )}

                <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
                    Tổng trọn gói dự kiến:
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>
                    {costBreakdown.totalCostVnd.toLocaleString('vi-VN')} ₫
                  </Text>
                </View>

                <View style={{ marginTop: 16 }}>
                  <Button
                    title="🚚 Đặt Lịch Chuyển Trọ Ngay"
                    onPress={handleBookMoving}
                    variant="primary"
                  />
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: OTHER TENANT SERVICES */}
          {activeTab === 'services' && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Dịch vụ sinh hoạt trọ uy tín
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
                Các đối tác thợ kỹ thuật và đơn vị vệ sinh được người dùng Trọ Việt bình chọn đánh giá cao.
              </Text>

              {otherServices.map((svc) => (
                <View
                  key={svc.type}
                  style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>{svc.title}</Text>
                    <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{svc.desc}</Text>
                    <Text style={[styles.servicePrice, { color: colors.primary }]}>
                      Giá tham khảo: từ {svc.price.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                  <View style={{ width: 100, marginLeft: 12 }}>
                    <Button
                      title="Đặt hẹn"
                      onPress={() => handleBookOtherService(svc.type, svc.title, svc.price)}
                      variant="secondary"
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: BOOKINGS HISTORY */}
          {activeTab === 'history' && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Yêu cầu tiện ích của bạn ({bookings.length})
              </Text>

              {bookings.map((item) => (
                <View
                  key={item.id}
                  style={[styles.bookingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={[styles.bookingCode, { color: colors.primary }]}>
                      Mã: {item.requestCode}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status === 'confirmed' ? '#DCFCE7' : isDark ? '#374151' : '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: item.status === 'confirmed' ? '#166534' : '#92400E',
                        }}
                      >
                        {item.status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.bookingType, { color: colors.textPrimary }]}>
                    Dịch vụ:{' '}
                    {item.serviceType === 'moving'
                      ? 'Chuyển trọ trọn gói'
                      : item.serviceType === 'cleaning'
                      ? 'Dọn vệ sinh phòng'
                      : item.serviceType === 'plumbing_electrical'
                      ? 'Sửa chữa điện nước'
                      : 'Bảo dưỡng máy lạnh'}
                  </Text>

                  {item.pickupAddress && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      📍 Từ: {item.pickupAddress}
                    </Text>
                  )}
                  {item.destinationAddress && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                      🏁 Đến: {item.destinationAddress}
                    </Text>
                  )}

                  <View style={[styles.bookingFooter, { borderTopColor: colors.border }]}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Thời gian: {item.scheduledDate}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                      {item.estimatedCost.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  banner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 8,
  },
  vehicleList: {
    gap: 10,
    marginBottom: 16,
  },
  vehicleCard: {
    padding: 14,
    borderRadius: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
  },
  vehiclePrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  vehicleDesc: {
    fontSize: 12,
    marginBottom: 6,
  },
  vehicleSpecTag: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 22,
    fontWeight: '700',
  },
  counterValue: {
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  floorCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepperMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  itemCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalDivider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  bookingItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingCode: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bookingType: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
