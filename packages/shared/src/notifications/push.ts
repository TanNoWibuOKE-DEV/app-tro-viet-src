/**
 * Trọ Việt - Offline Push Notifications & Event Payloads
 * Strictly adheres to SPEC Section 4, Rules, and Expo/APNs/FCM specifications.
 * Formats structured push messages for system lock screen / notification tray.
 */

export type PushNotificationCategory =
  | 'chat_message'
  | 'invoice_due'
  | 'invoice_paid'
  | 'contract_expiring'
  | 'scam_alert'
  | 'listing_moderated'
  | 'saved_search_match';

export interface ExpoPushMessage {
  to: string; // Expo push token e.g. "ExponentPushToken[xxxxxxxxxxxxxx]"
  title: string;
  body: string;
  data: {
    category: PushNotificationCategory;
    deepLink: string;
    entityId?: string;
    [key: string]: unknown;
  };
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: 'troviet-high' | 'troviet-default' | 'troviet-safety';
  badge?: number;
}

/**
 * Validates whether a token string is a valid Expo Push Token.
 */
export function isValidExpoPushToken(token: unknown): boolean {
  if (typeof token !== 'string') return false;
  const trimmed = token.trim();
  return (
    trimmed.startsWith('ExponentPushToken[') ||
    trimmed.startsWith('ExpoPushToken[') ||
    /^[a-z0-9-_]{20,}$/i.test(trimmed)
  );
}

/**
 * Android Notification Channels configuration for Trọ Việt.
 */
export const PUSH_CHANNELS = {
  SAFETY: {
    id: 'troviet-safety' as const,
    name: 'Cảnh báo an toàn & Lừa đảo',
    importance: 'high',
    sound: 'default',
  },
  HIGH: {
    id: 'troviet-high' as const,
    name: 'Tin nhắn & Lịch nhắc tiền phòng',
    importance: 'high',
    sound: 'default',
  },
  DEFAULT: {
    id: 'troviet-default' as const,
    name: 'Cập nhật tin đăng & Hợp đồng',
    importance: 'normal',
    sound: 'default',
  },
};

/**
 * Builds push notification for incoming chat messages.
 */
export function buildChatPushNotification(params: {
  pushToken: string;
  senderName: string;
  listingTitle: string;
  messageText: string;
  conversationId: string;
  badge?: number;
}): ExpoPushMessage {
  const truncatedText =
    params.messageText.length > 80
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
    channelId: PUSH_CHANNELS.HIGH.id,
    badge: params.badge ?? 1,
  };
}

/**
 * Builds push notification for invoice due reminders.
 */
export function buildInvoiceDuePushNotification(params: {
  pushToken: string;
  invoiceCode: string;
  amountVnd: number;
  dueDateStr: string;
  invoiceId: string;
  daysRemaining: number;
}): ExpoPushMessage {
  const formattedAmount = `${params.amountVnd.toLocaleString('vi-VN')} đ`;
  const timeText =
    params.daysRemaining <= 0
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
    channelId: PUSH_CHANNELS.HIGH.id,
  };
}

/**
 * Builds push notification for automated bank payment confirmation.
 */
export function buildPaymentConfirmedPushNotification(params: {
  pushToken: string;
  invoiceCode: string;
  amountVnd: number;
  invoiceId: string;
  isLandlord: boolean;
}): ExpoPushMessage {
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
    channelId: PUSH_CHANNELS.HIGH.id,
  };
}

/**
 * Builds push notification for contract expiry reminders.
 */
export function buildContractExpiringPushNotification(params: {
  pushToken: string;
  contractId: string;
  roomTitle: string;
  expiryDateStr: string;
  daysRemaining: number;
}): ExpoPushMessage {
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
    channelId: PUSH_CHANNELS.DEFAULT.id,
  };
}

/**
 * Builds high-priority push notification for anti-scam warnings.
 */
export function buildScamAlertPushNotification(params: {
  pushToken: string;
  warningMessage: string;
  conversationId?: string;
}): ExpoPushMessage {
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
    channelId: PUSH_CHANNELS.SAFETY.id,
  };
}
