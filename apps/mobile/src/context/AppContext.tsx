import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  UserProfile,
  ListingSummary,
  UserPreferences,
  SearchFilterParams,
  MOCK_LISTINGS,
  UserRole,
  Conversation,
  ChatMessage,
  Review,
  Report,
  ReportCategory,
  ReportTargetType,
  AppNotification,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_REVIEWS,
  MOCK_REPORTS,
  MOCK_NOTIFICATIONS,
  analyzeChatMessageForRisks,
  checkReviewEligibility,
} from '@troviet/shared';

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  cccdNumber: string;
  realName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  userPreferences: UserPreferences | null;
  setUserPreferences: (prefs: UserPreferences | null) => void;
  listings: ListingSummary[];
  searchFilter: SearchFilterParams;
  setSearchFilter: React.Dispatch<React.SetStateAction<SearchFilterParams>>;
  selectedListing: ListingSummary | null;
  setSelectedListing: (listing: ListingSummary | null) => void;
  createListing: (newListing: Omit<ListingSummary, 'id' | 'createdAt' | 'status'>) => void;
  moderateListing: (listingId: string, status: 'published' | 'rejected', reason?: string) => void;
  mockLoginAs: (role: UserRole) => void;

  // Favorites & Offline
  favoriteIds: string[];
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;

  // Comparison
  comparisonIds: string[];
  toggleComparison: (listingId: string) => void;
  isComparing: (listingId: string) => boolean;
  clearComparison: () => void;

  // L2 Verification
  verificationRequests: VerificationRequest[];
  submitL2Verification: (cccdNumber: string, realName: string) => void;
  moderateL2Verification: (requestId: string, status: 'approved' | 'rejected') => void;

  // Phase 3: Realtime Chat
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  openChatWithLandlord: (listing: ListingSummary) => string;
  sendMessage: (conversationId: string, text: string) => void;

  // Phase 3: Controlled Reviews
  reviews: Review[];
  submitReview: (listingId: string, rating: number, content: string) => { success: boolean; reason?: string };
  replyToReview: (reviewId: string, response: string) => void;
  canUserReviewListing: (listing: ListingSummary) => { canReview: boolean; reason?: string };

  // Phase 3: Reports & Moderation
  reports: Report[];
  submitReport: (
    targetType: ReportTargetType,
    targetId: string,
    targetTitle: string,
    reasonCategory: ReportCategory,
    details: string
  ) => void;
  resolveReport: (reportId: string, resolutionNotes: string, action: 'resolved' | 'dismissed') => void;

  // Phase 3: Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: 'u-tenant-1',
  phoneNumber: '0905123456',
  email: 'nguoidung@troviet.vn',
  fullName: 'Nguyễn Văn An (Người tìm trọ)',
  avatarUrl: null,
  role: 'tenant',
  verificationLevel: 'L1',
  createdAt: '2026-09-01T00:00:00Z',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>(MOCK_LISTINGS);
  const [searchFilter, setSearchFilter] = useState<SearchFilterParams>({ sortBy: 'newest' });
  const [selectedListing, setSelectedListing] = useState<ListingSummary | null>(null);

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['l-001']);

  // Comparison
  const [comparisonIds, setComparisonIds] = useState<string[]>(['l-001', 'l-002']);

  // L2 Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([
    {
      id: 'v-001',
      userId: 'u-landlord-1',
      userName: 'Cô Lan (Chủ nhà)',
      cccdNumber: '048185001234',
      realName: 'Nguyễn Thị Lan',
      submittedAt: '2026-09-24T05:00:00Z',
      status: 'pending',
    },
  ]);

  // Phase 3: Chat State
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Phase 3: Reviews State
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);

  // Phase 3: Reports State
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);

  // Phase 3: Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const toggleComparison = (id: string) => {
    setComparisonIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], id]; // keep max 3
      }
      return [...prev, id];
    });
  };

  const isComparing = (id: string) => comparisonIds.includes(id);
  const clearComparison = () => setComparisonIds([]);

  const submitL2Verification = (cccdNumber: string, realName: string) => {
    const newReq: VerificationRequest = {
      id: `v-${Date.now()}`,
      userId: currentUser?.id || 'u-unknown',
      userName: currentUser?.fullName || 'Chủ trọ',
      cccdNumber,
      realName,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setVerificationRequests((prev) => [newReq, ...prev]);
  };

  const moderateL2Verification = (requestId: string, status: 'approved' | 'rejected') => {
    setVerificationRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status } : req))
    );

    const targetReq = verificationRequests.find((r) => r.id === requestId);
    if (targetReq && status === 'approved') {
      setListings((prev) =>
        prev.map((l) =>
          l.landlordId === targetReq.userId
            ? { ...l, landlordVerificationLevel: 'L2' }
            : l
        )
      );
      if (currentUser?.id === targetReq.userId) {
        setCurrentUser((prev) => (prev ? { ...prev, verificationLevel: 'L2' } : null));
      }
    }
  };

  const mockLoginAs = (role: UserRole) => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'u-admin-1',
        phoneNumber: '0905999888',
        email: 'admin@troviet.vn',
        fullName: 'Quản trị viên Trọ Việt',
        avatarUrl: null,
        role: 'admin',
        verificationLevel: 'L3',
        createdAt: '2026-08-01T00:00:00Z',
      });
    } else if (role === 'landlord') {
      setCurrentUser({
        id: 'u-landlord-1',
        phoneNumber: '0905666777',
        email: 'chutro@troviet.vn',
        fullName: 'Cô Lan (Chủ nhà)',
        avatarUrl: null,
        role: 'landlord',
        verificationLevel: 'L2',
        createdAt: '2026-08-15T00:00:00Z',
      });
    } else {
      setCurrentUser(DEFAULT_USER);
    }
  };

  const createListing = (newListingData: Omit<ListingSummary, 'id' | 'createdAt' | 'status'>) => {
    const newId = `l-${Date.now()}`;
    const newListing: ListingSummary = {
      ...newListingData,
      id: newId,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
  };

  const moderateListing = (listingId: string, status: 'published' | 'rejected') => {
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, status } : item))
    );
  };

  // Phase 3: Open or create chat conversation
  const openChatWithLandlord = (listing: ListingSummary): string => {
    const userId = currentUser?.id || 'u-tenant-1';
    const userName = currentUser?.fullName || 'Người thuê';

    // Find existing conversation between this user and landlord regarding this listing
    const existing = conversations.find(
      (c) =>
        c.listingId === listing.id &&
        ((c.tenantId === userId && c.landlordId === listing.landlordId) ||
          (c.landlordId === userId && c.tenantId === listing.landlordId))
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const newId = `c-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      listingId: listing.id,
      listingTitle: listing.title,
      tenantId: userId,
      tenantName: userName,
      landlordId: listing.landlordId,
      landlordName: listing.landlordName,
      lastMessagePreview: `Xin chào! Tôi quan tâm đến tin: ${listing.title}`,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const firstMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: newId,
      senderId: userId,
      senderName: userName,
      content: `Dạ em chào anh/chị, em quan tâm đến phòng trọ: "${listing.title}". Phòng này hiện còn trống không ạ?`,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newId]: [firstMsg],
    }));
    setActiveConversationId(newId);
    return newId;
  };

  // Phase 3: Send message with anti-scam risk detection
  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const userId = currentUser?.id || 'u-tenant-1';
    const userName = currentUser?.fullName || 'Người dùng';

    // Check anti-scam risks
    const riskAnalysis = analyzeChatMessageForRisks(text);

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: userId,
      senderName: userName,
      content: text.trim(),
      isRead: true,
      createdAt: new Date().toISOString(),
      detectedRisks: riskAnalysis.hasRisk ? riskAnalysis.detectedKeywords : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    // Update conversation last message preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessagePreview: text.trim(),
              lastMessageAt: new Date().toISOString(),
            }
          : c
      )
    );

    // If risky keywords detected, generate safety notification alert
    if (riskAnalysis.hasRisk) {
      const alertNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId,
        title: 'Cảnh báo an toàn Trọ Việt',
        body:
          riskAnalysis.warningMessage ||
          'Tin nhắn có chứa từ khóa nhạy cảm. Tuyệt đối không chuyển tiền cọc khi chưa xem phòng thực tế.',
        type: 'anti_scam_warning',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }
  };

  // Phase 3: Controlled Reviews
  const canUserReviewListing = (listing: ListingSummary): { canReview: boolean; reason?: string } => {
    const userId = currentUser?.id || 'u-tenant-1';
    const landlordId = listing.landlordId;

    // Has user chatted with landlord about this listing?
    const hasChat = conversations.some(
      (c) =>
        c.listingId === listing.id &&
        ((c.tenantId === userId && c.landlordId === landlordId) ||
          (c.landlordId === userId && c.tenantId === landlordId))
    );

    return checkReviewEligibility(userId, landlordId, hasChat);
  };

  const submitReview = (
    listingId: string,
    rating: number,
    content: string
  ): { success: boolean; reason?: string } => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, reason: 'Không tìm thấy phòng trọ.' };

    const eligibility = canUserReviewListing(listing);
    if (!eligibility.canReview) {
      return { success: false, reason: eligibility.reason };
    }

    const userId = currentUser?.id || 'u-tenant-1';
    const userName = currentUser?.fullName || 'Người thuê';

    const newReview: Review = {
      id: `r-${Date.now()}`,
      listingId,
      tenantId: userId,
      tenantName: `${userName} [MẪU - DEV]`,
      rating,
      content: content.trim(),
      status: 'approved', // Auto-approved for verified tenant chat
      landlordResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    // Send notification to landlord
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: listing.landlordId,
      title: 'Đánh giá mới cho phòng trọ của bạn',
      body: `Người thuê ${userName} đã gửi đánh giá ${rating} sao cho "${listing.title}".`,
      type: 'review_received',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  const replyToReview = (reviewId: string, response: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              landlordResponse: response.trim(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Phase 3: Reports & Moderation
  const submitReport = (
    targetType: ReportTargetType,
    targetId: string,
    targetTitle: string,
    reasonCategory: ReportCategory,
    details: string
  ) => {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser?.id || 'u-tenant-1',
      reporterName: `${currentUser?.fullName || 'Người dùng'} [MẪU - DEV]`,
      targetType,
      targetId,
      targetTitle,
      reasonCategory,
      details: details.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
  };

  const resolveReport = (
    reportId: string,
    resolutionNotes: string,
    action: 'resolved' | 'dismissed'
  ) => {
    setReports((prev) =>
      prev.map((rep) =>
        rep.id === reportId
          ? {
              ...rep,
              status: action,
              resolutionNotes: resolutionNotes.trim(),
              resolvedBy: currentUser?.id || 'u-admin-1',
              updatedAt: new Date().toISOString(),
            }
          : rep
      )
    );
  };

  // Phase 3: Notifications
  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      userPreferences,
      setUserPreferences,
      listings,
      searchFilter,
      setSearchFilter,
      selectedListing,
      setSelectedListing,
      createListing,
      moderateListing,
      mockLoginAs,
      favoriteIds,
      toggleFavorite,
      isFavorite,
      comparisonIds,
      toggleComparison,
      isComparing,
      clearComparison,
      verificationRequests,
      submitL2Verification,
      moderateL2Verification,
      // Phase 3
      conversations,
      messages,
      activeConversationId,
      setActiveConversationId,
      openChatWithLandlord,
      sendMessage,
      reviews,
      submitReview,
      replyToReview,
      canUserReviewListing,
      reports,
      submitReport,
      resolveReport,
      notifications,
      unreadNotificationsCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    }),
    [
      currentUser,
      userPreferences,
      listings,
      searchFilter,
      selectedListing,
      favoriteIds,
      comparisonIds,
      verificationRequests,
      conversations,
      messages,
      activeConversationId,
      reviews,
      reports,
      notifications,
      unreadNotificationsCount,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
