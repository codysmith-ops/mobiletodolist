/**
 * Live Market Trends Service
 * Handles market trends, price predictions, and supply chain insights
 * Status: 75% Functional
 */

// ==================== INTERFACES ====================

export interface MarketTrend {
  category: string;
  trend: 'rising' | 'falling' | 'stable';
  priceChange: number; // percentage
  demand: 'high' | 'medium' | 'low';
  supply: 'surplus' | 'normal' | 'shortage';
  confidence: number; // 0-100
  factors: string[];
  updatedAt: Date;
}

export interface SeasonalTrend {
  itemName: string;
  category: string;
  peakMonths: number[];
  lowMonths: number[];
  averagePriceChange: number;
  currentSeason: 'peak' | 'low' | 'normal';
  recommendation: string;
}

export interface SupplyChainIssue {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: string;
  impact: string;
  affectedItems: string[];
  expectedDuration: string;
  alternatives: string[];
  reportedAt: Date;
}

export interface PriceFluctuation {
  itemName: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  period: 'day' | 'week' | 'month';
  reason: string;
  predictedNext: number;
}

export interface DemandPrediction {
  itemName: string;
  category: string;
  currentDemand: number; // 0-100
  predictedDemand: number; // 0-100
  timeframe: 'day' | 'week' | 'month';
  reasons: string[];
  stockoutRisk: number; // 0-100
}

export interface EventImpact {
  event: string;
  date: Date;
  affectedCategories: string[];
  priceImpact: number; // percentage
  demandIncrease: number; // percentage
  recommendations: string[];
}

// ==================== SERVICE ====================

class LiveMarketTrendsService {
  // Get market trend for category
  async getCategoryTrend(category: string): Promise<MarketTrend> {
    // Mock trend data
    const trends = ['rising', 'falling', 'stable'] as const;
    const trend = trends[Math.floor(Math.random() * 3)];
    const priceChange = trend === 'rising' ? Math.random() * 15 : 
                       trend === 'falling' ? -Math.random() * 10 : 
                       Math.random() * 2 - 1;

    const demands = ['high', 'medium', 'low'] as const;
    const supplies = ['surplus', 'normal', 'shortage'] as const;

    return {
      category,
      trend,
      priceChange: Math.round(priceChange * 10) / 10,
      demand: demands[Math.floor(Math.random() * 3)],
      supply: supplies[Math.floor(Math.random() * 3)],
      confidence: Math.floor(Math.random() * 20) + 75,
      factors: this.getTrendFactors(category, trend),
      updatedAt: new Date(),
    };
  }

  private getTrendFactors(category: string, trend: string): string[] {
    const factors: Record<string, string[]> = {
      rising: [
        'Increased demand',
        'Supply chain disruptions',
        'Seasonal factors',
        'Currency fluctuations',
      ],
      falling: [
        'Decreased demand',
        'Oversupply',
        'Competitive pricing',
        'End of season',
      ],
      stable: [
        'Balanced supply/demand',
        'Normal market conditions',
        'Predictable patterns',
      ],
    };

    return factors[trend]?.slice(0, 2) || [];
  }

  // Get all market trends
  async getAllTrends(): Promise<MarketTrend[]> {
    const categories = [
      'Produce',
      'Dairy',
      'Meat',
      'Bakery',
      'Frozen Foods',
      'Beverages',
      'Snacks',
      'Household',
      'Personal Care',
      'Electronics',
    ];

    return Promise.all(
      categories.map(category => this.getCategoryTrend(category))
    );
  }

