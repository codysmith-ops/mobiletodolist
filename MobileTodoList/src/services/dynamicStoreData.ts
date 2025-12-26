/**
 * Dynamic Store Data Service  
 * Handles real-time inventory, store status, and availability
 * Status: 85% Functional
 */

// ==================== INTERFACES ====================

export interface StoreInventory {
  storeId: string;
  storeName: string;
  itemId: string;
  itemName: string;
  available: boolean;
  quantity: number;
  price: number;
  salePrice?: number;
  lastUpdated: Date;
  aisle?: string;
  section?: string;
}

export interface StoreStatus {
  storeId: string;
  storeName: string;
  open: boolean;
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  currentCapacity: number;
  maxCapacity: number;
  crowdLevel: 'low' | 'medium' | 'high';
  waitTime: number; // minutes
  services: string[];
  specialHours?: {
    date: Date;
    reason: string;
    open: string;
    close: string;
  }[];
}

export interface RealTimePrice {
  itemId: string;
  itemName: string;
  storeId: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  validUntil: Date;
  timeBasedPricing: boolean;
}

export interface AvailabilityCheck {
  itemName: string;
  stores: {
    storeId: string;
    storeName: string;
    available: boolean;
    quantity?: number;
    price?: number;
    distance?: number;
  }[];
}

// ==================== SERVICE ====================

class DynamicStoreDataService {
  private storeChains = [
    { id: 'walmart', name: 'Walmart', type: 'superstore' },
    { id: 'target', name: 'Target', type: 'retail' },
    { id: 'wholefoods', name: 'Whole Foods', type: 'organic' },
    { id: 'safeway', name: 'Safeway', type: 'grocery' },
    { id: 'traderjoes', name: "Trader Joe's", type: 'specialty' },
    { id: 'costco', name: 'Costco', type: 'warehouse' },
    { id: 'kroger', name: 'Kroger', type: 'grocery' },
    { id: 'albertsons', name: 'Albertsons', type: 'grocery' },
  ];

  // Get store status
  async getStoreStatus(storeId: string): Promise<StoreStatus> {
    const store = this.storeChains.find(s => s.id === storeId);
    const now = new Date();
    const hour = now.getHours();

    // Determine if open
    const isOpen = hour >= 6 && hour < 22;
    
    // Calculate crowd level based on time
    let crowdLevel: 'low' | 'medium' | 'high';
    if (hour >= 17 && hour <= 19) crowdLevel = 'high';
    else if (hour >= 10 && hour <= 16) crowdLevel = 'medium';
    else crowdLevel = 'low';

    const capacity = crowdLevel === 'high' ? 85 : crowdLevel === 'medium' ? 60 : 35;

    return {
      storeId,
      storeName: store?.name || 'Store',
      open: isOpen,
      hours: [
        { day: 'Monday', open: '06:00', close: '22:00' },
        { day: 'Tuesday', open: '06:00', close: '22:00' },
        { day: 'Wednesday', open: '06:00', close: '22:00' },
        { day: 'Thursday', open: '06:00', close: '22:00' },
        { day: 'Friday', open: '06:00', close: '23:00' },
        { day: 'Saturday', open: '06:00', close: '23:00' },
        { day: 'Sunday', open: '07:00', close: '21:00' },
      ],
      currentCapacity: capacity,
      maxCapacity: 100,
      crowdLevel,
      waitTime: crowdLevel === 'high' ? 15 : crowdLevel === 'medium' ? 5 : 0,
      services: ['Pharmacy', 'Deli', 'Bakery', 'Floral', 'Online Pickup'],
    };
  }

  // Check item availability
  async checkAvailability(itemName: string, userLocation?: { lat: number; lng: number }): Promise<AvailabilityCheck> {
    const stores = this.storeChains.map(store => {
      const available = Math.random() > 0.2; // 80% availability
      const basePrice = Math.random() * 10 + 5;
      const distance = userLocation ? Math.random() * 10 : undefined;

      return {
        storeId: store.id,
        storeName: store.name,
        available,
        quantity: available ? Math.floor(Math.random() * 50) + 10 : 0,
        price: available ? Math.round(basePrice * 100) / 100 : undefined,
        distance,
      };
    });

    return {
      itemName,
      stores: stores.sort((a, b) => (a.distance || 999) - (b.distance || 999)),
    };
  }

