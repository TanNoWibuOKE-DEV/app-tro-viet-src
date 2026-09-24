import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ListingSummary, formatVND, formatArea, Report } from '@troviet/shared';

export const AdminModerationScreen: React.FC = () => {
  const { colors } = useTheme();
  const {
    listings,
    moderateListing,
    setSelectedListing,
    verificationRequests,
    moderateL2Verification,
    l3VerificationRequests,
    moderateL3Verification,
    reports,
    resolveReport,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'verifications' | 'l3' | 'reports'>('listings');
  const [auditLogs, setAuditLogs] = useState<string[]>([
    'Hệ thống khởi tạo kiểm soát bảo mật RLS và Audit Log',
  ]);

  const pendingListings = listings.filter((l) => l.status === 'pending_review');
  const pendingVerifications = verificationRequests.filter((v) => v.status === 'pending');
  const pendingL3Verifications = l3VerificationRequests.filter((v) => v.status === 'pending');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const addAuditLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setAuditLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const handleApproveListing = (listing: ListingSummary) => {
    moderateListing(listing.id, 'published');
    addAuditLog(`Phê duyệt tin đăng #${listing.id}: "${listing.title}"`);
    Alert.alert(
      'Đã duyệt tin thành công',
      `Tin "${listing.title}" đã được xuất bản và hiển thị ngay lập tức trên hệ thống tìm kiếm công khai.`
    );
  };

  const handleRejectListing = (listing: ListingSummary) => {
    moderateListing(listing.id, 'rejected');
    addAuditLog(`Từ chối tin đăng #${listing.id}: "${listing.title}"`);
    Alert.alert('Đã từ chối tin', `Tin "${listing.title}" đã bị từ chối.`);
  };

  const handleApproveVerification = (id: string, name: string) => {
    moderateL2Verification(id, 'approved');
    addAuditLog(`Phê duyệt danh tính Cấp L2 cho chủ trọ: ${name}`);
    Alert.alert(
      'Đã phê duyệt L2',
      `Chủ nhà ${name} đã được cấp huy hiệu "✓ Danh tính đã xác minh" (L2) trên toàn bộ tin đăng.`
    );
  };

  const handleResolveReport = (report: Report) => {
    resolveReport(report.id, 'Đã xác minh vi phạm và áp dụng chế tài cảnh cáo/gỡ tin.', 'resolved');
    addAuditLog(`Xử lý vi phạm báo cáo #${report.id} (${report.reasonCategory}): "${report.targetTitle}"`);
    Alert.alert('Đã xử lý vi phạm', `Đã áp dụng chế tài xử lý cho đối tượng: ${report.targetTitle}`);
  };

  const handleDismissReport = (report: Report) => {
    resolveReport(report.id, 'Báo cáo không đủ căn cứ sau khi thẩm định.', 'dismissed');
    addAuditLog(`Bỏ qua báo cáo #${report.id} do không đủ căn cứ.`);
    Alert.alert('Đã bỏ qua báo cáo', 'Báo cáo đã được đánh dấu là không vi phạm.');
  };

  const getReasonLabel = (cat: string) => {
    switch (cat) {
      case 'deposit_scam':
        return '🚨 Lừa đảo tiền cọc';
      case 'fake_listing':
        return '⚠️ Phòng ảo / Ảnh giả';
      case 'wrong_price':
        return '💸 Báo giá sai lệch';
      case 'inappropriate_behavior':
        return '⛔ Hành vi bất lịch sự';
      default:
        return '❓ Vi phạm khác';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.textPrimary }]}>
          Quản trị & Kiểm duyệt
        </Text>
      </View>

      {/* Switcher Tab */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'listings' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('listings')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'listings' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            Tin ({pendingListings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'verifications' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('verifications')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'verifications' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            L2 CCCD ({pendingVerifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'l3' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('l3')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'l3' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            L3 Sổ đỏ ({pendingL3Verifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'reports' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('reports')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'reports' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            Báo cáo ({pendingReports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Listings Queue */}
      {activeTab === 'listings' && (
        <View>
          {pendingListings.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>✅</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Không có tin nào chờ duyệt
              </Text>
            </View>
          ) : (
            pendingListings.map((item) => (
              <View
                key={item.id}
                style={[styles.moderationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTop}>
                  <Badge level={item.landlordVerificationLevel} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    Gửi lúc: {new Date(item.createdAt).toLocaleTimeString('vi-VN')}
                  </Text>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>

                <View style={[styles.detailsBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    👤 Chủ trọ: <Text style={{ fontWeight: '700' }}>{item.landlordName}</Text>
                  </Text>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    📍 Địa chỉ 2 cấp: {item.houseNumber} {item.street}, {item.wardName}, TP. Đà Nẵng
                  </Text>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    💰 Giá thuê: <Text style={{ color: colors.primary, fontWeight: '800' }}>{formatVND(item.monthlyRent)}/tháng</Text> · Cọc: {formatVND(item.deposit)} · Diện tích: {formatArea(item.areaSquareMeters)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Button
                      title="👁️ Xem chi tiết"
                      variant="secondary"
                      onPress={() => setSelectedListing(item)}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Button
                      title="✕ Từ chối"
                      variant="outline"
                      onPress={() => handleRejectListing(item)}
                    />
                  </View>
                  <View style={{ flex: 1.2 }}>
                    <Button
                      title="✓ Duyệt tin"
                      variant="primary"
                      onPress={() => handleApproveListing(item)}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab 2: Landlord L2 Verifications Queue */}
      {activeTab === 'verifications' && (
        <View>
          {pendingVerifications.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🛡️</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Không có hồ sơ xác minh nào chờ xử lý
              </Text>
            </View>
          ) : (
            pendingVerifications.map((req) => (
              <View
                key={req.id}
                style={[styles.moderationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Yêu cầu cấp L2: {req.userName}
                </Text>

                <View style={[styles.detailsBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    Họ tên CCCD: <Text style={{ fontWeight: '700' }}>{req.realName}</Text>
                  </Text>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    Số CCCD: <Text style={{ fontWeight: '700' }}>{req.cccdNumber}</Text>
                  </Text>
                  <Text style={[styles.detailLine, { color: colors.textSecondary }]}>
                    Ảnh giấy tờ: 2 mặt đã đối chiếu khớp dữ liệu dân cư.
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Button
                      title="✕ Từ chối"
                      variant="outline"
                      onPress={() => moderateL2Verification(req.id, 'rejected')}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Button
                      title="✓ Duyệt cấp L2"
                      variant="primary"
                      onPress={() => handleApproveVerification(req.id, req.userName)}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab: Landlord L3 Property Ownership Verifications (Phase 5) */}
      {activeTab === 'l3' && (
        <View>
          {pendingL3Verifications.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📜</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Không có hồ sơ xác minh chính chủ L3 nào chờ xử lý
              </Text>
            </View>
          ) : (
            pendingL3Verifications.map((req) => (
              <View
                key={req.id}
                style={[styles.moderationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTop}>
                  <Badge level="L3" />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    Hồ sơ L3: Giấy tờ chính chủ BĐS
                  </Text>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Chủ trọ: {req.userName} ({req.userPhone})
                </Text>

                <View style={[styles.detailsBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    🏠 Bất động sản: <Text style={{ fontWeight: '700' }}>{req.propertyTitle || 'Chưa gắn phòng cụ thể'}</Text>
                  </Text>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    📑 Loại tài liệu: <Text style={{ fontWeight: '700' }}>
                      {req.documentType === 'land_ownership_certificate' ? 'Sổ đỏ / QSDĐ chính chủ' : 'Hợp đồng ủy quyền cho thuê'}
                    </Text>
                  </Text>
                  {req.notes && (
                    <Text style={[styles.detailLine, { color: colors.textSecondary }]}>
                      📝 Ghi chú: {req.notes}
                    </Text>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Button
                      title="✕ Từ chối"
                      variant="outline"
                      onPress={() => {
                        moderateL3Verification(req.id, 'rejected', 'Giấy tờ không đủ điều kiện pháp lý.');
                        addAuditLog(`Từ chối hồ sơ L3 của chủ nhà ${req.userName}`);
                        Alert.alert('Đã từ chối', `Hồ sơ L3 của ${req.userName} đã bị từ chối.`);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Button
                      title="✓ Duyệt cấp L3"
                      variant="primary"
                      onPress={() => {
                        moderateL3Verification(req.id, 'approved');
                        addAuditLog(`Phê duyệt cấp L3 (Chính chủ BĐS) cho ${req.userName}`);
                        Alert.alert(
                          'Đã phê duyệt cấp L3 🎖️',
                          `Chủ nhà ${req.userName} và tin đăng đã được cấp huy hiệu "Xác minh L3 - Chính chủ bất động sản".`
                        );
                      }}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab: Reports Queue (Phase 3) */}
      {activeTab === 'reports' && (
        <View>
          {pendingReports.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>⚖️</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Không có báo cáo vi phạm nào tồn đọng
              </Text>
            </View>
          ) : (
            pendingReports.map((rep) => (
              <View
                key={rep.id}
                style={[styles.moderationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.reasonBadge, { backgroundColor: colors.error }]}>
                    <Text style={styles.reasonBadgeText}>{getReasonLabel(rep.reasonCategory)}</Text>
                  </View>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {new Date(rep.createdAt).toLocaleTimeString('vi-VN')}
                  </Text>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Mục bị báo cáo: {rep.targetTitle}
                </Text>

                <View style={[styles.detailsBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    👤 Người báo cáo: <Text style={{ fontWeight: '700' }}>{rep.reporterName}</Text>
                  </Text>
                  <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                    📝 Nội dung phản ánh: {rep.details}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Button
                      title="✕ Bỏ qua"
                      variant="outline"
                      onPress={() => handleDismissReport(rep)}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Button
                      title="✓ Xử lý vi phạm"
                      variant="primary"
                      onPress={() => handleResolveReport(rep)}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Audit Log Box */}
      <View style={[styles.auditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.auditTitle, { color: colors.textPrimary }]}>
          📝 Nhật ký kiểm duyệt (Audit Log)
        </Text>
        {auditLogs.slice(0, 6).map((log, index) => (
          <Text key={index} style={[styles.logText, { color: colors.textSecondary }]}>
            • {log}
          </Text>
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
  headerRow: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  moderationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reasonBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  detailsBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailLine: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auditCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
});
