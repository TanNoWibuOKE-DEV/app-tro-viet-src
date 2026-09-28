import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import {
  CampusProfile,
  CAMPUS_PROFILES,
  RoomTransferRecord,
  StudentPassItemRecord,
  PassItemCategory,
  createRoomTransfer,
  createStudentPassItem,
  markPassItemSold,
  filterPassItems,
} from '@troviet/shared';

interface CampusHubModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserId?: string | null;
  currentUserName?: string | null;
  currentUserPhone?: string | null;
}

export const CampusHubModal: React.FC<CampusHubModalProps> = ({
  visible,
  onClose,
  currentUserId = 'user-current-student',
  currentUserName = 'Nguyễn Văn An',
  currentUserPhone = '0905.123.456',
}) => {
  const { colors, isDark } = useTheme();

  // Active Tab: 'campuses' | 'transfers' | 'pass_items'
  const [activeTab, setActiveTab] = useState<'campuses' | 'transfers' | 'pass_items'>('campuses');
  const [selectedCampus, setSelectedCampus] = useState<CampusProfile>(CAMPUS_PROFILES[0]);

  // Room Transfers State
  const [transfers, setTransfers] = useState<RoomTransferRecord[]>([
    {
      id: 'trf-init-1',
      transferCode: 'TRF839210',
      tenantId: 'user-senior-1',
      title: 'Nhượng phòng trọ full đồ gần ĐH Bách Khoa Đà Nẵng (Ngô Thì Nhậm)',
      monthlyRent: 1800000,
      depositAmount: 1800000,
      roomAddress: 'K45 Ngô Thì Nhậm, Hòa Khánh Bắc, Liên Chiểu',
      wardSlug: 'hoa-khanh-bac',
      cityCode: 'danang',
      availableDate: '01/10/2026',
      contractMonthsLeft: 6,
      landlordConsent: true,
      incentiveNote: 'Tặng 300k tiền hỗ trợ dọn phòng và 1 quạt điện',
      contactPhone: '0905.998.776',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trf-init-2',
      transferCode: 'TRF928104',
      tenantId: 'user-senior-2',
      title: 'Pass lại hợp đồng studio gác lửng gần ĐHQG Hà Nội (Xuân Thủy)',
      monthlyRent: 3500000,
      depositAmount: 3500000,
      roomAddress: 'Ngõ 175 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy',
      wardSlug: 'dich-vong-hau',
      cityCode: 'hanoi',
      availableDate: '15/10/2026',
      contractMonthsLeft: 4,
      landlordConsent: true,
      incentiveNote: 'Hỗ trợ 500k cho bạn nào nhận cọc trong tuần này',
      contactPhone: '0912.334.556',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Pass Items State
  const [passItems, setPassItems] = useState<StudentPassItemRecord[]>([
    {
      id: 'pass-init-1',
      itemCode: 'PASS38291',
      sellerId: 'student-3',
      title: 'Quạt lửng Senko êm mát 90%',
      category: 'appliances',
      priceVnd: 120000,
      condition: 'good',
      campusNear: 'ĐH Bách Khoa ĐN',
      description: 'Quạt 3 tốc độ gió, chạy êm ru, có bảo vệ lồng quạt chắc chắn.',
      pickupLocation: 'K54 Nguyễn Lương Bằng, Liên Chiểu',
      contactPhone: '0905.882.119',
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pass-init-2',
      itemCode: 'PASS49201',
      sellerId: 'student-4',
      title: 'Đệm gấm gấp 3 sinh viên 1m2 x 2m',
      category: 'furniture',
      priceVnd: 80000,
      condition: 'good',
      campusNear: 'ĐH Bách Khoa ĐN',
      description: 'Đệm còn sạch sẽ, bọc vải gấm tháo giặt được.',
      pickupLocation: 'Đường Tôn Đức Thắng, Hòa Khánh Nam',
      contactPhone: '0905.334.889',
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pass-init-3',
      itemCode: 'PASS58210',
      sellerId: 'student-5',
      title: 'Tủ lạnh mini Aqua 90L chạy cực êm',
      category: 'appliances',
      priceVnd: 650000,
      condition: 'like_new',
      campusNear: 'ĐH Bách Khoa ĐN',
      description: 'Làm đá nhanh, tiết kiệm điện cho sinh viên ở 1-2 người.',
      pickupLocation: 'Đường Ngô Thì Nhậm, Liên Chiểu',
      contactPhone: '0905.772.331',
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // New Transfer Modal Form
  const [isPostingTransfer, setIsPostingTransfer] = useState(false);
  const [transferTitle, setTransferTitle] = useState('');
  const [transferRent, setTransferRent] = useState('');
  const [transferDeposit, setTransferDeposit] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferMonths, setTransferMonths] = useState('6');
  const [transferIncentive, setTransferIncentive] = useState('');

  // New Pass Item Modal Form
  const [isPostingPass, setIsPostingPass] = useState(false);
  const [passTitle, setPassTitle] = useState('');
  const [passCategory, setPassCategory] = useState<PassItemCategory>('appliances');
  const [passPrice, setPassPrice] = useState('');
  const [passDesc, setPassDesc] = useState('');
  const [passLocation, setPassLocation] = useState('');

  // Pass Item Category Filter
  const [selectedPassCategory, setSelectedPassCategory] = useState<string>('all');

  const handleCreateTransfer = () => {
    if (!transferTitle.trim() || !transferRent || !transferAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề, giá phòng và địa chỉ phòng trọ.');
      return;
    }

    const newRec = createRoomTransfer({
      tenantId: currentUserId || 'user-current-student',
      title: transferTitle.trim(),
      monthlyRent: parseInt(transferRent || '0', 10),
      depositAmount: parseInt(transferDeposit || transferRent || '0', 10),
      roomAddress: transferAddress.trim(),
      wardSlug: selectedCampus.popularWards[0] || 'khu-vuc-truong',
      cityCode: selectedCampus.cityCode,
      availableDate: 'Sớm nhất có thể',
      contractMonthsLeft: parseInt(transferMonths || '6', 10),
      landlordConsent: true,
      incentiveNote: transferIncentive.trim() || undefined,
      contactPhone: currentUserPhone || '0905.123.456',
    });

    setTransfers([newRec, ...transfers]);
    setIsPostingTransfer(false);
    setTransferTitle('');
    setTransferRent('');
    setTransferDeposit('');
    setTransferAddress('');
    Alert.alert(
      'Đăng tin sang nhượng thành công!',
      `Mã tin: ${newRec.transferCode}\nTin của bạn đã hiển thị trên Cụm ${selectedCampus.shortName}.`
    );
  };

  const handleCreatePassItem = () => {
    if (!passTitle.trim() || !passLocation.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đồ đạc và địa chỉ nhận đồ.');
      return;
    }

    const newItem = createStudentPassItem({
      sellerId: currentUserId || 'user-current-student',
      title: passTitle.trim(),
      category: passCategory,
      priceVnd: parseInt(passPrice || '0', 10),
      condition: 'good',
      campusNear: selectedCampus.shortName,
      description: passDesc.trim() || 'Đồ dùng sinh viên thanh lý giá rẻ.',
      pickupLocation: passLocation.trim(),
      contactPhone: currentUserPhone || '0905.123.456',
    });

    setPassItems([newItem, ...passItems]);
    setIsPostingPass(false);
    setPassTitle('');
    setPassPrice('');
    setPassDesc('');
    setPassLocation('');
    Alert.alert('Đăng đồ pass thành công!', 'Vật dụng của bạn đã xuất hiện trên chợ sinh viên.');
  };

  const handleMarkSold = (item: StudentPassItemRecord) => {
    const updated = markPassItemSold(item);
    setPassItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    Alert.alert('Chúc mừng!', 'Đã đánh dấu vật dụng là ĐÃ BÁN / ĐÃ PASS.');
  };

  const filteredPassItems = filterPassItems(passItems, {
    category: selectedPassCategory === 'all' ? undefined : (selectedPassCategory as PassItemCategory),
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            🎓 Cụm Sinh Viên & Sang Nhượng
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Tab Navigator */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'campuses' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('campuses')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'campuses' ? colors.primary : colors.textSecondary },
              ]}
            >
              Cụm Trường Học
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'transfers' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('transfers')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'transfers' ? colors.primary : colors.textSecondary },
              ]}
            >
              Nhượng Trọ ({transfers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'pass_items' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('pass_items')}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'pass_items' ? colors.primary : colors.textSecondary },
              ]}
            >
              Pass Đồ Trọ ({passItems.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* TAB 1: CAMPUS SELECTOR & STUDENT TIPS */}
          {activeTab === 'campuses' && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Chọn trường Đại học / Cao đẳng của bạn:
              </Text>

              {/* Horizontal Campus Pill Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.campusScroll}>
                {CAMPUS_PROFILES.map((campus) => {
                  const active = selectedCampus.id === campus.id;
                  return (
                    <TouchableOpacity
                      key={campus.id}
                      style={[
                        styles.campusPill,
                        {
                          backgroundColor: active ? colors.primary : colors.card,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedCampus(campus)}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : colors.textPrimary,
                        }}
                      >
                        {campus.shortName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Selected Campus Detail Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.campusFullName, { color: colors.textPrimary }]}>
                  🏛️ {selectedCampus.name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
                  📍 {selectedCampus.address}
                </Text>

                <View style={[styles.rentBenchmarkBox, { backgroundColor: isDark ? '#1F2937' : '#F0FDF4' }]}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Mặt bằng giá trọ sinh viên quanh trường:</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 2 }}>
                    ~{selectedCampus.averageStudentRent.toLocaleString('vi-VN')} ₫ / tháng
                  </Text>
                </View>

                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 12, marginBottom: 6 }}>
                  💡 Cẩm nang tìm trọ quanh {selectedCampus.shortName}:
                </Text>
                {selectedCampus.studentTips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Text style={{ color: colors.primary, fontWeight: '800', marginRight: 6 }}>•</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 }}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Quick Actions */}
              <View style={{ marginTop: 16, gap: 10 }}>
                <Button
                  title="🔄 Xem Tin Nhượng Trọ Quanh Trường Này"
                  onPress={() => setActiveTab('transfers')}
                  variant="primary"
                />
                <Button
                  title="📦 Chợ Thanh Lý Đồ Dùng Sinh Viên"
                  onPress={() => setActiveTab('pass_items')}
                  variant="secondary"
                />
              </View>
            </View>
          )}

          {/* TAB 2: ROOM TRANSFERS (Nhượng Phòng) */}
          {activeTab === 'transfers' && (
            <View>
              <View style={styles.actionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  Tin nhượng phòng trọ ({transfers.length})
                </Text>
                <TouchableOpacity
                  style={[styles.postBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setIsPostingTransfer(true)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>+ Nhượng trọ</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 14, marginTop: 4 }}>
                Sang nhượng hợp đồng thuê để thu hồi lại tiền cọc gốc khi cần đổi nơi ở.
              </Text>

              {transfers.map((item) => (
                <View
                  key={item.id}
                  style={[styles.transferCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.transferHeader}>
                    <Text style={[styles.transferCode, { color: colors.primary }]}>
                      Mã: {item.transferCode}
                    </Text>
                    <View style={styles.consentBadge}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#047857' }}>
                        ✓ Chủ nhà đồng ý nhượng
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.transferTitle, { color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                    📍 {item.roomAddress}
                  </Text>

                  <View style={styles.transferDetailsRow}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>Giá thuê:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                        {item.monthlyRent.toLocaleString('vi-VN')} ₫/tháng
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>Tiền cọc nhượng:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                        {item.depositAmount.toLocaleString('vi-VN')} ₫
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>Hợp đồng còn:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                        {item.contractMonthsLeft} tháng
                      </Text>
                    </View>
                  </View>

                  {item.incentiveNote && (
                    <View style={[styles.incentiveBox, { backgroundColor: isDark ? '#372020' : '#FEF2F2' }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
                        🎁 Hỗ trợ: {item.incentiveNote}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Nhận phòng từ: {item.availableDate}
                    </Text>
                    <TouchableOpacity
                      style={[styles.contactBtn, { backgroundColor: colors.primary }]}
                      onPress={() =>
                        Alert.alert('Liên hệ người nhượng phòng', `Số điện thoại: ${item.contactPhone}`)
                      }
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                        📞 Gọi {item.contactPhone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: STUDENT PASS ITEMS (Pass Đồ) */}
          {activeTab === 'pass_items' && (
            <View>
              <View style={styles.actionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  Chợ đồ dùng sinh viên ({filteredPassItems.length})
                </Text>
                <TouchableOpacity
                  style={[styles.postBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => setIsPostingPass(true)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>+ Đăng pass đồ</Text>
                </TouchableOpacity>
              </View>

              {/* Category Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'appliances', label: '🔌 Đồ điện' },
                  { key: 'furniture', label: '🪑 Bàn ghế / Đệm' },
                  { key: 'kitchen', label: '🍳 Bếp núc' },
                  { key: 'study', label: '📚 Góc học tập' },
                ].map((cat) => {
                  const active = selectedPassCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: active ? colors.primary : colors.card,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedPassCategory(cat.key)}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : colors.textPrimary,
                        }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {filteredPassItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.passCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: item.status === 'sold' ? '#9CA3AF' : '#DCFCE7' },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '800',
                          color: item.status === 'sold' ? '#FFFFFF' : '#166534',
                        }}
                      >
                        {item.status === 'sold' ? 'Đã pass' : 'Còn đồ'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.itemPrice, { color: item.priceVnd === 0 ? '#10B981' : colors.primary }]}>
                    {item.priceVnd === 0 ? '🎁 Tặng miễn phí (0 ₫)' : `${item.priceVnd.toLocaleString('vi-VN')} ₫`}
                  </Text>

                  <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                    📍 Lấy đồ tại: {item.pickupLocation} ({item.campusNear})
                  </Text>

                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert('Liên hệ người bán', `Số điện thoại: ${item.contactPhone}`)
                      }
                    >
                      <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
                        📞 Liên hệ: {item.contactPhone}
                      </Text>
                    </TouchableOpacity>

                    {item.status === 'available' && (
                      <TouchableOpacity
                        style={[styles.soldBtn, { borderColor: colors.border }]}
                        onPress={() => handleMarkSold(item)}
                      >
                        <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>
                          Đã pass xong
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Đăng Nhượng Phòng */}
        <Modal visible={isPostingTransfer} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                🔄 Đăng Tin Sang Nhượng Phòng Trọ
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Tiêu đề tin:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ví dụ: Nhượng phòng gác lửng gần cổng sau ĐH Bách Khoa"
                placeholderTextColor={colors.textSecondary}
                value={transferTitle}
                onChangeText={setTransferTitle}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Tiền thuê/tháng:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="2000000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={transferRent}
                    onChangeText={setTransferRent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Tiền cọc nhượng:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="2000000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={transferDeposit}
                    onChangeText={setTransferDeposit}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Địa chỉ phòng:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Số nhà, tên ngõ hẻm..."
                placeholderTextColor={colors.textSecondary}
                value={transferAddress}
                onChangeText={setTransferAddress}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Ưu đãi hỗ trợ (Tùy chọn):</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ví dụ: Tặng 300k tiền dọn nhà, để lại quạt..."
                placeholderTextColor={colors.textSecondary}
                value={transferIncentive}
                onChangeText={setTransferIncentive}
              />

              <View style={styles.modalBtns}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Button title="Hủy" onPress={() => setIsPostingTransfer(false)} variant="secondary" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Button title="Đăng tin ngay" onPress={handleCreateTransfer} variant="primary" />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Đăng Pass Đồ */}
        <Modal visible={isPostingPass} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                📦 Đăng Pass Đồ Dùng Trọ Sinh Viên
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Tên đồ đạc:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ví dụ: Tủ sấy quần áo, bàn học gấp..."
                placeholderTextColor={colors.textSecondary}
                value={passTitle}
                onChangeText={setPassTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Giá thanh lý (₫) - Nhập 0 nếu tặng:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ví dụ: 100000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={passPrice}
                onChangeText={setPassPrice}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Địa chỉ xem & lấy đồ:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ví dụ: K54 Nguyễn Lương Bằng, Liên Chiểu"
                placeholderTextColor={colors.textSecondary}
                value={passLocation}
                onChangeText={setPassLocation}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Mô tả tình trạng:</Text>
              <TextInput
                style={[styles.input, { minHeight: 60, textAlignVertical: 'top', backgroundColor: isDark ? '#1F2937' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Mô tả độ mới, chức năng..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
                value={passDesc}
                onChangeText={setPassDesc}
              />

              <View style={styles.modalBtns}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Button title="Hủy" onPress={() => setIsPostingPass(false)} variant="secondary" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Button title="Đăng pass" onPress={handleCreatePassItem} variant="primary" />
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  campusScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  campusPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  campusFullName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  rentBenchmarkBox: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  postBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  transferCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  transferCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  consentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#DCFCE7',
  },
  transferTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  transferDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginVertical: 6,
  },
  incentiveBox: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  contactBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 14,
    marginTop: 8,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  passCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  soldBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
