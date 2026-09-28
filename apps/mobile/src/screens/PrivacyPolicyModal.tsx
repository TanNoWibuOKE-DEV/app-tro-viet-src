import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { CURRENT_PRIVACY_POLICY_VERSION } from '@troviet/shared';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Chính sách Quyền riêng tư
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Badge & Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.mainHeading, { color: colors.textPrimary }]}>
              Chính sách Bảo vệ Dữ liệu Cá nhân Trọ Việt
            </Text>
            <Text style={[styles.subMeta, { color: colors.textSecondary }]}>
              Phiên bản: {CURRENT_PRIVACY_POLICY_VERSION} • Căn cứ Luật số 91/2025/QH15
            </Text>
          </View>

          <View style={[styles.highlightBox, { backgroundColor: isDark ? '#1a2e22' : '#ecfdf5', borderColor: colors.primary }]}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🛡️</Text>
            <Text style={[styles.highlightText, { color: isDark ? '#a7f3d0' : '#065f46' }]}>
              Trọ Việt tôn trọng tối đa quyền riêng tư của bạn. Chúng tôi chỉ thu thập dữ liệu tối thiểu cần thiết để giúp bạn tìm trọ an toàn và ngăn chặn gian lận tiền cọc.
            </Text>
          </View>

          {/* Section 1 */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            1. Dữ liệu cá nhân chúng tôi thu thập
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Thông tin tài khoản:</Text> Số điện thoại (xác thực OTP), họ tên hiển thị, địa chỉ email (nếu cung cấp).{'\n'}
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Dữ liệu xác minh (dành riêng cho chủ trọ L2):</Text> Số Căn cước công dân và ảnh chụp đối chiếu dữ liệu để cấp huy hiệu uy tín.{'\n'}
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Dữ liệu tương tác:</Text> Lịch sử tin nhắn trao đổi với chủ trọ, đánh giá phòng trọ, danh sách phòng đã lưu và báo cáo vi phạm.
          </Text>

          {/* Section 2 */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            2. Mục đích xử lý dữ liệu
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            - Cung cấp dịch vụ kết nối người tìm phòng và chủ trọ minh bạch chi phí.{'\n'}
            - Bảo vệ an toàn cộng đồng: Quét phát hiện tin giả, kiểm tra giá bất thường và cảnh báo sớm các thủ đoạn yêu cầu chuyển tiền cọc đáng ngờ.{'\n'}
            - Thực hiện nghĩa vụ báo cáo và kiểm duyệt theo quy định pháp luật Việt Nam.
          </Text>

          {/* Section 3 */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            3. Quyền của bạn đối với dữ liệu cá nhân
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, bạn có đầy đủ các quyền:{'\n'}
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Quyền được biết & truy cập:</Text> Xem chi tiết dữ liệu chúng tôi lưu trữ tại màn hình "Quyền dữ liệu của tôi".{'\n'}
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Quyền xuất dữ liệu:</Text> Tải về bản sao dữ liệu cá nhân định dạng JSON bất kỳ lúc nào.{'\n'}
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Quyền xóa & ẩn danh hóa:</Text> Yêu cầu xóa vĩnh viễn thông tin cá nhân và tài khoản khỏi hệ thống.{'\n'}
            - <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Quyền rút lại sự đồng ý:</Text> Điều chỉnh các mục đồng ý nhận thông báo hoặc thống kê trải nghiệm.
          </Text>

          {/* Section 4 */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            4. Cam kết bảo mật & Lưu trữ
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            - Chúng tôi tuyệt đối <Text style={{ fontWeight: '700', color: colors.textPrimary }}>KHÔNG bán</Text> hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba nhằm mục đích quảng cáo rác.{'\n'}
            - Số điện thoại chủ trọ chỉ hiển thị cho người dùng đã đăng nhập để ngăn chặn hành vi tự động thu thập (scraping).{'\n'}
            - Dữ liệu được mã hóa khi truyền tải (HTTPS/TLS) và bảo vệ bằng chính sách phân quyền Row Level Security (RLS) chặt chẽ trên cơ sở dữ liệu.
          </Text>

          <View style={styles.footerNote}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Mọi thắc mắc hoặc yêu cầu hỗ trợ về quyền riêng tư, vui lòng liên hệ Ban Quản trị Trọ Việt qua email: privacy@troviet.vn
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 10,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  subMeta: {
    fontSize: 12,
  },
  highlightBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 8,
  },
  footerNote: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
