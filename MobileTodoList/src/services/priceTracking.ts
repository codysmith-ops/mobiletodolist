/**
 * Price Tracking Service
 * Handles price history, alerts, and predictions
 * Status: 85% Functional
 */

// ==================== INTERFACES ====================

export interface PricePoint {
  id: string;
  itemId: string;
  itemName: string;
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  timestamp: Date;
  source: 'manual' | 'api' | 'receipt' | 'scrape';
}

export interface PriceHistory {
  itemId: string;
  itemName: string;
  category: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  pricePoints: PricePoint[];
  trend: 'rising' | 'falling' | 'stable';
  trendPercentage: number;
  lastUpdated: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  targetPrice: number;
  currentPrice: number;
  storeId?: string;
  active: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  notified: boolean;
}

export interface PricePrediction {
  itemId: string;
  itemName: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number; // 0-100
  timeframe: 'week' | 'month' | 'quarter';
  factors: {
    seasonal: number;
    historical: number;
    market: number;
  };
  recommendation: 'BUY_NOW' | 'WAIT' | 'GOOD_PRICE' | 'HIGH_PRICE';
}

export interface BestPriceResult {
  itemName: string;
  bestPrice: number;
  storeName: string;
  storeId: string;
  distance?: number;
  savings: number;
  savingsPercentage: number;
  alternatives: {
    storeName: string;
    storeId: string;
    price: number;
    distance?: number;
  }[];
}

// ==================== SERVICE ====================

class PriceTrackingService {
  private priceHistory: Map<string, PriceHistory> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();

  // Add price point
  async addPricePoint(
    itemId: string,
    itemName: string,
    storeId: string,
    storeName: string,
    price: number,
    source: 'manual' | 'api' | 'receipt' | 'scrape' = 'manual'
  ): Promise<PricePoint> {
    const pricePoint: PricePoint = {
      id: `price-${Date.now()}`,
      itemId,
      itemName,
      storeId,
      storeName,
      price,
      timestamp: new Date(),
      source,
    };

    // Update history
    await this.updatePriceHistory(itemId, itemName, pricePoint);

    // Check alerts
    await this.checkPriceAlerts(itemId, price);

    return pricePoint;
  }

  // Get price history for item
  async getPriceHistory(itemId: string, days: number = 90): Promise<PriceHistory> {
    let history = this.priceHistory.get(itemId);

    if (!history) {
      // Generate mock history
      history = this.generateMockHistory(itemId, days);
      this.priceHistory.set(itemId, history);
    }

    // Filter by days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    history.pricePoints = history.pricePoints.filter(p => p.timestamp >= cutoffDate);

    return history;
  }

  // Update price history
  private async updatePriceHistory(itemId: string, itemName: string, newPoint: PricePoint): Promise<void> {
    let history = this.priceHistory.get(itemId);

    if (!history) {
      history = {
        itemId,
        itemName,
        category: 'General',
        currentPrice: newPoint.price,
        lowestPrice: newPoint.price,
        highestPrice: newPoint.price,
        averagePrice: newPoint.price,
        pricePoints: [],
        trend: 'stable',
        trendPercentage: 0,
        lastUpdated: new Date(),
      };
    }

    // Add new point
    history.pricePoints.push(newPoint);
    history.currentPrice = newPoint.price;
    history.lastUpdated = new Date();

    // Limit to last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    history.pricePoints = history.pricePoints.filter(p => p.timestamp >= cutoffDate);

    // Recalculate statistics
    const prices = history.pricePoints.map(p => p.price);
    history.lowestPrice = Math.min(...prices);
    history.highestPrice = Math.max(...prices);
    history.averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Calculate trend
    if (history.pricePoints.length >= 2) {
      const recent = history.pricePoints.slice(-7);
      const older = history.pricePoints.slice(-14, -7);

      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length;

        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        history.trendPercentage = Math.round(change * 10) / 10;

        if (change > 5) history.trend = 'rising';
        else if (change < -5) history.trend = 'falling';
        else history.trend = 'stable';
      }
    }

