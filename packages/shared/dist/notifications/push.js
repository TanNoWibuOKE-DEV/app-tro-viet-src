"use strict";
/**
 * Trọ Việt - Offline Push Notifications & Event Payloads
 * Strictly adheres to SPEC Section 4, Rules, and Expo/APNs/FCM specifications.
 * Formats structured push messages for system lock screen / notification tray.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUSH_CHANNELS = void 0;
exports.isValidExpoPushToken = isValidExpoPushToken;
exports.buildChatPushNotification = buildChatPushNotification;
exports.buildInvoiceDuePushNotification = buildInvoiceDuePushNotification;
exports.buildPaymentConfirmedPushNotification = buildPaymentConfirmedPushNotification;
exports.buildContractExpiringPushNotification = buildContractExpiringPushNotification;
exports.buildScamAlertPushNotification = buildScamAlertPushNotification;
/**
 * Validates whether a token string is a valid Expo Push Token.
 */
function isValidExpoPushToken(token) {
    if (typeof token !== 'string')
        return false;
    const trimmed = token.trim();
    return (trimmed.startsWith('ExponentPushToken[') ||
        trimmed.startsWith('ExpoPushToken[') ||
        /^[a-z0-9-_]{20,}$/i.test(trimmed));
}
/**
 * Android Notification Channels configuration for Trọ Việt.
 */
exports.PUSH_CHANNELS = {
    SAFETY: {
        id: 'troviet-safety',
        name: 'Cảnh báo an toàn & Lừa đảo',
        importance: 'high',
        sound: 'default',
    },
    HIGH: {
        id: 'troviet-high',
        name: 'Tin nhắn & Lịch nhắc tiền phòng',
        importance: 'high',
        sound: 'default',
    },
    DEFAULT: {
        id: 'troviet-default',
        name: 'Cập nhật tin đăng & Hợp đồng',
        importance: 'normal',
        sound: 'default',
    },
};
/**
 * Builds push notification for incoming chat messages.
 */
function buildChatPushNotification(params) {
    const truncatedText = params.messageText.length > 80
        ? `${params.messageText.substring(0, 77)}...`
        : params.messageText;
    return {
        to: params.pushToken,
        title: `💬 ${params.senderName} (${params.listingTitle})`,
        body: truncatedText,
        data: {
            category: 'chat_message',
            deepLink: `troviet://chat/${params.conversationId}`,
            entityId: params.conversationId,
        },
        sound: 'default',
        priority: 'high',
        channelId: exports.PUSH_CHANNELS.HIGH.id,
        badge: params.badge ?? 1,
    };
}
/**
 * Builds push notification for invoice due reminders.
 */
function buildInvoiceDuePushNotification(params) {
    const formattedAmount = `${params.amountVnd.toLocaleString('vi-VN')} đ`;
    const timeText = params.daysRemaining <= 0
        ? 'HÔM NAY là hạn chót'
        : `còn ${params.daysRemaining} ngày (hạn ${params.dueDateStr})`;
    return {
        to: params.pushToken,
        title: `⚡ Nhắc thanh toán tiền phòng (${params.invoiceCode})`,
        body: `Hóa đơn số tiền ${formattedAmount} ${timeText}. Chạm để quét VietQR thanh toán nhanh.`,
        data: {
            category: 'invoice_due',
            deepLink: `troviet://invoice/${params.invoiceId}`,
            entityId: params.invoiceId,
        },
        sound: 'default',
        priority: 'high',
        channelId: exports.PUSH_CHANNELS.HIGH.id,
    };
}
/**
 * Builds push notification for automated bank payment confirmation.
 */
function buildPaymentConfirmedPushNotification(params) {
    const formattedAmount = `${params.amountVnd.toLocaleString('vi-VN')} đ`;
    const title = params.isLandlord
        ? `💰 Tiền phòng đã về tài khoản (${params.invoiceCode})`
        : `✅ Thanh toán tiền phòng thành công (${params.invoiceCode})`;
    const body = params.isLandlord
        ? `Khách thuê đã chuyển khoản thành công ${formattedAmount}. Hóa đơn đã được tự động gạch nợ.`
        : `Đã xác nhận chuyển khoản ${formattedAmount} qua VietQR. Cảm ơn bạn đã đóng tiền phòng đúng hạn.`;
    return {
        to: params.pushToken,
        title,
        body,
        data: {
            category: 'invoice_paid',
            deepLink: `troviet://invoice/${params.invoiceId}`,
            entityId: params.invoiceId,
        },
        sound: 'default',
        priority: 'high',
        channelId: exports.PUSH_CHANNELS.HIGH.id,
    };
}
/**
 * Builds push notification for contract expiry reminders.
 */
function buildContractExpiringPushNotification(params) {
    return {
        to: params.pushToken,
        title: `📋 Hợp đồng thuê sắp hết hạn (${params.roomTitle})`,
        body: `Hợp đồng sẽ hết hiệu lực sau ${params.daysRemaining} ngày (ngày ${params.expiryDateStr}). Chạm để gia hạn hoặc chuẩn bị bàn giao phòng.`,
        data: {
            category: 'contract_expiring',
            deepLink: `troviet://contract/${params.contractId}`,
            entityId: params.contractId,
        },
        sound: 'default',
        priority: 'normal',
        channelId: exports.PUSH_CHANNELS.DEFAULT.id,
    };
}
/**
 * Builds high-priority push notification for anti-scam warnings.
 */
function buildScamAlertPushNotification(params) {
    return {
        to: params.pushToken,
        title: '🚨 CẢNH BÁO AN TOÀN TRỌ VIỆT',
        body: params.warningMessage,
        data: {
            category: 'scam_alert',
            deepLink: params.conversationId ? `troviet://chat/${params.conversationId}` : 'troviet://home',
            entityId: params.conversationId,
        },
        sound: 'default',
        priority: 'high',
        channelId: exports.PUSH_CHANNELS.SAFETY.id,
    };
}
