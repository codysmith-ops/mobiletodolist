/**
 * Store Discovery Service - Find ALL nearby stores by type and location
 * Uses Google Places API + store-specific APIs for comprehensive coverage
 */

import {StoreResult} from './storeSearch';

export interface StoreLocation {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  phone?: string;
  hours?: string;
  rating?: number;
  type: StoreType;
  chain?: string;
}

export type StoreType =
  | 'grocery'
  | 'pharmacy'
  | 'convenience'
  | 'big_box'
  | 'warehouse'
  | 'department'
  | 'specialty'
  | 'dollar'
  | 'online';

export interface StoreCategory {
  type: StoreType;
  label: string;
  icon: string;
  chains: string[];
  placeTypes: string[];
}

// Comprehensive store categories
export const STORE_CATEGORIES: StoreCategory[] = [
  {
    type: 'grocery',
    label: 'Grocery Stores',
    icon: '🛒',
    chains: [
      'Whole Foods',
      'Safeway',
      'Trader Joe\'s',
      'Kroger',
      'Albertsons',
      'Publix',
      'H-E-B',
      'Stop & Shop',
      'Giant',
      'Wegmans',
      'Food Lion',
      'Harris Teeter',
      'Sprouts',
      'Fresh Market',
      'Aldi',
      'Lidl',
      'Smart & Final',
      'WinCo Foods',
      'Meijer',
      'Ralphs',
      'Vons',
      'QFC',
      'Fred Meyer',
    ],
    placeTypes: ['grocery_or_supermarket', 'supermarket'],
  },
  {
    type: 'pharmacy',
    label: 'Pharmacies',
    icon: '💊',
    chains: [
      'CVS',
      'Walgreens',
      'Rite Aid',
      'Duane Reade',
      'Bartell Drugs',
      'Longs Drugs',
    ],
    placeTypes: ['pharmacy', 'drugstore'],
  },
  {
    type: 'convenience',
    label: 'Convenience Stores',
    icon: '🏪',
    chains: [
      '7-Eleven',
      'Circle K',
      'Wawa',
      'Sheetz',
      'QuikTrip',
      'Cumberland Farms',
      'RaceTrac',
      'Speedway',
      'ampm',
    ],
    placeTypes: ['convenience_store'],
  },
  {
    type: 'big_box',
    label: 'Big Box Retailers',
    icon: '🎯',
    chains: [
      'Target',
      'Walmart',
      'Kmart',
      'Big Lots',
    ],
    placeTypes: ['department_store', 'home_goods_store'],
  },
  {
    type: 'warehouse',
    label: 'Warehouse Clubs',
    icon: '📦',
    chains: [
      'Costco',
      'Sam\'s Club',
      'BJ\'s Wholesale',
    ],
    placeTypes: ['department_store'],
  },
  {
    type: 'department',
    label: 'Department Stores',
    icon: '🏬',
    chains: [
      'Macy\'s',
      'Nordstrom',
      'Kohl\'s',
      'JCPenney',
      'Dillard\'s',
      'Bloomingdale\'s',
      'Saks Fifth Avenue',
      'Neiman Marcus',
    ],
    placeTypes: ['department_store', 'shopping_mall'],
  },
  {
    type: 'specialty',
    label: 'Specialty Stores',
    icon: '✨',
    chains: [
      'Bed Bath & Beyond',
      'HomeGoods',
      'TJ Maxx',
      'Marshalls',
      'Ross',
      'Five Below',
      'Container Store',
      'The Home Depot',
      'Lowe\'s',
      'Ace Hardware',
      'PetSmart',
      'Petco',
      'Best Buy',
      'Staples',
      'Office Depot',
      'Michaels',
      'Jo-Ann',
      'Hobby Lobby',
      'Party City',
      'Dollar Tree',
      'Family Dollar',
      '99 Cents Only',
    ],
    placeTypes: ['store', 'electronics_store', 'home_goods_store', 'hardware_store'],
  },
  {
    type: 'dollar',
    label: 'Dollar Stores',
    icon: '💵',
    chains: [
      'Dollar General',
      'Dollar Tree',
      'Family Dollar',
      '99 Cents Only',
    ],
    placeTypes: ['store'],
  },
  {
    type: 'online',
    label: 'Online Retailers',
    icon: '🌐',
    chains: [
      'Amazon',
      'Instacart',
      'Shipt',
      'DoorDash',
      'Uber Eats',
    ],
    placeTypes: [],
  },
];

/**
 * Find all stores near user's location using Google Places API
 */
