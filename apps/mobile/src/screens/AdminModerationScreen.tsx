import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ListingSummary, formatVND, formatArea } from '@troviet/shared';

export const AdminModerationScreen: React.FC = () => {
  const { colors } = useTheme();
  const { listings, moderateListing, setSelectedListing } = useApp();

  const pendingListings = listings.filter((l) => l.status === 'pending_review');

  const handleApprove = (listing: ListingSummary) => {
    moderateListing(listing.id, 'published');
    Alert.alert(
      'Đã duyệt tin thành công',
      `Tin "${listing.title}" đã được xuất bản và hiển thị ngay lập tức trên hệ thống tìm kiếm công khai.`
    );
  };

  const handleReject = (listing: ListingSummary) => {
    Alert.alert(
      'Từ chối tin đăng',
      `Bạn có chắc chắn muốn từ chối tin "${listing.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => moderateListing(listing.id, 'rejected'),
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.textPrimary }]}>
          Hàng đợi kiểm duyệt tin (Admin)
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.warning }]}>
          <Text style={styles.countText}>{pendingListings.length} tin chờ duyệt</Text>
        </View>
      </View>

      <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
        Kiểm tra độ chính xác của địa chỉ 2 cấp, minh bạch biểu phí và thông tin trước khi xuất bản.
      </Text>

      {pendingListings.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>✅</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Không có tin nào chờ duyệt
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Tất cả các tin đăng của chủ trọ đã được xử lý xong.
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
                📍 Địa chỉ: {item.houseNumber} {item.street}, {item.wardName}, TP. Đà Nẵng
              </Text>
              <Text style={[styles.detailLine, { color: colors.textPrimary }]}>
                💰 Giá thuê: <Text style={{ color: colors.primary, fontWeight: '800' }}>{formatVND(item.monthlyRent)}/tháng</Text> · Cọc: {formatVND(item.deposit)} · Diện tích: {formatArea(item.areaSquareMeters)}
              </Text>
              <Text style={[styles.detailLine, { color: colors.textSecondary }]}>
                ⚡ Điện: {formatVND(item.costs.electricityCostPerUnit)}/kWh · 💧 Nước: {formatVND(item.costs.waterCostPerUnit)}/người
              </Text>
            </View>

            {/* Action Buttons */}
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
                  onPress={() => handleReject(item)}
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Button
                  title="✓ Duyệt tin"
                  variant="primary"
                  onPress={() => handleApprove(item)}
                />
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  subHeading: {
    fontSize: 13,
    marginBottom: 16,
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
  },
  moderationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsBox: {
    borderRadius: 8,
    padding: 10,
    gap: 4,
    marginBottom: 12,
  },
  detailLine: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
