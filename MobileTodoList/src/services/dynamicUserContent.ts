/**
 * Dynamic User Content Service
 * Handles personalized content, trending items, and user recommendations
 * Status: 80% Functional
 */

// ==================== INTERFACES ====================

export interface PersonalizedSuggestion {
  id: string;
  type: 'item' | 'category' | 'recipe' | 'deal' | 'store';
  title: string;
  description: string;
  relevanceScore: number; // 0-100
  reason: string;
  data: any;
  expiresAt?: Date;
}

export interface TrendingItem {
  itemName: string;
  category: string;
  popularityScore: number;
  trending: 'up' | 'down' | 'stable';
  usersPurchasing: number;
  priceRange: { min: number; max: number };
  tags: string[];
}

export interface SocialRecommendation {
  itemName: string;
  recommendedBy: string[];
  friendCount: number;
  averageRating: number;
  commonUseCase: string;
  lastPurchased: Date;
}

export interface CategorySuggestion {
  category: string;
  confidence: number;
  itemCount: number;
  averagePrice: number;
  topItems: string[];
  reason: string;
}

export interface StoreRecommendation {
  storeId: string;
  storeName: string;
  matchScore: number; // 0-100
  reasons: string[];
  estimatedSavings: number;
  distance: number;
  specialties: string[];
}

export interface UserPreference {
  category: string;
  frequency: number;
  averageSpend: number;
  preferredBrands: string[];
  dietaryRestrictions: string[];
  lastPurchased: Date;
}

// ==================== SERVICE ====================

class DynamicUserContentService {
  private userId: string = 'user-001';