export const discoverNearbyStores = async (params: {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  types?: StoreType[];
}): Promise<StoreLocation[]> => {
  const {latitude, longitude, radiusMiles = 10, types} = params;
  const radiusMeters = radiusMiles * 1609.34;
  
  const categoriesToSearch = types
    ? STORE_CATEGORIES.filter(c => types.includes(c.type))
    : STORE_CATEGORIES;
  
  const allStores: StoreLocation[] = [];
  
  // Search each category in parallel
  const searches = categoriesToSearch.map(category =>
    searchPlacesByCategory(latitude, longitude, radiusMeters, category)
  );
  
  const results = await Promise.all(searches);
  results.forEach(stores => allStores.push(...stores));
  
  // Remove duplicates (same place found in multiple categories)
  const uniqueStores = deduplicateStores(allStores);
  
  // Sort by distance
  return uniqueStores.sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Search Google Places API for stores in a category
 */
const searchPlacesByCategory = async (
  latitude: number,
  longitude: number,
  radius: number,
  category: StoreCategory,
): Promise<StoreLocation[]> => {
  // PRODUCTION: Replace with real Google Places API
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY';
  
  const stores: StoreLocation[] = [];
  
  for (const placeType of category.placeTypes) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&key=${GOOGLE_PLACES_API_KEY}`;
      
      // MOCK DATA FOR DEVELOPMENT
      const mockStores = generateMockStores(latitude, longitude, category, 5);
      stores.push(...mockStores);
      
      /* PRODUCTION CODE:
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        data.results.forEach((place: any) => {
          // Check if it matches our known chains
          const chain = category.chains.find(c => 
            place.name.toLowerCase().includes(c.toLowerCase())
          );
          
          stores.push({
            placeId: place.place_id,
            name: place.name,
            address: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            distance: calculateDistance(
              latitude,
              longitude,
              place.geometry.location.lat,
              place.geometry.location.lng
            ),
            phone: place.formatted_phone_number,
            rating: place.rating,
            type: category.type,
            chain,
          });
        });
      }
      */
    } catch (error) {
      console.error(`Error searching ${placeType}:`, error);
    }
  }
  
  return stores;
};

/**
 * Search specific store for product availability
 */
export const checkStoreInventory = async (params: {
  store: StoreLocation;
  searchTerm: string;
  productBrand?: string;
}): Promise<StoreResult | null> => {
  const {store, searchTerm, productBrand} = params;
  
  // Route to appropriate API based on chain
  switch (store.chain?.toLowerCase()) {
    case 'target':
      return checkTargetInventory(store, searchTerm, productBrand);
    case 'walmart':
      return checkWalmartInventory(store, searchTerm, productBrand);
    case 'cvs':
      return checkCVSInventory(store, searchTerm);
    case 'walgreens':
      return checkWalgreensInventory(store, searchTerm);
    case 'whole foods':
      return checkWholeFoodsInventory(store, searchTerm);
    // Add more chains as APIs become available
    default:
      return createGenericStoreResult(store, searchTerm);
  }
};

/**
 * Comprehensive search: Find product at ALL nearby stores
 */
export const searchAllNearbyStores = async (params: {
  searchTerm: string;
  productBrand?: string;
  productDetails?: string;
  userLocation: {latitude: number; longitude: number};
  radiusMiles?: number;
  storeTypes?: StoreType[];
}): Promise<StoreResult[]> => {
  const {searchTerm, productBrand, productDetails, userLocation, radiusMiles = 10, storeTypes} = params;
  
  // Step 1: Discover all stores in area
  const nearbyStores = await discoverNearbyStores({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    radiusMiles,
    types: storeTypes,
  });
  
  console.log(`Found ${nearbyStores.length} stores within ${radiusMiles} miles`);
  
  // Step 2: Check each store for product (in batches to avoid rate limits)
  const results: StoreResult[] = [];
  const batchSize = 10;
  
  for (let i = 0; i < nearbyStores.length; i += batchSize) {
    const batch = nearbyStores.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(store =>
        checkStoreInventory({
          store,
          searchTerm,
          productBrand,
        })
      )
    );
    
    results.push(...batchResults.filter(r => r !== null) as StoreResult[]);
    
    // Rate limit pause between batches
    if (i + batchSize < nearbyStores.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Sort by: In Stock first, then by distance
  return results.sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return (a.distance || 999) - (b.distance || 999);
  });
};

/**
 * Filter stores by distance and type
 */
export const filterStores = (
  stores: StoreResult[],
  filters: {
    maxDistance?: number; // miles
    inStockOnly?: boolean;
    storeTypes?: StoreType[];
    minRating?: number;
    maxPrice?: number;
  }
): StoreResult[] => {
  let filtered = stores;
  
  if (filters.maxDistance) {
    const maxMeters = filters.maxDistance * 1609.34;
    filtered = filtered.filter(s => (s.distance || 0) <= maxMeters);
  }
  
  if (filters.inStockOnly) {
    filtered = filtered.filter(s => s.inStock);
  }
  
  if (filters.storeTypes && filters.storeTypes.length > 0) {
    filtered = filtered.filter(s => {
      const category = STORE_CATEGORIES.find(c => 
        c.chains.some(chain => s.store.toLowerCase().includes(chain.toLowerCase()))
      );
      return category && filters.storeTypes!.includes(category.type);
    });
  }
  
  if (filters.minRating) {
    filtered = filtered.filter(s => (s.storeLocation?.rating || 0) >= filters.minRating!);
  }
  
  if (filters.maxPrice) {
    filtered = filtered.filter(s => s.price <= filters.maxPrice!);
  }
  
  return filtered;
};

/**
 * Group stores by type for organized display
 */
export const groupStoresByType = (stores: StoreResult[]): Map<StoreType, StoreResult[]> => {
  const grouped = new Map<StoreType, StoreResult[]>();
  
  STORE_CATEGORIES.forEach(category => {
    grouped.set(category.type, []);
  });
  
  stores.forEach(store => {
    const category = STORE_CATEGORIES.find(c =>
      c.chains.some(chain => store.store.toLowerCase().includes(chain.toLowerCase()))
    );
    
    if (category) {
      grouped.get(category.type)?.push(store);
    }
  });
  
  return grouped;
};

// ========== Helper Functions ==========

const deduplicateStores = (stores: StoreLocation[]): StoreLocation[] => {
  const seen = new Set<string>();
  return stores.filter(store => {
    const key = `${store.latitude.toFixed(5)},${store.longitude.toFixed(5)},${store.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
};

// ========== Mock Data Generators (Replace with real APIs) ==========

const generateMockStores = (
  centerLat: number,
  centerLon: number,
  category: StoreCategory,
  count: number
): StoreLocation[] => {
  const stores: StoreLocation[] = [];
  const selectedChains = category.chains.slice(0, Math.min(count, category.chains.length));
  
  selectedChains.forEach((chain, index) => {
    const offsetLat = (Math.random() - 0.5) * 0.1;
    const offsetLon = (Math.random() - 0.5) * 0.1;
    const lat = centerLat + offsetLat;
    const lon = centerLon + offsetLon;
    
    stores.push({
      placeId: `mock_${category.type}_${index}`,
      name: `${chain}${index > 0 ? ` #${index + 1}` : ''}`,
      address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
      latitude: lat,
      longitude: lon,
      distance: calculateDistance(centerLat, centerLon, lat, lon),
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      hours: 'Open 8am-10pm',
      rating: 3.5 + Math.random() * 1.5,
      type: category.type,
      chain,
    });
  });
  
  return stores;
};

const checkTargetInventory = async (
  store: StoreLocation,
  searchTerm: string,
  productBrand?: string
): Promise<StoreResult | null> => {
  // MOCK - Replace with Target API
  return createGenericStoreResult(store, searchTerm, {
    inStock: Math.random() > 0.3,
    price: 9.99 + Math.random() * 20,
  });
};

const checkWalmartInventory = async (
  store: StoreLocation,
  searchTerm: string,
  productBrand?: string
): Promise<StoreResult | null> => {
  // MOCK - Replace with Walmart API
  return createGenericStoreResult(store, searchTerm, {
    inStock: Math.random() > 0.2,
    price: 8.99 + Math.random() * 18,
  });
};

const checkCVSInventory = async (
  store: StoreLocation,
  searchTerm: string
): Promise<StoreResult | null> => {
  return createGenericStoreResult(store, searchTerm, {
    inStock: Math.random() > 0.4,
    price: 11.99 + Math.random() * 15,
  });
};

const checkWalgreensInventory = async (
  store: StoreLocation,
  searchTerm: string
): Promise<StoreResult | null> => {
  return createGenericStoreResult(store, searchTerm, {
    inStock: Math.random() > 0.4,
    price: 12.49 + Math.random() * 14,
  });
};

const checkWholeFoodsInventory = async (
  store: StoreLocation,
  searchTerm: string
): Promise<StoreResult | null> => {
  return createGenericStoreResult(store, searchTerm, {
    inStock: Math.random() > 0.5,
    price: 14.99 + Math.random() * 20,
  });
};

const createGenericStoreResult = (
  store: StoreLocation,
  searchTerm: string,
  overrides?: {inStock?: boolean; price?: number}
): StoreResult => {
  const inStock = overrides?.inStock ?? Math.random() > 0.3;
  const price = overrides?.price ?? 10 + Math.random() * 20;
  
  return {
    store: store.name,
    storeLogo: getStoreIcon(store.chain || store.name),
    productName: searchTerm,
    price: parseFloat(price.toFixed(2)),
    inStock,
    availability: inStock
      ? Math.random() > 0.7 ? 'Low Stock' : 'In Stock'
      : 'Out of Stock',
    storeLocation: {
      name: store.name,
      address: store.address,
      distance: store.distance,
      latitude: store.latitude,
      longitude: store.longitude,
      phone: store.phone,
      rating: store.rating,
    },
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`,
  };
};

const getStoreIcon = (storeName: string): string => {
  const name = storeName.toLowerCase();
  if (name.includes('target')) return '🎯';
  if (name.includes('walmart')) return '🟦';
  if (name.includes('whole foods')) return '🥬';
  if (name.includes('safeway')) return '🛒';
  if (name.includes('cvs') || name.includes('walgreens')) return '💊';
  if (name.includes('costco') || name.includes('sam')) return '📦';
  if (name.includes('trader joe')) return '🔔';
  if (name.includes('7-eleven')) return '🏪';
  if (name.includes('kroger') || name.includes('albertsons')) return '🛒';
  return '🏬';
};

// Export comprehensive search as default
export default searchAllNearbyStores;
