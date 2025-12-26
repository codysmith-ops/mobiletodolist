/**
 * AI Predictions Service
 * Provides ML-based purchase predictions, smart suggestions, and demand forecasting
 */

import axios from 'axios';
import { Platform } from 'react-native';

export interface PurchasePrediction {
  productId: string;
  productName: string;
  category: string;
  confidence: number; // 0-1
  predictedDate: Date;
  reasoning: string[];
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'seasonal';
}

export interface SmartSuggestion {
  id: string;
  type: 'complement' | 'substitute' | 'bundle' | 'seasonal';
  productName: string;
  reason: string;
  relevanceScore: number;
  savings?: number;
  store?: string;
}

export interface DemandForecast {
  productId: string;
  expectedDemand: 'low' | 'medium' | 'high' | 'critical';
  stockoutRisk: number; // 0-100
  recommendedPurchaseDate: Date;
  priceVolatility: number; // 0-100
}

export interface UserShoppingPattern {
  averageBasketSize: number;
  preferredCategories: string[];
  shoppingFrequency: number; // days between shops
  peakShoppingDays: string[];
  averageSpend: number;
  budgetCategory: 'budget' | 'moderate' | 'premium';
}

interface PurchaseHistory {
  productId: string;
  productName: string;
  category: string;
  purchaseDate: Date;
  quantity: number;
  price: number;
  store: string;
}

// Simulated AI/ML endpoints (replace with real OpenAI/custom ML API)
const AI_API_BASE = process.env.OPENAI_API_KEY 
  ? 'https://api.openai.com/v1'
  : null;

/**
 * Analyze purchase history to predict future needs
 */
