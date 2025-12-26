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

// Mock store locations (replace with actual store locator APIs)
const STORE_LOCATIONS = {
  target: [
    {
      name: 'Target - Downtown',
      address: '123 Main St',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      name: 'Target - Westfield',
      address: '456 Market St',
      latitude: 37.7849,
      longitude: -122.4094,
    },
  ],
  walmart: [
    {
      name: 'Walmart Supercenter',
      address: '789 Oak Ave',
      latitude: 37.7649,
      longitude: -122.4294,
    },
  ],
  wholefoods: [
    {
      name: 'Whole Foods Market',
      address: '321 Green St',
      latitude: 37.7749,
      longitude: -122.4094,
    },
  ],
  safeway: [
    {
      name: 'Safeway',
      address: '555 Pine St',
      latitude: 37.7849,
      longitude: -122.4194,
    },
  ],
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

// Target API simulation (in production, use Target's RedCard API or web scraping)
const searchTarget = async (params: SearchParams): Promise<StoreResult[]> => {
  try {
    // In production, integrate with Target's API or scrape their website
    // For now, return mock data
    const query = params.productBrand
      ? `${params.productBrand} ${params.searchTerm}`
      : params.searchTerm;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const nearestStore = findNearestStore(
      STORE_LOCATIONS.target,
      params.userLocation,
    );

    return [
      {
        store: 'Target',
        storeLogo: '🎯',
        productName: query,
        brand: params.productBrand,
        price: 12.99,
        inStock: true,
        availability: 'In Stock',
        storeLocation: nearestStore,
        url: `https://www.target.com/s?searchTerm=${encodeURIComponent(query)}`,
      },
    ];
  } catch (error) {
    console.error('Target search error:', error);
    return [];
  }
};

// Walmart API simulation
const searchWalmart = async (params: SearchParams): Promise<StoreResult[]> => {
  try {
    const query = params.productBrand
      ? `${params.productBrand} ${params.searchTerm}`
      : params.searchTerm;

    await new Promise(resolve => setTimeout(resolve, 400));

    const nearestStore = findNearestStore(
      STORE_LOCATIONS.walmart,
      params.userLocation,
    );

    return [
      {
        store: 'Walmart',
        storeLogo: '🟦',
        productName: query,
        brand: params.productBrand,
        price: 11.49,
        inStock: true,
        availability: 'In Stock',
        storeLocation: nearestStore,
        url: `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
      },
    ];
  } catch (error) {
    console.error('Walmart search error:', error);
    return [];
  }
};

// Grocery store search (Whole Foods, Safeway, etc.)
const searchGrocery = async (params: SearchParams): Promise<StoreResult[]> => {
  try {
    const query = params.productBrand
      ? `${params.productBrand} ${params.searchTerm}`
      : params.searchTerm;

    await new Promise(resolve => setTimeout(resolve, 350));

    const results: StoreResult[] = [];

    // Whole Foods
    const wholeFoodsStore = findNearestStore(
      STORE_LOCATIONS.wholefoods,
      params.userLocation,
    );
    results.push({
      store: 'Whole Foods',
      storeLogo: '🥬',
      productName: query,
      brand: params.productBrand,
      price: 14.99,
      inStock: true,
      availability: 'Check Store',
      storeLocation: wholeFoodsStore,
      url: `https://www.wholefoodsmarket.com/search?text=${encodeURIComponent(
        query,
      )}`,
    });

    // Safeway
    const safewayStore = findNearestStore(
      STORE_LOCATIONS.safeway,
      params.userLocation,
    );
    results.push({
      store: 'Safeway',
      storeLogo: '🛒',
      productName: query,
      brand: params.productBrand,
      price: 10.99,
      inStock: true,
      availability: 'In Stock',
      storeLocation: safewayStore,
      url: `https://www.safeway.com/shop/search-results.html?q=${encodeURIComponent(
        query,
      )}`,
    });

    return results;
  } catch (error) {
    console.error('Grocery search error:', error);
    return [];
  }
};

// Amazon Product API simulation
const searchAmazon = async (params: SearchParams): Promise<StoreResult[]> => {
  try {
    // In production, use Amazon Product Advertising API
    const query = params.productBrand
      ? `${params.productBrand} ${params.searchTerm}`
      : params.searchTerm;

    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        store: 'Amazon',
        storeLogo: '📦',
        productName: query,
        brand: params.productBrand,
        price: 13.99,
        inStock: true,
        availability: 'In Stock',
        url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      },
    ];
  } catch (error) {
    console.error('Amazon search error:', error);
    return [];
  }
};

// Main search function that queries all stores
export const searchStores = async (
  params: SearchParams,
): Promise<StoreResult[]> => {
  try {
    // Execute all searches in parallel
    const [targetResults, walmartResults, groceryResults, amazonResults] =
      await Promise.all([
        searchTarget(params),
        searchWalmart(params),
        searchGrocery(params),
        searchAmazon(params),
      ]);

    const allResults = [
      ...targetResults,
      ...walmartResults,
      ...groceryResults,
      ...amazonResults,
    ];

    // Sort by distance if user location is available
    if (params.userLocation) {
      allResults.sort((a, b) => {
        const distA = a.storeLocation?.distance ?? Infinity;
        const distB = b.storeLocation?.distance ?? Infinity;
        return distA - distB;
      });
    }

    return allResults;
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