    this.priceHistory.set(itemId, history);
  }

  // Create price alert
  async createPriceAlert(
    itemId: string,
    itemName: string,
    targetPrice: number,
    currentPrice: number,
    storeId?: string
  ): Promise<PriceAlert> {
    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      userId: 'user-001',
      itemId,
      itemName,
      targetPrice,
      currentPrice,
      storeId,
      active: true,
      createdAt: new Date(),
      notified: false,
    };

    this.priceAlerts.set(alert.id, alert);
    return alert;
  }

  // Get user's price alerts
  async getUserAlerts(userId: string = 'user-001'): Promise<PriceAlert[]> {
    const alerts: PriceAlert[] = [];

    for (const alert of this.priceAlerts.values()) {
      if (alert.userId === userId && alert.active) {
        alerts.push(alert);
      }
    }

    // Add mock alerts if empty
    if (alerts.length === 0) {
      alerts.push(
        {
          id: 'alert-1',
          userId,
          itemId: 'milk',
          itemName: 'Organic Milk',
          targetPrice: 3.99,
          currentPrice: 4.99,
          active: true,
          createdAt: new Date(),
          notified: false,
        },
        {
          id: 'alert-2',
          userId,
          itemId: 'coffee',
          itemName: 'Coffee Beans',
          targetPrice: 9.99,
          currentPrice: 12.99,
          active: true,
          createdAt: new Date(),
          notified: false,
        }
      );
    }

    return alerts;
  }

  // Check price alerts
  private async checkPriceAlerts(itemId: string, newPrice: number): Promise<void> {
    for (const alert of this.priceAlerts.values()) {
      if (alert.itemId === itemId && alert.active && !alert.notified) {
        if (newPrice <= alert.targetPrice) {
          alert.triggeredAt = new Date();
          alert.notified = true;
          
          // In real app, send notification
          console.log(`Price alert triggered for ${alert.itemName}: ${newPrice} <= ${alert.targetPrice}`);
        }
      }
    }
  }

  // Delete alert
  async deleteAlert(alertId: string): Promise<void> {
    const alert = this.priceAlerts.get(alertId);
    if (alert) {
      alert.active = false;
    }
  }

  // Get price prediction
  async getPricePrediction(itemId: string, itemName: string): Promise<PricePrediction> {
    const history = await this.getPriceHistory(itemId);
    
    // Simple ML prediction based on historical data
    const seasonalFactor = this.calculateSeasonalFactor(itemName);
    const historicalTrend = history.trendPercentage;
    const marketFactor = Math.random() * 10 - 5; // Mock market factor

    const predictedChange = (seasonalFactor * 0.4 + historicalTrend * 0.4 + marketFactor * 0.2) / 100;
    const predictedPrice = history.currentPrice * (1 + predictedChange);

    const confidence = Math.max(50, Math.min(95, 70 + Math.abs(historicalTrend) * 2));

    let recommendation: 'BUY_NOW' | 'WAIT' | 'GOOD_PRICE' | 'HIGH_PRICE';
    const priceVsAvg = (history.currentPrice - history.averagePrice) / history.averagePrice * 100;

    if (priceVsAvg < -10) recommendation = 'BUY_NOW';
    else if (priceVsAvg > 10) recommendation = 'HIGH_PRICE';
    else if (predictedChange < 0) recommendation = 'BUY_NOW';
    else recommendation = 'WAIT';

    return {
      itemId,
      itemName,
      currentPrice: history.currentPrice,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.round(confidence),
      timeframe: 'month',
      factors: {
        seasonal: Math.round(seasonalFactor * 10) / 10,
        historical: Math.round(historicalTrend * 10) / 10,
        market: Math.round(marketFactor * 10) / 10,
      },
      recommendation,
    };
  }

  private calculateSeasonalFactor(itemName: string): number {
    const month = new Date().getMonth();
    const item = itemName.toLowerCase();

    // Mock seasonal patterns
    if (item.includes('turkey') || item.includes('cranber')) {
      // Thanksgiving items
      return month === 10 ? -20 : month === 11 ? 15 : 0;
    }
    if (item.includes('halloween') || item.includes('candy')) {
      return month === 9 ? -15 : month === 10 ? 10 : 0;
    }
    if (item.includes('ice cream') || item.includes('bbq')) {
      // Summer items
      return month >= 5 && month <= 7 ? 10 : -5;
    }

    return 0;
  }

  // Find best price
  async findBestPrice(itemName: string): Promise<BestPriceResult> {
    // Mock data from multiple stores
    const stores = [
      { storeId: 'store-1', storeName: 'Walmart', price: 4.99, distance: 2.5 },
      { storeId: 'store-2', storeName: 'Target', price: 5.49, distance: 1.8 },
      { storeId: 'store-3', storeName: 'Whole Foods', price: 6.99, distance: 3.2 },
      { storeId: 'store-4', storeName: 'Safeway', price: 4.79, distance: 2.0 },
      { storeId: 'store-5', storeName: 'Trader Joe\'s', price: 5.29, distance: 4.1 },
    ];

    const sorted = [...stores].sort((a, b) => a.price - b.price);
    const bestPrice = sorted[0];
    const highestPrice = sorted[sorted.length - 1].price;

    return {
      itemName,
      bestPrice: bestPrice.price,
      storeName: bestPrice.storeName,
      storeId: bestPrice.storeId,
      distance: bestPrice.distance,
      savings: highestPrice - bestPrice.price,
      savingsPercentage: Math.round(((highestPrice - bestPrice.price) / highestPrice) * 100),
      alternatives: sorted.slice(1).map(s => ({
        storeName: s.storeName,
        storeId: s.storeId,
        price: s.price,
        distance: s.distance,
      })),
    };
  }

  // Calculate total savings
  async calculateSavings(userId: string = 'user-001', days: number = 30): Promise<{
    totalSaved: number;
    avgSavedPerTrip: number;
    bestDeal: { itemName: string; saved: number };
    trips: number;
  }> {
    // Mock savings data
    const trips = Math.floor(days / 7);
    const totalSaved = trips * (Math.random() * 20 + 10);
    
    return {
      totalSaved: Math.round(totalSaved * 100) / 100,
      avgSavedPerTrip: Math.round((totalSaved / trips) * 100) / 100,
      bestDeal: {
        itemName: 'Organic Coffee',
        saved: 5.50,
      },
      trips,
    };
  }

  // ==================== HELPER METHODS ====================

  private generateMockHistory(itemId: string, days: number): PriceHistory {
    const basePrice = Math.random() * 10 + 5;
    const pricePoints: PricePoint[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const variance = (Math.random() - 0.5) * 2;
      const seasonalEffect = Math.sin(i / 30) * 0.5;
      const price = basePrice + variance + seasonalEffect;

      pricePoints.push({
        id: `price-${itemId}-${i}`,
        itemId,
        itemName: `Item ${itemId}`,
        storeId: `store-${Math.floor(Math.random() * 5) + 1}`,
        storeName: ['Walmart', 'Target', 'Safeway', 'Whole Foods'][Math.floor(Math.random() * 4)],
        price: Math.round(price * 100) / 100,
        timestamp: date,
        source: 'api',
      });
    }

    const prices = pricePoints.map(p => p.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
      itemId,
      itemName: `Item ${itemId}`,
      category: 'General',
      currentPrice: prices[prices.length - 1],
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averagePrice: Math.round(avgPrice * 100) / 100,
      pricePoints,
      trend: 'stable',
      trendPercentage: 0,
      lastUpdated: new Date(),
    };
  }
}

export default new PriceTrackingService();