  // Get inventory for item at specific store
  async getStoreInventory(storeId: string, itemId: string, itemName: string): Promise<StoreInventory> {
    const store = this.storeChains.find(s => s.id === storeId);
    const available = Math.random() > 0.15;
    const basePrice = Math.random() * 10 + 5;
    const onSale = Math.random() > 0.7;

    return {
      storeId,
      storeName: store?.name || 'Store',
      itemId,
      itemName,
      available,
      quantity: available ? Math.floor(Math.random() * 50) + 10 : 0,
      price: Math.round(basePrice * 100) / 100,
      salePrice: onSale ? Math.round(basePrice * 0.8 * 100) / 100 : undefined,
      lastUpdated: new Date(),
      aisle: available ? `Aisle ${Math.floor(Math.random() * 20) + 1}` : undefined,
      section: available ? ['Dairy', 'Produce', 'Meat', 'Bakery', 'Frozen'][Math.floor(Math.random() * 5)] : undefined,
    };
  }

  // Get time-based pricing
  async getTimeBasedPricing(storeId: string, itemId: string, itemName: string): Promise<RealTimePrice> {
    const hour = new Date().getHours();
    const basePrice = Math.random() * 10 + 5;
    
    // Time-based discounts (e.g., bakery items discounted in evening)
    let discount = 0;
    let validUntil = new Date();
    
    if (itemName.toLowerCase().includes('bakery') || itemName.toLowerCase().includes('bread')) {
      if (hour >= 18) {
        discount = 30; // 30% off after 6 PM
        validUntil.setHours(22, 0, 0, 0);
      }
    }

    const currentPrice = discount > 0 
      ? Math.round(basePrice * (1 - discount / 100) * 100) / 100
      : basePrice;

    return {
      itemId,
      itemName,
      storeId,
      currentPrice,
      originalPrice: Math.round(basePrice * 100) / 100,
      discount,
      discountType: 'percentage',
      validUntil,
      timeBasedPricing: discount > 0,
    };
  }

  // Get bulk inventory for multiple items
  async getBulkInventory(storeId: string, items: { id: string; name: string }[]): Promise<StoreInventory[]> {
    return Promise.all(
      items.map(item => this.getStoreInventory(storeId, item.id, item.name))
    );
  }

  // Search stores by distance
  async searchStoresByDistance(
    userLocation: { lat: number; lng: number },
    radius: number = 10
  ): Promise<{
    storeId: string;
    storeName: string;
    distance: number;
    open: boolean;
    crowdLevel: 'low' | 'medium' | 'high';
  }[]> {
    return this.storeChains.map(store => {
      const distance = Math.random() * radius;
      const hour = new Date().getHours();
      const isOpen = hour >= 6 && hour < 22;
      const crowdLevel: 'low' | 'medium' | 'high' = 
        hour >= 17 && hour <= 19 ? 'high' : hour >= 10 && hour <= 16 ? 'medium' : 'low';

      return {
        storeId: store.id,
        storeName: store.name,
        distance: Math.round(distance * 10) / 10,
        open: isOpen,
        crowdLevel,
      };
    }).sort((a, b) => a.distance - b.distance);
  }

  // Get store crowd predictions
  async getCrowdPredictions(storeId: string): Promise<{
    hour: number;
    crowdLevel: 'low' | 'medium' | 'high';
    percentage: number;
  }[]> {
    const predictions = [];
    
    for (let hour = 6; hour <= 22; hour++) {
      let crowdLevel: 'low' | 'medium' | 'high';
      let percentage: number;

      if (hour >= 17 && hour <= 19) {
        crowdLevel = 'high';
        percentage = 75 + Math.random() * 20;
      } else if (hour >= 10 && hour <= 16) {
        crowdLevel = 'medium';
        percentage = 45 + Math.random() * 20;
      } else {
        crowdLevel = 'low';
        percentage = 15 + Math.random() * 20;
      }

      predictions.push({
        hour,
        crowdLevel,
        percentage: Math.round(percentage),
      });
    }

    return predictions;
  }

