import axios from 'axios';

export type StoreResult = {
  store: string;
  storeLogo?: string;
  productName: string;
  brand?: string;
  price?: number;
  inStock: boolean;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Check Store';
  storeLocation?: {
    name: string;
    address: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
  };
  url?: string;
};

type SearchParams = {
  productBrand?: string;
  productDetails?: string;
  searchTerm: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
};

type StoreType = {
  name: string;
  keywords: string[];
  placeTypes: string[];
  logo: string;
  searchUrl: (query: string) => string;
  categoryPriority: number; // Lower = higher priority in search
};

// Comprehensive store type definitions for dynamic discovery
const STORE_TYPES: Record<string, StoreType> = {
  // Big Box Retail
  target: {
    name: 'Target',
    keywords: ['target'],
    placeTypes: ['department_store', 'store'],
    logo: '🎯',
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
    categoryPriority: 1,
  },
  walmart: {
    name: 'Walmart',
    keywords: ['walmart'],
    placeTypes: ['department_store', 'store'],
    logo: '🟦',
    searchUrl: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`,
    categoryPriority: 1,
  },
  costco: {
    name: 'Costco',
    keywords: ['costco'],
    placeTypes: ['department_store', 'store'],
    logo: '🛒',
    searchUrl: (q) => `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(q)}`,
    categoryPriority: 2,
  },
  samsclub: {
    name: "Sam's Club",
    keywords: ['sams club', "sam's club"],
    placeTypes: ['department_store', 'store'],
    logo: '🏢',
    searchUrl: (q) => `https://www.samsclub.com/s/${encodeURIComponent(q)}`,
    categoryPriority: 2,
  },
  // Grocery Stores
  wholefoods: {
    name: 'Whole Foods',
    keywords: ['whole foods'],
    placeTypes: ['grocery_or_supermarket', 'supermarket', 'food'],
    logo: '🥬',
    searchUrl: (q) => `https://www.wholefoodsmarket.com/search?text=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  safeway: {
    name: 'Safeway',
    keywords: ['safeway'],
    placeTypes: ['grocery_or_supermarket', 'supermarket'],
    logo: '🛒',
    searchUrl: (q) => `https://www.safeway.com/shop/search-results.html?q=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  kroger: {
    name: 'Kroger',
    keywords: ['kroger'],
    placeTypes: ['grocery_or_supermarket', 'supermarket'],
    logo: '🛒',
    searchUrl: (q) => `https://www.kroger.com/search?query=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  traderjoes: {
    name: "Trader Joe's",
    keywords: ['trader joe', "trader joe's"],
    placeTypes: ['grocery_or_supermarket', 'supermarket'],
    logo: '🌺',
    searchUrl: (q) => `https://www.traderjoes.com/home/search?q=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  albertsons: {
    name: 'Albertsons',
    keywords: ['albertsons'],
    placeTypes: ['grocery_or_supermarket', 'supermarket'],
    logo: '🛒',
    searchUrl: (q) => `https://www.albertsons.com/shop/search-results.html?q=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  publix: {
    name: 'Publix',
    keywords: ['publix'],
    placeTypes: ['grocery_or_supermarket', 'supermarket'],
    logo: '🛒',
    searchUrl: (q) => `https://www.publix.com/shop?SearchTerm=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  // Convenience Stores
  seveneleven: {
    name: '7-Eleven',
    keywords: ['7-eleven', '7 eleven'],
    placeTypes: ['convenience_store', 'store'],
    logo: '🏪',
    searchUrl: (q) => `https://www.7-eleven.com/search?q=${encodeURIComponent(q)}`,
    categoryPriority: 5,
  },
  circlek: {
    name: 'Circle K',
    keywords: ['circle k'],
    placeTypes: ['convenience_store', 'gas_station'],
    logo: '⭕',
    searchUrl: () => 'https://www.circlek.com/products',
    categoryPriority: 5,
  },
  wawa: {
    name: 'Wawa',
    keywords: ['wawa'],
    placeTypes: ['convenience_store', 'gas_station'],
    logo: '🦆',
    searchUrl: () => 'https://www.wawa.com',
    categoryPriority: 5,
  },
  // Hardware Stores
  homedepot: {
    name: 'The Home Depot',
    keywords: ['home depot'],
    placeTypes: ['hardware_store', 'home_goods_store'],
    logo: '🔨',
    searchUrl: (q) => `https://www.homedepot.com/s/${encodeURIComponent(q)}`,
    categoryPriority: 4,
  },
  lowes: {
    name: "Lowe's",
    keywords: ['lowes', "lowe's"],
    placeTypes: ['hardware_store', 'home_goods_store'],
    logo: '🛠️',
    searchUrl: (q) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}`,
    categoryPriority: 4,
  },
  acehardware: {
    name: 'Ace Hardware',
    keywords: ['ace hardware'],
    placeTypes: ['hardware_store'],
    logo: '🔧',
    searchUrl: (q) => `https://www.acehardware.com/search?query=${encodeURIComponent(q)}`,
    categoryPriority: 4,
  },
  // Electronics & Tech
  bestbuy: {
    name: 'Best Buy',
    keywords: ['best buy'],
    placeTypes: ['electronics_store', 'store'],
    logo: '💻',
    searchUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`,
    categoryPriority: 2,
  },
  microcenter: {
    name: 'Micro Center',
    keywords: ['micro center', 'microcenter'],
    placeTypes: ['electronics_store'],
    logo: '🖥️',
    searchUrl: (q) => `https://www.microcenter.com/search/search_results.aspx?N=&cat=&Ntt=${encodeURIComponent(q)}`,
    categoryPriority: 2,
  },
  applestore: {
    name: 'Apple Store',
    keywords: ['apple store', 'apple'],
    placeTypes: ['electronics_store', 'store'],
    logo: '🍎',
    searchUrl: (q) => `https://www.apple.com/search/${encodeURIComponent(q)}`,
    categoryPriority: 2,
  },
  // Pharmacy/Health
  cvs: {
    name: 'CVS Pharmacy',
    keywords: ['cvs'],
    placeTypes: ['pharmacy', 'drugstore', 'store'],
    logo: '💊',
    searchUrl: (q) => `https://www.cvs.com/search?searchTerm=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  walgreens: {
    name: 'Walgreens',
    keywords: ['walgreens'],
    placeTypes: ['pharmacy', 'drugstore', 'store'],
    logo: '⚕️',
    searchUrl: (q) => `https://www.walgreens.com/search/results.jsp?Ntt=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  riteaid: {
    name: 'Rite Aid',
    keywords: ['rite aid'],
    placeTypes: ['pharmacy', 'drugstore'],
    logo: '💊',
    searchUrl: (q) => `https://www.riteaid.com/shop/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    categoryPriority: 3,
  },
  // Specialty Retail
  petco: {
    name: 'Petco',
    keywords: ['petco'],
    placeTypes: ['pet_store', 'store'],
    logo: '🐾',
    searchUrl: (q) => `https://www.petco.com/shop/en/petcostore/search?query=${encodeURIComponent(q)}`,
    categoryPriority: 6,
  },
  petsmart: {
    name: 'PetSmart',
    keywords: ['petsmart'],
    placeTypes: ['pet_store', 'store'],
    logo: '🐕',
    searchUrl: (q) => `https://www.petsmart.com/search/?q=${encodeURIComponent(q)}`,
    categoryPriority: 6,
  },
  staples: {
    name: 'Staples',
    keywords: ['staples'],
    placeTypes: ['store', 'home_goods_store'],
    logo: '📎',
    searchUrl: (q) => `https://www.staples.com/search?query=${encodeURIComponent(q)}`,
    categoryPriority: 4,
  },
  officeDepot: {
    name: 'Office Depot',
    keywords: ['office depot'],
    placeTypes: ['store', 'home_goods_store'],
    logo: '📋',
    searchUrl: (q) => `https://www.officedepot.com/catalog/search.do?Ntt=${encodeURIComponent(q)}`,
    categoryPriority: 4,
  },
  bedbathbeyond: {
    name: 'Bed Bath & Beyond',
    keywords: ['bed bath beyond', 'bed bath & beyond'],
    placeTypes: ['home_goods_store', 'store'],
    logo: '🛏️',
    searchUrl: (q) => `https://www.bedbathandbeyond.com/store/s/${encodeURIComponent(q)}`,
    categoryPriority: 4,
  },
  // Online
  amazon: {
    name: 'Amazon',
    keywords: ['amazon'],
    placeTypes: [],
    logo: '📦',
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    categoryPriority: 1,
  },
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Dynamic store finder using location-based search
// In production, integrate with Google Places API, Yelp API, or Foursquare
const findNearbyStores = async (
  storeType: StoreType,
  userLocation?: {latitude: number; longitude: number},
  radius: number = 10, // km
): Promise<Array<{
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}>> => {
  if (!userLocation) {
    // Return mock data if no location
    return generateMockStoreLocations(storeType.name);
  }

  try {
    // TODO: Replace with real Google Places API call
    // Example implementation:
    /*
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        location: `${userLocation.latitude},${userLocation.longitude}`,
        radius: radius * 1000, // Convert km to meters
        keyword: storeType.keywords.join('|'),
        type: storeType.placeTypes[0],
      },
    });

    return response.data.results.map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.geometry.location.lat,
        place.geometry.location.lng,
      ),
    }));
    */

    // For now, return mock data with calculated distances
    const mockStores = generateMockStoreLocations(storeType.name);
    return mockStores.map(store => ({
      ...store,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude,
      ),
    }));
  } catch (error) {
    console.error(`Error finding ${storeType.name} stores:`, error);
    return generateMockStoreLocations(storeType.name);
  }
};

