/**
 * Curated High-Definition Architectural & Interior Photography Assets
 * Provides realistic Vietnamese studio/apartment imagery for TroViet listings and categories.
 */

import { PropertyType, ListingSummary } from '@troviet/shared';

export const CURATED_PROPERTY_IMAGES: Record<PropertyType, string[]> = {
  room: [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80',
  ],
  apartment: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  ],
  shared: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
  ],
};

export const CATEGORY_BACKGROUND_IMAGES: Record<PropertyType | 'all', string> = {
  all: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
  room: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&auto=format&fit=crop&q=80',
  apartment: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop&q=80',
  house: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80',
  shared: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&auto=format&fit=crop&q=80',
};

/**
 * Returns a high-quality cover photo for a listing
 */
export function getListingCoverImage(listing: ListingSummary): string {
  if (listing.coverImageUrl && listing.coverImageUrl.startsWith('http')) {
    return listing.coverImageUrl;
  }
  const customPhotos = (listing as any).photos as string[] | undefined;
  if (customPhotos && customPhotos.length > 0 && typeof customPhotos[0] === 'string' && customPhotos[0].startsWith('http')) {
    return customPhotos[0];
  }
  const typeList = CURATED_PROPERTY_IMAGES[listing.propertyType] || CURATED_PROPERTY_IMAGES.room;
  // Deterministic selection based on ID hash
  let hash = 0;
  for (let i = 0; i < listing.id.length; i++) {
    hash = (hash + listing.id.charCodeAt(i)) % typeList.length;
  }
  return typeList[hash] || typeList[0];
}

/**
 * Returns a gallery array of photos for property detail
 */
export function getListingGalleryImages(listing: ListingSummary): string[] {
  const customPhotos = (listing as any).photos as string[] | undefined;
  if (customPhotos && customPhotos.length > 0) {
    const valid = customPhotos.filter((p: string) => typeof p === 'string' && p.startsWith('http'));
    if (valid.length > 0) return valid;
  }
  const typeList = CURATED_PROPERTY_IMAGES[listing.propertyType] || CURATED_PROPERTY_IMAGES.room;
  return typeList;
}
