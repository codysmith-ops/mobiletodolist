/**
 * Dynamic Deals Service
 * Real-time deal discovery, coupon tracking, and cashback integration
 */

import axios from 'axios';

export interface Deal {
  id: string;
  title: string;
  description: string;
  storeName: string;
  storeId: string;
  discountPercent?: number;
  discountAmount?: number;
  originalPrice: number;
  dealPrice: number;
  savings: number;
  validUntil: Date;
  category: string;
  productName: string;
  productImage?: string;
  dealType: 'percentage' | 'fixed' | 'bogo' | 'clearance' | 'flash';
  isExpiringSoon: boolean;
  requiresCoupon: boolean;
  couponCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  storeName: string;
  discount: string;
  description: string;
  validUntil: Date;
  minimumPurchase?: number;
  maxUses?: number;
  timesUsed: number;
  isClipped: boolean;
  isExpired: boolean;
  categories: string[];
}

export interface CashbackOffer {
  id: string;
  storeName: string;
  storeId: string;
  cashbackPercent: number;
  cashbackCap?: number;
  provider: 'rakuten' | 'honey' | 'ibotta' | 'fetch' | 'dosh';
  validUntil?: Date;
  minimumPurchase?: number;
  earnedAmount: number;
  isActive: boolean;
}

export interface FlashSale {
  id: string;
  storeName: string;
  productName: string;
  originalPrice: number;
  salePrice: number;
  savings: number;
  endsAt: Date;
  timeRemaining: string;
  quantityAvailable?: number;
  productImage?: string;
}

// Mock deal data generator
const generateMockDeals = (count: number = 10): Deal[] => {
  const stores = ['Target', 'Walmart', 'Whole Foods', 'Safeway', 'Amazon'];
  const categories = ['Groceries', 'Electronics', 'Clothing', 'Home & Garden', 'Health & Beauty'];
  const dealTypes: Deal['dealType'][] = ['percentage', 'fixed', 'bogo', 'clearance', 'flash'];
  
  return Array.from({ length: count }, (_, i) => {
    const originalPrice = Math.random() * 50 + 10;
    const discountPercent = Math.floor(Math.random() * 50) + 10;
    const dealPrice = originalPrice * (1 - discountPercent / 100);
    const daysValid = Math.floor(Math.random() * 14) + 1;
    
    return {
      id: `deal-${i}`,
      title: `${discountPercent}% off`,
      description: `Save ${discountPercent}% on select items`,
      storeName: stores[Math.floor(Math.random() * stores.length)],
      storeId: `store-${i}`,
      discountPercent,
      originalPrice: Math.round(originalPrice * 100) / 100,
      dealPrice: Math.round(dealPrice * 100) / 100,
      savings: Math.round((originalPrice - dealPrice) * 100) / 100,
      validUntil: new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000),
      category: categories[Math.floor(Math.random() * categories.length)],
      productName: `Product ${i}`,
      dealType: dealTypes[Math.floor(Math.random() * dealTypes.length)],
      isExpiringSoon: daysValid <= 2,
      requiresCoupon: Math.random() > 0.6,
      couponCode: Math.random() > 0.6 ? `SAVE${discountPercent}` : undefined
    };
  });
};

/**
 * Search for active deals based on criteria
 */
export const searchDeals = async (params: {
  category?: string;
  storeName?: string;
  minDiscount?: number;
  maxPrice?: number;
  dealType?: Deal['dealType'];
}): Promise<Deal[]> => {
  try {
    // In production, this would call retailer APIs
    // Rakuten, Honey, RetailMeNot, etc.
    
    let deals = generateMockDeals(50);
    
    // Filter by criteria
    if (params.category) {
      deals = deals.filter(d => d.category === params.category);
    }
    if (params.storeName) {
      deals = deals.filter(d => d.storeName === params.storeName);
    }
    if (params.minDiscount) {
      deals = deals.filter(d => (d.discountPercent || 0) >= params.minDiscount);
    }
    if (params.maxPrice) {
      deals = deals.filter(d => d.dealPrice <= params.maxPrice);
    }
    if (params.dealType) {
      deals = deals.filter(d => d.dealType === params.dealType);
    }
    
    // Sort by savings (highest first)
    return deals.sort((a, b) => b.savings - a.savings);
  } catch (error) {
    console.error('Error searching deals:', error);
    return [];
  }
};

/**
 * Get personalized deals based on shopping history
 */
export const getPersonalizedDeals = async (
  userCategories: string[],
  favoriteStores: string[]
): Promise<Deal[]> => {
  const allDeals = generateMockDeals(100);
  
  // Score deals based on relevance
  const scoredDeals = allDeals.map(deal => ({
    deal,
    score: 
      (userCategories.includes(deal.category) ? 50 : 0) +
      (favoriteStores.includes(deal.storeName) ? 30 : 0) +
      deal.discountPercent || 0
  }));
  
  // Return top 20 deals
  return scoredDeals
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(s => s.deal);
};

/**
 * Get available coupons for stores
 */