// Generate mock store locations (fallback when no API available)
const generateMockStoreLocations = (
  storeName: string,
): Array<{name: string; address: string; latitude: number; longitude: number}> => {
  // Generate 1-3 random nearby locations
  const baseLocations = [
    {lat: 37.7749, lng: -122.4194, addr: 'Downtown'},
    {lat: 37.7849, lng: -122.4094, addr: 'North Beach'},
    {lat: 37.7649, lng: -122.4294, addr: 'Mission District'},
    {lat: 37.7549, lng: -122.4094, addr: 'Bayshore'},
    {lat: 37.7949, lng: -122.4144, addr: 'Financial District'},
  ];

  const count = Math.min(Math.floor(Math.random() * 2) + 1, 3);
  const selected = baseLocations.slice(0, count);

  return selected.map((loc, idx) => ({
    name: `${storeName}${count > 1 ? ` - ${loc.addr}` : ''}`,
    address: `${Math.floor(Math.random() * 900 + 100)} ${loc.addr} St`,
    latitude: loc.lat + (Math.random() - 0.5) * 0.01,
    longitude: loc.lng + (Math.random() - 0.5) * 0.01,
  }));
};

const findNearestStore = (
  stores: Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>,
  userLocation?: {latitude: number; longitude: number},
) => {
  if (!userLocation || !stores.length) {
    return stores[0];
  }

  let nearest = stores[0];
  let minDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    stores[0].latitude,
    stores[0].longitude,
  );

  stores.forEach(store => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.latitude,
      store.longitude,
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = store;
    }
  });

  return {...nearest, distance: minDistance};
};