export const predictNextPurchases = async (
  purchaseHistory: PurchaseHistory[],
  lookAheadDays: number = 30
): Promise<PurchasePrediction[]> => {
  try {
    // Group purchases by product
    const productPurchases = new Map<string, PurchaseHistory[]>();
    purchaseHistory.forEach(purchase => {
      const key = purchase.productId || purchase.productName;
      if (!productPurchases.has(key)) {
        productPurchases.set(key, []);
      }
      productPurchases.get(key)!.push(purchase);
    });

    const predictions: PurchasePrediction[] = [];

    // Analyze each product's purchase pattern
    for (const [productKey, purchases] of productPurchases.entries()) {
      if (purchases.length < 2) continue; // Need at least 2 purchases to predict

      // Sort by date
      purchases.sort((a, b) => 
        new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
      );

      // Calculate average days between purchases
      const intervals: number[] = [];
      for (let i = 1; i < purchases.length; i++) {
        const days = Math.floor(
          (new Date(purchases[i].purchaseDate).getTime() - 
           new Date(purchases[i-1].purchaseDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        intervals.push(days);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const stdDev = Math.sqrt(
        intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / 
        intervals.length
      );

      // Confidence based on consistency of purchase pattern
      const confidence = Math.max(0, 1 - (stdDev / avgInterval));

      // Predict next purchase date
      const lastPurchase = purchases[purchases.length - 1];
      const predictedDate = new Date(
        new Date(lastPurchase.purchaseDate).getTime() + 
        avgInterval * 24 * 60 * 60 * 1000
      );

      // Only include if within lookAhead window
      const daysUntil = Math.floor(
        (predictedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil >= 0 && daysUntil <= lookAheadDays && confidence > 0.3) {
        const frequency = 
          avgInterval <= 10 ? 'weekly' :
          avgInterval <= 20 ? 'biweekly' :
          avgInterval <= 40 ? 'monthly' : 'seasonal';

        predictions.push({
          productId: lastPurchase.productId,
          productName: lastPurchase.productName,
          category: lastPurchase.category,
          confidence,
          predictedDate,
          reasoning: [
            `Purchased ${purchases.length} times in the past`,
            `Average ${Math.round(avgInterval)} days between purchases`,
            `${daysUntil} days until predicted need`,
            confidence > 0.7 ? 'High confidence pattern' : 'Moderate confidence'
          ],
          frequency
        });
      }
    }

    // Sort by predicted date (soonest first)
    return predictions.sort((a, b) => 
      a.predictedDate.getTime() - b.predictedDate.getTime()
    );
  } catch (error) {
    console.error('Error predicting purchases:', error);
    return [];
  }
};

/**
 * Generate smart product suggestions based on current cart/list
 */
export const generateSmartSuggestions = async (
  currentItems: string[],
  purchaseHistory: PurchaseHistory[]
): Promise<SmartSuggestion[]> => {
  const suggestions: SmartSuggestion[] = [];

  // Common product complements
  const complements: Record<string, string[]> = {
    'milk': ['cereal', 'coffee', 'cookies'],
    'bread': ['butter', 'jam', 'peanut butter', 'deli meat'],
    'pasta': ['pasta sauce', 'parmesan cheese', 'garlic bread'],
    'chicken': ['vegetables', 'rice', 'spices', 'olive oil'],
    'coffee': ['milk', 'sugar', 'creamer'],
    'chips': ['salsa', 'guacamole', 'dip'],
    'hamburger': ['buns', 'lettuce', 'tomato', 'cheese'],
    'hot dogs': ['buns', 'ketchup', 'mustard', 'relish']
  };

  // Generate complement suggestions
  currentItems.forEach((item, idx) => {
    const itemLower = item.toLowerCase();
    Object.keys(complements).forEach(key => {
      if (itemLower.includes(key)) {
        complements[key].forEach(complement => {
          if (!currentItems.some(i => i.toLowerCase().includes(complement))) {
            suggestions.push({
              id: `comp-${idx}-${complement}`,
              type: 'complement',
              productName: complement.charAt(0).toUpperCase() + complement.slice(1),
              reason: `Often purchased with ${key}`,
              relevanceScore: 0.85
            });
          }
        });
      }
    });
  });

  // Seasonal suggestions
  const month = new Date().getMonth();
  const season = 
    month >= 2 && month <= 4 ? 'spring' :
    month >= 5 && month <= 7 ? 'summer' :
    month >= 8 && month <= 10 ? 'fall' : 'winter';

  const seasonalItems: Record<string, string[]> = {
    spring: ['fresh vegetables', 'berries', 'salad greens'],
    summer: ['watermelon', 'ice cream', 'grilling supplies', 'sunscreen'],
    fall: ['pumpkin', 'apples', 'cinnamon', 'soup ingredients'],
    winter: ['hot chocolate', 'soup', 'comfort foods', 'citrus fruits']
  };

  seasonalItems[season].forEach((item, idx) => {
    if (!currentItems.some(i => i.toLowerCase().includes(item.toLowerCase()))) {
      suggestions.push({
        id: `seasonal-${idx}`,
        type: 'seasonal',
        productName: item,
        reason: `Popular ${season} item`,
        relevanceScore: 0.7
      });
    }
  });

  // Bundle deals (simulated)
  if (currentItems.length >= 3) {
    suggestions.push({
      id: 'bundle-1',
      type: 'bundle',
      productName: 'Complete bundle discount',
      reason: 'Buy all items together and save 15%',
      relevanceScore: 0.9,
      savings: 5.99
    });
  }

  // Sort by relevance
  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
};

/**
 * Forecast demand and stockout risk for products
 */
export const forecastDemand = async (
  productId: string,
  historicalData?: any[]
): Promise<DemandForecast> => {
  // Simulate demand forecasting
  const baselineDemand = Math.random();
  
  return {
    productId,
    expectedDemand: 
      baselineDemand > 0.75 ? 'critical' :
      baselineDemand > 0.5 ? 'high' :
      baselineDemand > 0.25 ? 'medium' : 'low',
    stockoutRisk: Math.floor(baselineDemand * 100),
    recommendedPurchaseDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
    priceVolatility: Math.floor(Math.random() * 60) + 20
  };
};

/**
 * Analyze user shopping patterns
 */
export const analyzeShoppingPatterns = async (
  purchaseHistory: PurchaseHistory[]
): Promise<UserShoppingPattern> => {
  if (purchaseHistory.length === 0) {
    return {
      averageBasketSize: 0,
      preferredCategories: [],
      shoppingFrequency: 7,
      peakShoppingDays: ['Saturday'],
      averageSpend: 0,
      budgetCategory: 'moderate'
    };
  }

  // Group by shopping session (same day)
  const sessions = new Map<string, PurchaseHistory[]>();
  purchaseHistory.forEach(purchase => {
    const dateKey = new Date(purchase.purchaseDate).toDateString();
    if (!sessions.has(dateKey)) {
      sessions.set(dateKey, []);
    }
    sessions.get(dateKey)!.push(purchase);
  });

  // Calculate average basket size
  const basketSizes = Array.from(sessions.values()).map(s => s.length);
  const averageBasketSize = basketSizes.reduce((a, b) => a + b, 0) / basketSizes.length;

  // Find preferred categories
  const categoryCount = new Map<string, number>();
  purchaseHistory.forEach(p => {
    categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
  });
  const preferredCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  // Calculate shopping frequency
  const dates = Array.from(sessions.keys()).map(d => new Date(d));
  dates.sort((a, b) => a.getTime() - b.getTime());
  let totalDays = 0;
  for (let i = 1; i < dates.length; i++) {
    totalDays += (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
  }
  const shoppingFrequency = dates.length > 1 ? totalDays / (dates.length - 1) : 7;

  // Find peak shopping days
  const dayCount = new Map<string, number>();
  dates.forEach(date => {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    dayCount.set(day, (dayCount.get(day) || 0) + 1);
  });
  const peakShoppingDays = Array.from(dayCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([day]) => day);

  // Calculate average spend
  const averageSpend = purchaseHistory.reduce((sum, p) => sum + p.price, 0) / sessions.size;

  // Determine budget category
  const budgetCategory = 
    averageSpend < 50 ? 'budget' :
    averageSpend < 150 ? 'moderate' : 'premium';

  return {
    averageBasketSize,
    preferredCategories,
    shoppingFrequency: Math.round(shoppingFrequency),
    peakShoppingDays,
    averageSpend: Math.round(averageSpend * 100) / 100,
    budgetCategory
  };
};

/**
 * Get personalized shopping recommendations using AI
 */
export const getAIRecommendations = async (
  userContext: {
    recentPurchases: string[];
    preferences: string[];
    budget?: number;
    dietaryRestrictions?: string[];
  }
): Promise<SmartSuggestion[]> => {
  // If OpenAI API is available, use it
  if (AI_API_BASE && process.env.OPENAI_API_KEY) {
    try {
      const prompt = `Given a user who recently purchased: ${userContext.recentPurchases.join(', ')}, 
      with preferences for ${userContext.preferences.join(', ')}, 
      ${userContext.budget ? `and a budget of $${userContext.budget}` : ''},
      ${userContext.dietaryRestrictions ? `with dietary restrictions: ${userContext.dietaryRestrictions.join(', ')}` : ''},
      suggest 5 complementary products they might need. Format as JSON array with: productName, reason, estimatedPrice.`;

      const response = await axios.post(
        `${AI_API_BASE}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful shopping assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiSuggestions = JSON.parse(response.data.choices[0].message.content);
      return aiSuggestions.map((s: any, idx: number) => ({
        id: `ai-${idx}`,
        type: 'complement' as const,
        productName: s.productName,
        reason: s.reason,
        relevanceScore: 0.95,
        savings: s.estimatedPrice
      }));
    } catch (error) {
      console.error('AI recommendations error:', error);
      // Fall through to mock data
    }
  }

  // Fallback to rule-based recommendations
  return generateSmartSuggestions(userContext.recentPurchases, []);
};

export default {
  predictNextPurchases,
  generateSmartSuggestions,
  forecastDemand,
  analyzeShoppingPatterns,
  getAIRecommendations
};