  // Get personalized suggestions
  async getPersonalizedSuggestions(limit: number = 10): Promise<PersonalizedSuggestion[]> {
    const suggestions: PersonalizedSuggestion[] = [];
    
    // Item suggestions
    suggestions.push({
      id: 'sug-1',
      type: 'item',
      title: 'Organic Milk',
      description: 'You buy this weekly',
      relevanceScore: 95,
      reason: 'Regular purchase pattern',
      data: { itemId: 'milk-organic', price: 4.99, category: 'Dairy' },
    });

    suggestions.push({
      id: 'sug-2',
      type: 'deal',
      title: '20% off Coffee Beans',
      description: 'Your favorite brand is on sale',
      relevanceScore: 88,
      reason: 'Matches your preferences',
      data: { originalPrice: 12.99, salePrice: 10.39, savings: 2.60 },
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    suggestions.push({
      id: 'sug-3',
      type: 'recipe',
      title: 'Quick Pasta Dinner',
      description: 'Based on items in your pantry',
      relevanceScore: 82,
      reason: 'Have most ingredients',
      data: { 
        missingIngredients: ['Basil', 'Parmesan'],
        prepTime: 20,
        difficulty: 'easy',
      },
    });

    suggestions.push({
      id: 'sug-4',
      type: 'category',
      title: 'Produce Running Low',
      description: 'Time to stock up on fruits and vegetables',
      relevanceScore: 75,
      reason: 'Purchase cycle suggests restock',
      data: { category: 'Produce', lastPurchased: '10 days ago' },
    });

    suggestions.push({
      id: 'sug-5',
      type: 'store',
      title: 'New Whole Foods nearby',
      description: 'Matches your organic preferences',
      relevanceScore: 70,
      reason: 'Location and preferences',
      data: { storeId: 'wholefoods-123', distance: 1.2 },
    });

    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  // Get trending items
  async getTrendingItems(category?: string): Promise<TrendingItem[]> {
    const items: TrendingItem[] = [
      {
        itemName: 'Oat Milk',
        category: 'Dairy Alternatives',
        popularityScore: 92,
        trending: 'up',
        usersPurchasing: 1543,
        priceRange: { min: 3.99, max: 5.99 },
        tags: ['Vegan', 'Lactose-free', 'Sustainable'],
      },
      {
        itemName: 'Air Fryer',
        category: 'Kitchen Appliances',
        popularityScore: 88,
        trending: 'up',
        usersPurchasing: 892,
        priceRange: { min: 49.99, max: 129.99 },
        tags: ['Healthy', 'Convenient', 'Popular'],
      },
      {
        itemName: 'Kombucha',
        category: 'Beverages',
        popularityScore: 85,
        trending: 'stable',
        usersPurchasing: 745,
        priceRange: { min: 2.99, max: 4.99 },
        tags: ['Probiotic', 'Health', 'Trending'],
      },
      {
        itemName: 'Plant-based Burger',
        category: 'Meat Alternatives',
        popularityScore: 81,
        trending: 'up',
        usersPurchasing: 1123,
        priceRange: { min: 5.99, max: 8.99 },
        tags: ['Vegan', 'Protein', 'Sustainable'],
      },
      {
        itemName: 'Avocado Toast Kit',
        category: 'Breakfast',
        popularityScore: 76,
        trending: 'down',
        usersPurchasing: 534,
        priceRange: { min: 6.99, max: 9.99 },
        tags: ['Breakfast', 'Quick', 'Healthy'],
      },
    ];

    if (category) {
      return items.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
    }

    return items;
  }

  // Get social recommendations
  async getSocialRecommendations(): Promise<SocialRecommendation[]> {
    return [
      {
        itemName: 'Organic Honey',
        recommendedBy: ['Sarah', 'Mike', 'Alex'],
        friendCount: 3,
        averageRating: 4.7,
        commonUseCase: 'Morning tea',
        lastPurchased: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'Greek Yogurt',
        recommendedBy: ['Jamie', 'Pat'],
        friendCount: 2,
        averageRating: 4.5,
        commonUseCase: 'Breakfast',
        lastPurchased: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Get category suggestions
  async getCategorySuggestions(): Promise<CategorySuggestion[]> {
    const now = new Date();
    
    return [
      {
        category: 'Produce',
        confidence: 85,
        itemCount: 12,
        averagePrice: 15.50,
        topItems: ['Apples', 'Bananas', 'Spinach', 'Tomatoes'],
        reason: 'Last purchased 8 days ago',
      },
      {
        category: 'Dairy',
        confidence: 92,
        itemCount: 5,
        averagePrice: 12.30,
        topItems: ['Milk', 'Eggs', 'Yogurt'],
        reason: 'Weekly purchase pattern',
      },
      {
        category: 'Pantry Staples',
        confidence: 70,
        itemCount: 8,
        averagePrice: 25.00,
        topItems: ['Rice', 'Pasta', 'Canned Beans', 'Olive Oil'],
        reason: 'Monthly restock due',
      },
    ];
  }

  // Get store recommendations
  async getStoreRecommendations(userLocation: { lat: number; lng: number }): Promise<StoreRecommendation[]> {
    return [
      {
        storeId: 'wholefoods-001',
        storeName: 'Whole Foods Market',
        matchScore: 95,
        reasons: ['Organic preferences', 'Health-conscious', 'Quality produce'],
        estimatedSavings: 0,
        distance: 1.8,
        specialties: ['Organic', 'Local', 'Specialty'],
      },
      {
        storeId: 'traderjoes-001',
        storeName: "Trader Joe's",
        matchScore: 88,
        reasons: ['Budget-friendly organic', 'Unique items', 'Quick shopping'],
        estimatedSavings: 15.50,
        distance: 2.3,
        specialties: ['Value', 'Private label', 'Frozen foods'],
      },
      {
        storeId: 'safeway-001',
        storeName: 'Safeway',
        matchScore: 75,
        reasons: ['Convenient location', 'Regular deals', 'Full selection'],
        estimatedSavings: 8.25,
        distance: 0.9,
        specialties: ['Groceries', 'Pharmacy', 'Deli'],
      },
    ];
  }

  // Get user preferences
  async getUserPreferences(): Promise<UserPreference[]> {
    return [
      {
        category: 'Dairy',
        frequency: 7, // days between purchases
        averageSpend: 15.50,
        preferredBrands: ['Organic Valley', 'Horizon'],
        dietaryRestrictions: [],
        lastPurchased: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        category: 'Produce',
        frequency: 5,
        averageSpend: 22.00,
        preferredBrands: [],
        dietaryRestrictions: [],
        lastPurchased: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        category: 'Coffee & Tea',
        frequency: 14,
        averageSpend: 18.00,
        preferredBrands: ['Starbucks', 'Peet\'s'],
        dietaryRestrictions: [],
        lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Update user preference
  async updatePreference(category: string, data: Partial<UserPreference>): Promise<void> {
    // In real app, update database
    console.log(`Updated preference for ${category}:`, data);
  }

  // Get personalized deals
  async getPersonalizedDeals(): Promise<{
    itemName: string;
    originalPrice: number;
    salePrice: number;
    savings: number;
    relevance: number;
    reason: string;
  }[]> {
    return [
      {
        itemName: 'Organic Coffee Beans',
        originalPrice: 12.99,
        salePrice: 9.99,
        savings: 3.00,
        relevance: 95,
        reason: 'You buy this monthly',
      },
      {
        itemName: 'Greek Yogurt 4-pack',
        originalPrice: 5.99,
        salePrice: 4.49,
        savings: 1.50,
        relevance: 88,
        reason: 'Your preferred brand',
      },
      {
        itemName: 'Organic Spinach',
        originalPrice: 4.99,
        salePrice: 3.99,
        savings: 1.00,
        relevance: 82,
        reason: 'Matches your healthy eating pattern',
      },
    ];
  }

  // Get shopping insights
  async getShoppingInsights(): Promise<{
    totalSaved: number;
    averageBasket: number;
    topCategories: { category: string; percentage: number }[];
    monthlyTrend: 'increasing' | 'decreasing' | 'stable';
    healthScore: number;
    ecoScore: number;
  }> {
    return {
      totalSaved: 145.50,
      averageBasket: 68.25,
      topCategories: [
        { category: 'Produce', percentage: 28 },
        { category: 'Dairy', percentage: 18 },
        { category: 'Meat', percentage: 15 },
        { category: 'Pantry', percentage: 12 },
      ],
      monthlyTrend: 'stable',
      healthScore: 82,
      ecoScore: 75,
    };
  }

  // Track user interaction
  async trackInteraction(type: string, itemId: string, action: 'view' | 'click' | 'purchase' | 'ignore'): Promise<void> {
    // In real app, send to analytics
    console.log(`Tracked: ${action} on ${type} ${itemId}`);
  }
}

export default new DynamicUserContentService();