// Generic store search function that works for any store type
const searchStoreType = async (
  storeType: StoreType,
  params: SearchParams,
): Promise<StoreResult[]> => {
  try {
    const query = params.productBrand
      ? `${params.productBrand} ${params.searchTerm}`
      : params.searchTerm;

    // Find nearby store locations
    const stores = await findNearbyStores(storeType, params.userLocation);
    if (!stores.length) {
      return [];
    }

    const nearestStore = findNearestStore(stores, params.userLocation);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Generate mock pricing based on store category
    let basePrice = 10 + Math.random() * 90;
    if (storeType.categoryPriority === 1) basePrice *= 1.2; // Big box retail
    if (storeType.categoryPriority === 2) basePrice *= 1.5; // Electronics
    if (storeType.categoryPriority === 5) basePrice *= 0.8; // Convenience stores

    return [
      {
        store: storeType.name,
        storeLogo: storeType.logo,
        productName: query,
        brand: params.productBrand,
        price: Math.round(basePrice * 100) / 100,
        inStock: Math.random() > 0.2, // 80% in stock
        availability: Math.random() > 0.2 ? 'In Stock' : 
                      Math.random() > 0.5 ? 'Low Stock' : 'Out of Stock',
        storeLocation: nearestStore,
        url: storeType.searchUrl(query),
      },
    ];
  } catch (error) {
    console.error(`${storeType.name} search error:`, error);
    return [];
  }
};

// Main search function that queries all store types
export const searchStores = async (
  params: SearchParams,
): Promise<StoreResult[]> => {
  try {
    // Get all store types and prioritize based on location and category
    const storeTypesToSearch = Object.values(STORE_TYPES)
      .sort((a, b) => a.categoryPriority - b.categoryPriority);

    // Execute all searches in parallel
    const allResults = await Promise.all(
      storeTypesToSearch.map(storeType => searchStoreType(storeType, params))
    );

    const flatResults = allResults.flat().filter(result => result.inStock || Math.random() > 0.5);

    // Sort by distance if user location is available
    if (params.userLocation) {
      flatResults.sort((a, b) => {
        const distA = a.storeLocation?.distance ?? Infinity;
        const distB = b.storeLocation?.distance ?? Infinity;
        return distA - distB;
      });
    } else {
      // Sort by category priority if no location
      flatResults.sort((a, b) => {
        const priorityA = STORE_TYPES[a.store.toLowerCase().replace(/[^a-z]/g, '')]?.categoryPriority ?? 999;
        const priorityB = STORE_TYPES[b.store.toLowerCase().replace(/[^a-z]/g, '')]?.categoryPriority ?? 999;
        return priorityA - priorityB;
      });
    }

    // Return top results (limit to prevent overwhelming UI)
    return flatResults.slice(0, 20);
  } catch (error) {
    console.error('Store search error:', error);
    return [];
  }
};

// Function to get real-time inventory from store APIs (when available)
export const checkInventory = async (
  store: string,
  productId: string,
  zipCode?: string,
): Promise<{inStock: boolean; availability: string}> => {
  // In production, integrate with store-specific inventory APIs
  // Target: Target Inventory API
  // Walmart: Walmart Inventory API
  // etc.

  return {
    inStock: true,
    availability: 'In Stock',
  };
};

// Web scraping fallback for stores without APIs
export const scrapeStoreWebsite = async (
  url: string,
): Promise<{inStock: boolean; price?: number}> => {
  try {
    // In production, implement with cheerio on a backend service
    // React Native doesn't support cheerio directly - need a proxy server
    // For now, return mock data
    return {
      inStock: true,
      price: 9.99,
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {inStock: false};
  }
};
