# Store API Integration Guide

This document describes the store inventory search feature and how to integrate real retail APIs.

## Current Implementation

The app includes a multi-store product search service (`src/services/storeSearch.ts`) with support for:

- **Target** 🎯
- **Walmart** 🟦
- **Grocery Stores** (Whole Foods 🥬, Safeway 🛒)
- **Amazon** 📦

## Features

### 1. Product Search
- Search by product name, brand, or OCR-extracted text
- Queries multiple stores in parallel
- Returns unified results with availability and pricing

### 2. Location-Based Features
- Auto-calculates distance from user's current position
- Sorts results by proximity
- Shows nearest store with product in stock
- Displays store address and distance (km/meters)

### 3. Availability Display
- **In Stock**: Green badge - product available
- **Low Stock**: Yellow badge - limited quantity
- **Out of Stock**: Red badge - not available
- **Check Store**: Gray badge - requires in-store verification

### 4. Auto-Search
- Automatically searches stores after OCR product detection
- Extracts brand and product details from camera images
- Prefills search with detected product information

## Integration with Real APIs

### Target

**Option 1: Target RedCard API** (Requires Partnership)
```typescript
const searchTarget = async (params: SearchParams) => {
  const response = await axios.get('https://api.target.com/products/v3/search', {
    params: {
      key: process.env.TARGET_API_KEY,
      keyword: params.searchTerm,
      zip_code: params.userLocation ? '94102' : undefined, // Convert coords to zip
    },
  });
  
  return response.data.products.map(product => ({
    store: 'Target',
    productName: product.title,
    price: product.price.current_retail,
    inStock: product.availability === 'IN_STOCK',
    availability: product.availability,
    url: product.url,
  }));
};
```

**Option 2: Web Scraping**
```typescript
const scrapeTarget = async (searchTerm: string) => {
  // Use a backend proxy server with cheerio
  const response = await axios.post('YOUR_BACKEND_URL/scrape/target', {
    searchTerm,
  });
  return response.data;
};
```

### Walmart

**Walmart Open API**
```typescript
const searchWalmart = async (params: SearchParams) => {
  const response = await axios.get('https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search', {
    params: {
      apiKey: process.env.WALMART_API_KEY,
      query: params.searchTerm,
    },
  });
  
  return response.data.items.map(item => ({
    store: 'Walmart',
    productName: item.name,
    price: item.salePrice,
    inStock: item.stock === 'Available',
    availability: item.availabilityStatus,
    url: item.productUrl,
  }));
};
```

### Amazon

**Amazon Product Advertising API**
```typescript
import ProductAdvertisingAPIv1 from 'paapi5-nodejs-sdk';

const searchAmazon = async (params: SearchParams) => {
  const api = new ProductAdvertisingAPIv1.DefaultApi();
  const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
  
  searchRequest.Keywords = params.searchTerm;
  searchRequest.PartnerTag = process.env.AMAZON_PARTNER_TAG;
  searchRequest.PartnerType = 'Associates';
  searchRequest.Resources = ['Offers.Listings.Price', 'Offers.Listings.Availability'];
  
  const response = await api.searchItems(searchRequest);
  
  return response.SearchResult.Items.map(item => ({
    store: 'Amazon',
    productName: item.ItemInfo.Title.DisplayValue,
    price: item.Offers?.Listings[0]?.Price?.Amount,
    inStock: item.Offers?.Listings[0]?.Availability?.Type === 'Now',
    availability: item.Offers?.Listings[0]?.Availability?.Message,
    url: item.DetailPageURL,
  }));
};
```

### Grocery Stores

**Instacart API** (for grocery store inventory)
```typescript
const searchGrocery = async (params: SearchParams) => {
  const response = await axios.get('https://www.instacart.com/v3/containers/search', {
    params: {
      term: params.searchTerm,
      source: 'desktop_search',
    },
  });
  
  return response.data.modules.flatMap(module => 
    module.items.map(item => ({
      store: item.retailer.name, // "Whole Foods", "Safeway", etc.
      productName: item.name,
      price: item.price,
      inStock: item.in_stock,
      availability: item.in_stock ? 'In Stock' : 'Out of Stock',
      url: `https://www.instacart.com/products/${item.id}`,
    }))
  );
};
```

## Store Locator APIs

To replace mock store locations with real data:

### Google Maps Places API
```typescript
const findNearbyStores = async (
  storeName: string,
  userLocation: {latitude: number; longitude: number}
) => {
  const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY,
      location: `${userLocation.latitude},${userLocation.longitude}`,
      radius: 10000, // 10km
      keyword: storeName,
      type: 'store',
    },
  });
  
  return response.data.results.map(place => ({
    name: place.name,
    address: place.vicinity,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
  }));
};
```

### Target Store Locator API
```typescript
const findTargetStores = async (zipCode: string) => {
  const response = await axios.get(`https://api.target.com/stores/v3/search`, {
    params: {
      key: process.env.TARGET_API_KEY,
      zip_code: zipCode,
      radius: 10,
      limit: 5,
    },
  });
  
  return response.data.stores;
};
```

## Environment Setup

Create `.env` file in project root:
```bash
# Target (requires business partnership)
TARGET_API_KEY=your_target_api_key

# Walmart (free for affiliates)
WALMART_API_KEY=your_walmart_api_key

# Amazon Product Advertising API
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_PARTNER_TAG=your_associate_tag

# Google Maps (for store locations)
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Install required packages:
```bash
npm install paapi5-nodejs-sdk @googlemaps/google-maps-services-js dotenv
```

## Backend Proxy Server (for Web Scraping)

Since React Native doesn't support cheerio directly, set up a Node.js backend:

```typescript
// server.js
import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
app.use(express.json());

app.post('/scrape/target', async (req, res) => {
  const {searchTerm} = req.body;
  const url = `https://www.target.com/s?searchTerm=${encodeURIComponent(searchTerm)}`;
  
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  const products = [];
  $('.styles__StyledCardWrapper-sc-1hqbh7g-0').each((i, elem) => {
    products.push({
      name: $(elem).find('a').attr('aria-label'),
      price: parseFloat($(elem).find('[data-test="current-price"]').text().replace('$', '')),
      url: 'https://www.target.com' + $(elem).find('a').attr('href'),
    });
  });
  
  res.json(products);
});

app.listen(3000, () => console.log('Scraper running on port 3000'));
```

## Rate Limiting & Caching

Implement caching to reduce API calls:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCachedResults = async (cacheKey: string) => {
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    const {data, timestamp} = JSON.parse(cached);
    // Cache valid for 1 hour
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }
  return null;
};

const setCachedResults = async (cacheKey: string, data: any) => {
  await AsyncStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now(),
  }));
};
```

## Next Steps

1. **Sign up for API keys** from retailers
2. **Create backend proxy** for web scraping
3. **Replace mock data** in `storeSearch.ts` with real API calls
4. **Add error handling** and retry logic
5. **Implement caching** to improve performance
6. **Add user preferences** for preferred stores
7. **Enable price alerts** for price drops
8. **Add barcode scanning** for faster product lookup

## Legal Considerations

- Review each retailer's Terms of Service before scraping
- Some retailers require business partnerships for API access
- Amazon Associates has income requirements for API access
- Consider using official APIs where available
- Respect rate limits and implement proper caching