  // Get seasonal trends
  async getSeasonalTrends(itemName: string): Promise<SeasonalTrend> {
    const category = this.categorizeItem(itemName);
    const currentMonth = new Date().getMonth();

    // Mock seasonal patterns
    let peakMonths: number[];
    let lowMonths: number[];
    let averagePriceChange: number;

    if (category === 'Produce') {
      peakMonths = [5, 6, 7, 8]; // Summer
      lowMonths = [11, 0, 1]; // Winter
      averagePriceChange = -25;
    } else if (category === 'Meat') {
      peakMonths = [5, 6, 10]; // Summer & Thanksgiving
      lowMonths = [1, 2];
      averagePriceChange = 15;
    } else {
      peakMonths = [11, 0]; // Holidays
      lowMonths = [1, 2, 3];
      averagePriceChange = 10;
    }

    const currentSeason = peakMonths.includes(currentMonth) ? 'peak' :
                          lowMonths.includes(currentMonth) ? 'low' : 'normal';

    const recommendation = currentSeason === 'low' ? 
      'Great time to buy - prices are low!' :
      currentSeason === 'peak' ? 
      'Consider alternatives - prices are high' :
      'Normal pricing';

    return {
      itemName,
      category,
      peakMonths,
      lowMonths,
      averagePriceChange,
      currentSeason,
      recommendation,
    };
  }