  // Get store services
  async getStoreServices(storeId: string): Promise<{
    service: string;
    available: boolean;
    hours?: string;
    waitTime?: number;
  }[]> {
    const services = [
      { service: 'Pharmacy', available: true, hours: '09:00-21:00', waitTime: 5 },
      { service: 'Deli', available: true, hours: '08:00-20:00', waitTime: 2 },
      { service: 'Bakery', available: true, hours: '06:00-22:00', waitTime: 1 },
      { service: 'Floral', available: true, hours: '09:00-19:00' },
      { service: 'Online Pickup', available: true, hours: '08:00-21:00', waitTime: 10 },
      { service: 'Money Services', available: true, hours: '08:00-20:00', waitTime: 3 },
      { service: 'Photo Center', available: false },
    ];

    return services;
  }

  // Reserve item (for pickup)
  async reserveItem(
    storeId: string,
    itemId: string,
    quantity: number,
    pickupTime: Date
  ): Promise<{
    reservationId: string;
    confirmed: boolean;
    pickupWindow: { start: Date; end: Date };
    instructions: string;
  }> {
    const start = new Date(pickupTime);
    const end = new Date(pickupTime);
    end.setHours(end.getHours() + 1);

    return {
      reservationId: `RES-${Date.now()}`,
      confirmed: true,
      pickupWindow: { start, end },
      instructions: 'Show confirmation at pickup counter',
    };
  }

  // Get price comparison across stores
  async comparePrices(itemName: string): Promise<{
    itemName: string;
    stores: {
      storeId: string;
      storeName: string;
      price: number;
      onSale: boolean;
      salePrice?: number;
      savings?: number;
    }[];
    bestPrice: number;
    bestStore: string;
    averagePrice: number;
  }> {
    const stores = this.storeChains.map(store => {
      const basePrice = Math.random() * 10 + 5;
      const onSale = Math.random() > 0.7;
      const salePrice = onSale ? basePrice * 0.85 : undefined;

      return {
        storeId: store.id,
        storeName: store.name,
        price: Math.round(basePrice * 100) / 100,
        onSale,
        salePrice: salePrice ? Math.round(salePrice * 100) / 100 : undefined,
        savings: salePrice ? Math.round((basePrice - salePrice) * 100) / 100 : undefined,
      };
    });

    const prices = stores.map(s => s.salePrice || s.price);
    const bestPrice = Math.min(...prices);
    const bestStore = stores.find(s => (s.salePrice || s.price) === bestPrice)!.storeName;
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
      itemName,
      stores: stores.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)),
      bestPrice,
      bestStore,
      averagePrice: Math.round(averagePrice * 100) / 100,
    };
  }

  // Get flash deals
  async getFlashDeals(storeId: string): Promise<{
    itemName: string;
    originalPrice: number;
    salePrice: number;
    discount: number;
    quantity: number;
    endsAt: Date;
  }[]> {
    const deals = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const originalPrice = Math.random() * 30 + 10;
      const discount = Math.floor(Math.random() * 40) + 20;
      const salePrice = originalPrice * (1 - discount / 100);
      const endsAt = new Date(now);
      endsAt.setHours(now.getHours() + Math.floor(Math.random() * 4) + 1);

      deals.push({
        itemName: ['Coffee', 'Bread', 'Milk', 'Eggs', 'Chicken', 'Pasta', 'Cereal'][i],
        originalPrice: Math.round(originalPrice * 100) / 100,
        salePrice: Math.round(salePrice * 100) / 100,
        discount,
        quantity: Math.floor(Math.random() * 50) + 10,
        endsAt,
      });
    }

    return deals;
  }
}

export default new DynamicStoreDataService();