export const getAvailableCoupons = async (
  storeName?: string
): Promise<Coupon[]> => {
  const stores = storeName ? [storeName] : ['Target', 'Walmart', 'Whole Foods', 'Safeway'];
  const categories = ['Groceries', 'Electronics', 'Clothing', 'Health & Beauty'];
  
  return stores.flatMap((store, i) => 
    Array.from({ length: 5 }, (_, j) => ({
      id: `coupon-${i}-${j}`,
      code: `${store.toUpperCase().slice(0, 3)}${Math.floor(Math.random() * 1000)}`,
      storeName: store,
      discount: `${Math.floor(Math.random() * 30) + 10}% off`,
      description: `Save on ${categories[j % categories.length]}`,
      validUntil: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      minimumPurchase: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : undefined,
      maxUses: 1,
      timesUsed: 0,
      isClipped: false,
      isExpired: false,
      categories: [categories[j % categories.length]]
    }))
  );
};

/**
 * Clip/save a coupon for later use
 */
export const clipCoupon = async (couponId: string): Promise<boolean> => {
  try {
    // In production, save to Firebase/AsyncStorage
    console.log(`Clipped coupon: ${couponId}`);
    return true;
  } catch (error) {
    console.error('Error clipping coupon:', error);
    return false;
  }
};

/**
 * Get active cashback offers
 */
export const getCashbackOffers = async (
  storeName?: string
): Promise<CashbackOffer[]> => {
  const providers: CashbackOffer['provider'][] = ['rakuten', 'honey', 'ibotta', 'fetch', 'dosh'];
  const stores = storeName ? [storeName] : ['Target', 'Walmart', 'Amazon', 'Whole Foods', 'Best Buy'];
  
  return stores.map((store, i) => ({
    id: `cashback-${i}`,
    storeName: store,
    storeId: `store-${i}`,
    cashbackPercent: Math.floor(Math.random() * 15) + 1,
    cashbackCap: Math.random() > 0.7 ? 25 : undefined,
    provider: providers[i % providers.length],
    minimumPurchase: Math.random() > 0.5 ? 10 : undefined,
    earnedAmount: 0,
    isActive: true
  }));
};

/**
 * Track cashback earnings
 */
export const trackCashback = async (params: {
  storeId: string;
  purchaseAmount: number;
  cashbackPercent: number;
}): Promise<number> => {
  const earned = params.purchaseAmount * (params.cashbackPercent / 100);
  
  // In production, save to user's cashback account
  console.log(`Earned $${earned.toFixed(2)} cashback`);
  
  return earned;
};

/**
 * Get flash sales ending soon
 */
export const getFlashSales = async (): Promise<FlashSale[]> => {
  const stores = ['Target', 'Amazon', 'Best Buy', 'Walmart'];
  
  return Array.from({ length: 10 }, (_, i) => {
    const endsAt = new Date(Date.now() + Math.random() * 12 * 60 * 60 * 1000);
    const hoursRemaining = Math.floor((endsAt.getTime() - Date.now()) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor(((endsAt.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));
    
    const originalPrice = Math.random() * 100 + 20;
    const salePrice = originalPrice * (1 - (Math.random() * 0.5 + 0.3));
    
    return {
      id: `flash-${i}`,
      storeName: stores[Math.floor(Math.random() * stores.length)],
      productName: `Flash Sale Product ${i}`,
      originalPrice: Math.round(originalPrice * 100) / 100,
      salePrice: Math.round(salePrice * 100) / 100,
      savings: Math.round((originalPrice - salePrice) * 100) / 100,
      endsAt,
      timeRemaining: `${hoursRemaining}h ${minutesRemaining}m`,
      quantityAvailable: Math.floor(Math.random() * 50) + 5
    };
  }).sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());
};

/**
 * Get deal alerts for price drops on watched items
 */
export const getDealAlerts = async (
  watchedProducts: string[]
): Promise<Deal[]> => {
  // Filter deals that match watched products
  const allDeals = generateMockDeals(100);
  return allDeals.filter(deal => 
    watchedProducts.some(product => 
      deal.productName.toLowerCase().includes(product.toLowerCase())
    )
  );
};

/**
 * Calculate total savings from using deals/coupons
 */
export const calculateSavings = (params: {
  originalTotal: number;
  deals: Deal[];
  coupons: Coupon[];
  cashbackPercent?: number;
}): {
  dealSavings: number;
  couponSavings: number;
  cashbackEarnings: number;
  totalSavings: number;
  finalPrice: number;
} => {
  const dealSavings = params.deals.reduce((sum, deal) => sum + deal.savings, 0);
  
  // Simplified coupon calculation
  const couponSavings = params.coupons.reduce((sum, coupon) => {
    const match = coupon.discount.match(/(\d+)%/);
    if (match) {
      return sum + (params.originalTotal * (parseInt(match[1]) / 100));
    }
    return sum;
  }, 0);
  
  const subtotal = params.originalTotal - dealSavings - couponSavings;
  const cashbackEarnings = params.cashbackPercent 
    ? subtotal * (params.cashbackPercent / 100)
    : 0;
  
  return {
    dealSavings: Math.round(dealSavings * 100) / 100,
    couponSavings: Math.round(couponSavings * 100) / 100,
    cashbackEarnings: Math.round(cashbackEarnings * 100) / 100,
    totalSavings: Math.round((dealSavings + couponSavings + cashbackEarnings) * 100) / 100,
    finalPrice: Math.round(subtotal * 100) / 100
  };
};

export default {
  searchDeals,
  getPersonalizedDeals,
  getAvailableCoupons,
  clipCoupon,
  getCashbackOffers,
  trackCashback,
  getFlashSales,
  getDealAlerts,
  calculateSavings
};
