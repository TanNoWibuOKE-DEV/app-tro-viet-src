import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  UserProfile,
  ListingSummary,
  UserPreferences,
  SearchFilterParams,
  ListingStatus,
  MOCK_LISTINGS,
  UserRole,
} from '@troviet/shared';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial default user: Tenant exploring TroViet
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
  const [searchFilter, setSearchFilter] = useState<SearchFilterParams>({
    sortBy: 'newest',
  });
  const [selectedListing, setSelectedListing] = useState<ListingSummary | null>(null);

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
      status: 'pending_review', // Strict safety rule: new listings must be approved by admin
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
    }),
    [currentUser, userPreferences, listings, searchFilter, selectedListing]
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
