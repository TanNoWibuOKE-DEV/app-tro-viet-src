import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidExpoPushToken,
  buildChatPushNotification,
  buildInvoiceDuePushNotification,
  buildPaymentConfirmedPushNotification,
  buildContractExpiringPushNotification,
  buildScamAlertPushNotification,
  PUSH_CHANNELS,
} from '../src/notifications/push.js';

describe('Phase 9 Offline Push Notifications & Event Payloads', () => {
  it('validates Expo Push Tokens correctly', () => {
    assert.equal(isValidExpoPushToken('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'), true);
    assert.equal(isValidExpoPushToken('ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]'), true);
    assert.equal(isValidExpoPushToken('abc123def456ghi789jkl012'), true);
    assert.equal(isValidExpoPushToken('short_invalid_token'), false);
    assert.equal(isValidExpoPushToken(null), false);
    assert.equal(isValidExpoPushToken(12345), false);
  });

  it('builds chat message push notification with deep link and sound', () => {
    const push = buildChatPushNotification({
      pushToken: 'ExponentPushToken[chat-tenant-token]',
      senderName: 'Anh Hùng (Chủ trọ)',
      listingTitle: 'Phòng studio Hải Châu 1',
      messageText: 'Chào em, chiều nay 17h qua xem phòng được nhé.',
      conversationId: 'conv-456',
    });

    assert.equal(push.to, 'ExponentPushToken[chat-tenant-token]');
    assert.ok(push.title.includes('Anh Hùng'));
    assert.equal(push.body, 'Chào em, chiều nay 17h qua xem phòng được nhé.');
    assert.equal(push.data.category, 'chat_message');
    assert.equal(push.data.deepLink, 'troviet://chat/conv-456');
    assert.equal(push.priority, 'high');
    assert.equal(push.channelId, PUSH_CHANNELS.HIGH.id);
  });

  it('truncates long message text in chat push notification', () => {
    const longMsg = 'Đây là tin nhắn rất dài của chủ trọ giải thích chi tiết về việc phòng đã có trang bị đầy đủ máy giặt điều hòa nóng lạnh ban công thoáng mát và an ninh đảm bảo 24/7.';
    const push = buildChatPushNotification({
      pushToken: 'ExponentPushToken[token]',
      senderName: 'Chủ trọ',
      listingTitle: 'Phòng',
      messageText: longMsg,
      conversationId: 'conv-1',
    });

    assert.ok(push.body.length <= 80);
    assert.ok(push.body.endsWith('...'));
  });

  it('builds invoice due reminder push notification with formatted VND', () => {
    const push = buildInvoiceDuePushNotification({
      pushToken: 'ExponentPushToken[token]',
      invoiceCode: 'TRV-202610-01',
      amountVnd: 3250000,
      dueDateStr: '05/10/2026',
      invoiceId: 'inv-99',
      daysRemaining: 3,
    });

    assert.ok(push.title.includes('TRV-202610-01'));
    assert.ok(push.body.includes('3.250.000 đ'));
    assert.ok(push.body.includes('còn 3 ngày'));
    assert.equal(push.data.deepLink, 'troviet://invoice/inv-99');
  });

  it('builds payment confirmed push notification differently for landlord and tenant', () => {
    const tenantPush = buildPaymentConfirmedPushNotification({
      pushToken: 'ExponentPushToken[tenant]',
      invoiceCode: 'TRV-202610-01',
      amountVnd: 3250000,
      invoiceId: 'inv-99',
      isLandlord: false,
    });
    assert.ok(tenantPush.title.includes('Thanh toán tiền phòng thành công'));
    assert.ok(tenantPush.body.includes('Cảm ơn bạn đã đóng tiền phòng'));

    const landlordPush = buildPaymentConfirmedPushNotification({
      pushToken: 'ExponentPushToken[landlord]',
      invoiceCode: 'TRV-202610-01',
      amountVnd: 3250000,
      invoiceId: 'inv-99',
      isLandlord: true,
    });
    assert.ok(landlordPush.title.includes('Tiền phòng đã về tài khoản'));
    assert.ok(landlordPush.body.includes('Khách thuê đã chuyển khoản thành công'));
  });

  it('builds high-urgency anti-scam warning push notification with safety channel', () => {
    const push = buildScamAlertPushNotification({
      pushToken: 'ExponentPushToken[user]',
      warningMessage: 'Phát hiện yêu cầu chuyển cọc giữ chỗ trước khi xem phòng thực tế. Tuyệt đối không chuyển tiền!',
      conversationId: 'conv-scam-12',
    });

    assert.ok(push.title.includes('CẢNH BÁO AN TOÀN'));
    assert.equal(push.channelId, PUSH_CHANNELS.SAFETY.id);
    assert.equal(push.data.category, 'scam_alert');
    assert.equal(push.data.deepLink, 'troviet://chat/conv-scam-12');
  });

  it('builds contract expiry push notification', () => {
    const push = buildContractExpiringPushNotification({
      pushToken: 'ExponentPushToken[tenant]',
      contractId: 'ctr-01',
      roomTitle: 'Phòng 201 - Nhà Trọ Xanh',
      expiryDateStr: '30/11/2026',
      daysRemaining: 30,
    });

    assert.ok(push.title.includes('Hợp đồng thuê sắp hết hạn'));
    assert.ok(push.body.includes('sau 30 ngày'));
    assert.equal(push.data.deepLink, 'troviet://contract/ctr-01');
  });
});
