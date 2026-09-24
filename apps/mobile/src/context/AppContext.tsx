import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  UserProfile,
  ListingSummary,
  UserPreferences,
  SearchFilterParams,
  MOCK_LISTINGS,
  UserRole,
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

  // Favorites (Stored in state & ready for offline cache)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['l-001']);

  // Comparison (Up to 3 listings)
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

    // If approved, elevate target landlord's verification level to L2 across their listings!
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