  // Get supply chain issues
  async getSupplyChainIssues(): Promise<SupplyChainIssue[]> {
    const now = new Date();
    
    return [
      {
        id: 'issue-1',
        category: 'Produce',
        severity: 'medium',
        issue: 'Weather delays affecting citrus shipments',
        impact: '15-20% price increase expected',
        affectedItems: ['Oranges', 'Lemons', 'Grapefruit'],
        expectedDuration: '2-3 weeks',
        alternatives: ['Local produce', 'Frozen alternatives'],
        reportedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'issue-2',
        category: 'Meat',
        severity: 'low',
        issue: 'Minor processing delays',
        impact: 'Slight reduction in availability',
        affectedItems: ['Beef', 'Pork'],
        expectedDuration: '1 week',
        alternatives: ['Chicken', 'Turkey', 'Plant-based options'],
        reportedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Get price fluctuations
  async getPriceFluctuations(itemName: string): Promise<PriceFluctuation[]> {
    const fluctuations: PriceFluctuation[] = [];
    const basePrice = Math.random() * 10 + 5;

    // Day change
    fluctuations.push({
      itemName,
      currentPrice: Math.round(basePrice * 100) / 100,
      changePercent: Math.round((Math.random() * 4 - 2) * 10) / 10,
      changeAmount: Math.round((Math.random() * 0.5 - 0.25) * 100) / 100,
      period: 'day',
      reason: 'Normal market fluctuation',
      predictedNext: Math.round((basePrice + Math.random() * 0.2 - 0.1) * 100) / 100,
    });

    // Week change
    fluctuations.push({
      itemName,
      currentPrice: Math.round(basePrice * 100) / 100,
      changePercent: Math.round((Math.random() * 10 - 5) * 10) / 10,
      changeAmount: Math.round((Math.random() * 1 - 0.5) * 100) / 100,
      period: 'week',
      reason: 'Weekly promotion cycle',
      predictedNext: Math.round((basePrice + Math.random() * 0.5 - 0.25) * 100) / 100,
    });

    // Month change
    fluctuations.push({
      itemName,
      currentPrice: Math.round(basePrice * 100) / 100,
      changePercent: Math.round((Math.random() * 20 - 10) * 10) / 10,
      changeAmount: Math.round((Math.random() * 2 - 1) * 100) / 100,
      period: 'month',
      reason: 'Seasonal adjustment',
      predictedNext: Math.round((basePrice + Math.random() * 1 - 0.5) * 100) / 100,
    });

    return fluctuations;
  }

  // Get demand predictions
  async getDemandPrediction(itemName: string): Promise<DemandPrediction> {
    const category = this.categorizeItem(itemName);
    const currentDemand = Math.floor(Math.random() * 40) + 40;
    const predictedDemand = currentDemand + Math.floor(Math.random() * 30 - 15);

    const reasons: string[] = [];
    
    if (predictedDemand > currentDemand + 10) {
      reasons.push('Upcoming holiday');
      reasons.push('Seasonal increase expected');
    } else if (predictedDemand < currentDemand - 10) {
      reasons.push('End of season');
      reasons.push('Lower consumption period');
    } else {
      reasons.push('Stable demand pattern');
    }

    const stockoutRisk = predictedDemand > 80 ? Math.floor(Math.random() * 40) + 40 : 
                         Math.floor(Math.random() * 30);

    return {
      itemName,
      category,
      currentDemand,
      predictedDemand,
      timeframe: 'week',
      reasons,
      stockoutRisk,
    };
  }

  // Get upcoming event impacts
  async getEventImpacts(): Promise<EventImpact[]> {
    const now = new Date();
    const events: EventImpact[] = [];

    // Check for upcoming holidays
    const holidays = [
      { name: 'New Year', month: 0, day: 1, categories: ['Beverages', 'Party Supplies'] },
      { name: 'Valentine\'s Day', month: 1, day: 14, categories: ['Candy', 'Flowers', 'Gifts'] },
      { name: 'Easter', month: 3, day: 9, categories: ['Candy', 'Ham', 'Eggs'] },
      { name: 'July 4th', month: 6, day: 4, categories: ['BBQ', 'Beverages', 'Snacks'] },
      { name: 'Thanksgiving', month: 10, day: 23, categories: ['Turkey', 'Produce', 'Bakery'] },
      { name: 'Christmas', month: 11, day: 25, categories: ['Groceries', 'Gifts', 'Beverages'] },
    ];

    for (const holiday of holidays) {
      const eventDate = new Date(now.getFullYear(), holiday.month, holiday.day);
      const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      if (daysUntil > 0 && daysUntil < 30) {
        events.push({
          event: holiday.name,
          date: eventDate,
          affectedCategories: holiday.categories,
          priceImpact: Math.floor(Math.random() * 15) + 5,
          demandIncrease: Math.floor(Math.random() * 50) + 30,
          recommendations: [
            `Buy ${holiday.categories[0]} early to avoid price increases`,
            `Stock up ${daysUntil < 7 ? 'now' : 'soon'} before demand peaks`,
          ],
        });
      }
    }

    return events;
  }

  // Get shortage alerts
  async getShortageAlerts(): Promise<{
    itemName: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
    expectedReturn: Date;
    alternatives: string[];
  }[]> {
    // Mock shortage data
    return [
      {
        itemName: 'Paper Towels',
        severity: 'low',
        reason: 'High seasonal demand',
        expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        alternatives: ['Cloth towels', 'Napkins'],
      },
    ];
  }

  // Get trending items
  async getTrendingItems(): Promise<{
    itemName: string;
    category: string;
    trendScore: number;
    reason: string;
    priceChange: number;
  }[]> {
    const items = [
      'Organic Milk',
      'Avocados',
      'Plant-based Meat',
      'Kombucha',
      'Air Fryers',
    ];

    return items.map(item => ({
      itemName: item,
      category: this.categorizeItem(item),
      trendScore: Math.floor(Math.random() * 40) + 60,
      reason: 'Increased consumer interest',
      priceChange: Math.round((Math.random() * 10 - 5) * 10) / 10,
    }));
  }

  // ==================== HELPER METHODS ====================

  private categorizeItem(itemName: string): string {
    const item = itemName.toLowerCase();
    
    if (item.includes('milk') || item.includes('cheese') || item.includes('yogurt')) {
      return 'Dairy';
    }
    if (item.includes('chicken') || item.includes('beef') || item.includes('pork') || item.includes('turkey')) {
      return 'Meat';
    }
    if (item.includes('bread') || item.includes('bakery')) {
      return 'Bakery';
    }
    if (item.includes('apple') || item.includes('banana') || item.includes('orange')) {
      return 'Produce';
    }
    
    return 'General';
  }
}

export default new LiveMarketTrendsService();
