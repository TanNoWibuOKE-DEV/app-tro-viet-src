import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useResponsiveLayout } from '../utils/responsive';
import { getListingCoverImage } from '../utils/imageAssets';
import { ListingSummary, formatVND } from '@troviet/shared';

interface ViewingAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  listing: ListingSummary;
  onConfirmSuccess?: () => void;
}

interface TimeSlot {
  id: string;
  time: string;
  label: string;
  status: 'available' | 'recommended' | 'popular' | 'booked';
}

export const ViewingAppointmentModal: React.FC<ViewingAppointmentModalProps> = ({
  visible,
  onClose,
  listing,
  onConfirmSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const { insets, contentMaxWidth } = useResponsiveLayout();

  // Selected Date State
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default: Ngày mai

  // Time Slots
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00', label: 'Còn trống', status: 'available' },
    { id: '2', time: '10:30', label: 'Thích hợp nhất', status: 'recommended' },
    { id: '3', time: '13:00', label: 'Còn trống', status: 'available' },
    { id: '4', time: '15:00', label: 'Còn trống', status: 'available' },
    { id: '5', time: '17:30', label: 'Phổ biến sau giờ học', status: 'popular' },
    { id: '6', time: '19:00', label: 'Đã kín lịch', status: 'booked' },
  ];
  const [selectedSlotId, setSelectedSlotId] = useState('2');

  // Contact Form
  const [fullName, setFullName] = useState('Nguyễn Văn An');
  const [phoneNumber, setPhoneNumber] = useState('0912 345 678');
  const [noteMessage, setNoteMessage] = useState(
    'Em là sinh viên năm 3 ĐH Tôn Đức Thắng, muốn qua xem phòng và hỏi thêm về chỗ để xe máy ạ.'
  );

  const dates = [
    { dayOfWeek: 'HÔM NAY', dayNum: '24', month: 'Th10', isSunday: false },
    { dayOfWeek: 'NGÀY MAI', dayNum: '25', month: 'Th10', isSunday: false },
    { dayOfWeek: 'THỨ 7', dayNum: '26', month: 'Th10', isSunday: false },
    { dayOfWeek: 'C.NHẬT', dayNum: '27', month: 'Th10', isSunday: true },
    { dayOfWeek: 'THỨ 2', dayNum: '28', month: 'Th10', isSunday: false },
  ];

  const handleConfirm = () => {
    const chosenDate = dates[selectedDateIndex];
    const chosenSlot = timeSlots.find((s) => s.id === selectedSlotId);

    Alert.alert(
      'Đặt lịch hẹn thành công!',
      `Lịch hẹn xem phòng: ${chosenDate.dayOfWeek} (${chosenDate.dayNum}/${chosenDate.month}) lúc ${chosenSlot?.time}.\n\nChủ nhà ${listing.landlordName} sẽ nhận được thông báo tức thì và phản hồi trong khoảng 15 phút.`,
      [
        {
          text: 'Đã hiểu',
          onPress: () => {
            onConfirmSuccess?.();
            onClose();
          },
        },
      ]
    );
  };

  const coverImageUrl = getListingCoverImage(listing);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Top Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
                paddingTop: insets.top,
                height: 54 + insets.top,
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.headerBtn} accessibilityLabel="Quay lại">
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Đặt Cọc Giữ Phòng
            </Text>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Chia sẻ">
                <Ionicons name="share-social-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Yêu thích">
                <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={[styles.headerAvatar, { backgroundColor: '#E2E8F0' }]}>
                <Ionicons name="person" size={14} color="#64748B" />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Step Progress Bar */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperInfo}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>2</Text>
                </View>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                  Bước 2 / 3 <Text style={styles.stepSub}>• Chọn thời gian & thông tin</Text>
                </Text>
              </View>
              <View style={styles.progressBarRow}>
                <View style={[styles.progressSegment, styles.progressActive]} />
                <View style={[styles.progressSegment, styles.progressActive]} />
                <View style={[styles.progressSegment, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
              </View>
            </View>

            {/* Property Summary Card */}
            <View style={[styles.propertyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.propertyThumbWrap}>
                <Image source={{ uri: coverImageUrl }} style={styles.propertyThumb} resizeMode="cover" />
                <View style={styles.approvedBadge}>
                  <Ionicons name="checkmark-circle" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
                  <Text style={styles.approvedBadgeText}>Đã duyệt</Text>
                </View>
              </View>

              <View style={styles.propertyDetails}>
                <View style={styles.landlordRow}>
                  <Text style={[styles.landlordName, { color: colors.textPrimary }]}>
                    {listing.landlordName}
                  </Text>
                  <Ionicons name="checkmark-circle" size={13} color="#085F56" style={{ marginHorizontal: 3 }} />
                  <View style={styles.landlordTag}>
                    <Text style={styles.landlordTagText}>Chủ nhà nhiệt tình</Text>
                  </View>
                </View>
                <Text style={[styles.listingTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {listing.title}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceValue, { color: '#085F56' }]}>
                    {formatVND(listing.monthlyRent)}
                  </Text>
                  <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/tháng</Text>
                </View>
              </View>
            </View>

            {/* SECTION 1: Chọn ngày xem phòng */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.sectionBullet, { backgroundColor: '#085F56' }]} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    1. Chọn ngày xem phòng
                  </Text>
                </View>
                <Text style={[styles.sectionRightHint, { color: colors.textSecondary }]}>
                  Tháng 10, 2026
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateScroll}
              >
                {dates.map((item, idx) => {
                  const isActive = selectedDateIndex === idx;
                  return (
                    <TouchableOpacity
                      key={item.dayNum}
                      style={[
                        styles.dateCard,
                        {
                          backgroundColor: isActive ? '#085F56' : colors.card,
                          borderColor: isActive ? '#085F56' : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedDateIndex(idx)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dateDayOfWeek,
                          {
                            color: isActive
                              ? '#FFFFFF'
                              : item.isSunday
                              ? '#EF4444'
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {item.dayOfWeek}
                      </Text>
                      <Text
                        style={[
                          styles.dateDayNum,
                          { color: isActive ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {item.dayNum}
                      </Text>
                      <Text
                        style={[
                          styles.dateMonth,
                          { color: isActive ? '#E6F4F1' : colors.textSecondary },
                        ]}
                      >
                        {item.month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* SECTION 2: Chọn giờ xem phòng */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.sectionBullet, { backgroundColor: '#085F56' }]} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    2. Chọn giờ xem phòng
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} style={{ marginRight: 3 }} />
                  <Text style={[styles.sectionRightHint, { color: colors.textSecondary }]}>
                    Khoảng 15-20 phút
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionNotice, { color: colors.textSecondary }]}>
                Chủ nhà ưu tiên tiếp đón các khung giờ bên dưới để bạn có thể xem phòng kỹ lưỡng nhất.
              </Text>

              <View style={styles.timeSlotsGrid}>
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isBooked = slot.status === 'booked';
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      disabled={isBooked}
                      style={[
                        styles.slotCard,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#064E3B'
                              : '#E6F4F1'
                            : isBooked
                            ? isDark
                              ? '#1E293B'
                              : '#F1F5F9'
                            : colors.card,
                          borderColor: isSelected
                            ? '#085F56'
                            : isBooked
                            ? 'transparent'
                            : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedSlotId(slot.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.slotTopRow}>
                        <Text
                          style={[
                            styles.slotTime,
                            {
                              color: isBooked
                                ? '#94A3B8'
                                : isSelected
                                ? '#085F56'
                                : colors.textPrimary,
                              textDecorationLine: isBooked ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {slot.time}
                        </Text>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={16} color="#085F56" />
                        ) : isBooked ? (
                          <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                        ) : (
                          <View
                            style={[
                              styles.slotDot,
                              { backgroundColor: isDark ? '#475569' : '#CBD5E1' },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.slotStatusRow}>
                        {slot.status === 'popular' && (
                          <Ionicons name="flame" size={12} color="#EF4444" style={{ marginRight: 3 }} />
                        )}
                        <Text
                          style={[
                            styles.slotLabel,
                            {
                              color: isBooked
                                ? '#94A3B8'
                                : isSelected
                                ? '#085F56'
                                : colors.textSecondary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {isSelected ? 'Đã chọn • ' + slot.label : slot.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SECTION 3: Thông tin liên hệ & Ghi chú */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.sectionBullet, { backgroundColor: '#085F56' }]} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    3. Thông tin liên hệ & Ghi chú
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#085F56', fontWeight: '700' }}>
                  Tự động điền
                </Text>
              </View>

              {/* Họ và tên */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Họ và tên người xem phòng
              </Text>
              <View style={[styles.inputBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                />
              </View>

              {/* Số điện thoại */}
              <View style={[styles.labelRow, { marginTop: 12 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Số điện thoại
                </Text>
                <View style={styles.verifiedWalletBadge}>
                  <Ionicons name="shield-checkmark" size={11} color="#085F56" style={{ marginRight: 3 }} />
                  <Text style={styles.verifiedWalletText}>Đã liên kết ví</Text>
                </View>
              </View>
              <View style={[styles.inputBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
                <Ionicons name="call-outline" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="Nhập số điện thoại"
                />
              </View>

              {/* Lời nhắn gửi chủ nhà */}
              <View style={[styles.labelRow, { marginTop: 12 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Lời nhắn gửi chủ nhà (Tùy chọn)
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setNoteMessage(
                      'Chào anh/chị, em muốn đăng ký xem trực tiếp phòng vào khung giờ này để kiểm tra tiện nghi và ký cọc giữ chỗ ạ.'
                    )
                  }
                >
                  <Text style={{ fontSize: 11, color: '#085F56', fontWeight: '700' }}>
                    Gợi ý thân thiện
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.textAreaBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.textPrimary }]}
                  value={noteMessage}
                  onChangeText={setNoteMessage}
                  multiline
                  numberOfLines={3}
                  placeholder="Ghi chú thêm về nhu cầu xem phòng..."
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Guarantee Box: 100% Miễn phí */}
            <View style={[styles.guaranteeBox, { backgroundColor: isDark ? '#064E3B' : '#E6F4F1' }]}>
              <View style={styles.guaranteeIconWrap}>
                <Ionicons name="shield-checkmark" size={20} color="#085F56" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.guaranteeTitle}>
                  Cam kết bảo đảm trải nghiệm 100% miễn phí
                </Text>
                <Text style={styles.guaranteeText}>
                  TrọViet không thu bất kỳ khoản phí nào khi bạn xem phòng. Bạn hoàn toàn có thể hủy hoặc dời lịch hẹn thuận tiện trước 1 giờ mà không ảnh hưởng điểm uy tín.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Action */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Math.max(14, insets.bottom),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.88}
            >
              <Ionicons name="calendar" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>Xác Nhận Đặt Lịch Hẹn</Text>
            </TouchableOpacity>
            <Text style={[styles.confirmNotice, { color: colors.textSecondary }]}>
              Chủ nhà sẽ nhận thông báo tức thì và phản hồi trong khoảng 15 phút
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  stepperContainer: {
    marginBottom: 16,
  },
  stepperInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#085F56',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepSub: {
    fontWeight: '500',
    color: '#64748B',
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#085F56',
  },
  propertyCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  propertyThumbWrap: {
    width: 76,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  propertyThumb: {
    width: '100%',
    height: '100%',
  },
  approvedBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(8, 95, 86, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  approvedBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  landlordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  landlordName: {
    fontSize: 12,
    fontWeight: '700',
  },
  landlordTag: {
    backgroundColor: '#EDF5F3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  landlordTagText: {
    fontSize: 9,
    color: '#085F56',
    fontWeight: '700',
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  pricePeriod: {
    fontSize: 11,
    marginLeft: 3,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionRightHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionNotice: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  dateScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  dateCard: {
    width: 66,
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateDayOfWeek: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dateDayNum: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 1,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '800',
  },
  slotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  slotStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  verifiedWalletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedWalletText: {
    fontSize: 11,
    color: '#085F56',
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  textAreaBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textAreaInput: {
    fontSize: 13,
    lineHeight: 18,
    minHeight: 56,
  },
  guaranteeBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
    marginBottom: 10,
  },
  guaranteeIconWrap: {
    marginTop: 2,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#085F56',
    marginBottom: 4,
  },
  guaranteeText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#064E46',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  confirmBtn: {
    backgroundColor: '#085F56',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#085F56',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  confirmNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
});
