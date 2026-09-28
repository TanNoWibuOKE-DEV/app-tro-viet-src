/**
 * Trọ Việt - Offline Push Notifications & Event Payloads
 * Strictly adheres to SPEC Section 4, Rules, and Expo/APNs/FCM specifications.
 * Formats structured push messages for system lock screen / notification tray.
 */
export type PushNotificationCategory = 'chat_message' | 'invoice_due' | 'invoice_paid' | 'contract_expiring' | 'scam_alert' | 'listing_moderated' | 'saved_search_match';
export interface ExpoPushMessage {
    to: string;
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
export declare function isValidExpoPushToken(token: unknown): boolean;
/**
 * Android Notification Channels configuration for Trọ Việt.
 */
export declare const PUSH_CHANNELS: {
    SAFETY: {
        id: "troviet-safety";
        name: string;
        importance: string;
        sound: string;
    };
    HIGH: {
        id: "troviet-high";
        name: string;
        importance: string;
        sound: string;
    };
    DEFAULT: {
        id: "troviet-default";
        name: string;
        importance: string;
        sound: string;
    };
};
/**
 * Builds push notification for incoming chat messages.
 */
export declare function buildChatPushNotification(params: {
    pushToken: string;
    senderName: string;
    listingTitle: string;
    messageText: string;
    conversationId: string;
    badge?: number;
}): ExpoPushMessage;
/**
 * Builds push notification for invoice due reminders.
 */
export declare function buildInvoiceDuePushNotification(params: {
    pushToken: string;
    invoiceCode: string;
    amountVnd: number;
    dueDateStr: string;
    invoiceId: string;
    daysRemaining: number;
}): ExpoPushMessage;
/**
 * Builds push notification for automated bank payment confirmation.
 */
export declare function buildPaymentConfirmedPushNotification(params: {
    pushToken: string;
    invoiceCode: string;
    amountVnd: number;
    invoiceId: string;
    isLandlord: boolean;
}): ExpoPushMessage;
/**
 * Builds push notification for contract expiry reminders.
 */
export declare function buildContractExpiringPushNotification(params: {
    pushToken: string;
    contractId: string;
    roomTitle: string;
    expiryDateStr: string;
    daysRemaining: number;
}): ExpoPushMessage;
/**
 * Builds high-priority push notification for anti-scam warnings.
 */
export declare function buildScamAlertPushNotification(params: {
    pushToken: string;
    warningMessage: string;
    conversationId?: string;
}): ExpoPushMessage;
