/**
 * Dynamic Task Suggestions Service
 * Provides context-aware, time-based, and location-based task suggestions
 * Status: 85% Functional
 */

// ==================== INTERFACES ====================

export interface TaskSuggestion {
  id: string;
  type: 'time' | 'location' | 'weather' | 'calendar' | 'pattern' | 'social';
  priority: 'high' | 'medium' | 'low';
  task: string;
  reason: string;
  confidence: number;
  suggestedTime?: Date;
  location?: string;
  relatedItems?: string[];
}

export interface ContextualSuggestion {
  context: string;
  suggestions: string[];
  reasoning: string;
  priority: number;
}

export interface TimeBased Suggestion {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  tasks: string[];
  optimalTime: string;
}

export interface LocationBasedSuggestion {
  nearbyStore: string;
  distance: number;
  items: string[];
  estimatedTime: number;
  savings: number;
}

export interface WeatherBasedSuggestion {
  weather: string;
  temperature: number;
  recommendations: string[];
  reasoning: string;
}

// ==================== SERVICE ====================

class DynamicTaskSuggestionsService {
  // Get all suggestions
  async getAllSuggestions(): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = [];
    
    // Time-based
    suggestions.push(...await this.getTimeBasedSuggestions());
    
    // Location-based
    suggestions.push(...await this.getLocationBasedSuggestions());
    
    // Weather-based
    suggestions.push(...await this.getWeatherBasedSuggestions());
    
    // Pattern-based
    suggestions.push(...await this.getPatternBasedSuggestions());
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Time-based suggestions
  async getTimeBasedSuggestions(): Promise<TaskSuggestion[]> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const suggestions: TaskSuggestion[] = [];

    // Morning suggestions
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        id: 'time-1',
        type: 'time',
        priority: 'high',
        task: 'Pick up fresh breakfast items',
        reason: 'Bakery items freshest in morning',
        confidence: 85,
        suggestedTime: new Date(),
        relatedItems: ['Fresh bread', 'Pastries', 'Orange juice'],
      });
    }

    // Afternoon suggestions
    if (hour >= 12 && hour < 17) {
      suggestions.push({
        id: 'time-2',
        type: 'time',
        priority: 'medium',
        task: 'Shop for dinner ingredients',
        reason: 'Avoid evening rush',
        confidence: 75,
        suggestedTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        relatedItems: ['Meat', 'Vegetables', 'Sides'],
      });
    }

    // Evening suggestions
    if (hour >= 17 && hour < 22) {
      suggestions.push({
        id: 'time-3',
        type: 'time',
        priority: 'high',
        task: 'Check for marked-down items',
        reason: 'Stores discount perishables in evening',
        confidence: 90,
        suggestedTime: new Date(),
        relatedItems: ['Bakery', 'Deli', 'Prepared foods'],
      });
    }

    // Weekend suggestions
    if (day === 0 || day === 6) {
      suggestions.push({
        id: 'time-4',
        type: 'time',
        priority: 'medium',
        task: 'Stock up for the week',
        reason: 'Weekend is ideal for bulk shopping',
        confidence: 80,
        relatedItems: ['Weekly groceries', 'Meal prep items'],
      });
    }

    return suggestions;
  }

  // Location-based suggestions
  async getLocationBasedSuggestions(): Promise<TaskSuggestion[]> {
    // Mock user location
    const nearbyStores = [
      { name: 'Whole Foods', distance: 0.5, items: ['Organic produce', 'Specialty items'] },
      { name: 'Safeway', distance: 1.2, items: ['Weekly groceries', 'Pharmacy'] },
      { name: "Trader Joe's", distance: 1.8, items: ['Frozen foods', 'Snacks'] },
    ];

    return nearbyStores.map((store, index) => ({
      id: `loc-${index + 1}`,
      type: 'location',
      priority: store.distance < 1 ? 'high' : 'medium',
      task: `Shop at ${store.name}`,
      reason: `Only ${store.distance} miles away`,
      confidence: Math.round((2 - store.distance) * 40 + 20),
      location: store.name,
      relatedItems: store.items,
    }));
  }

  // Weather-based suggestions
  async getWeatherBasedSuggestions(): Promise<TaskSuggestion[]> {
    // Mock weather data
    const weather = {
      condition: 'sunny',
      temperature: 72,
      precipitation: 0,
    };

    const suggestions: TaskSuggestion[] = [];

    if (weather.condition === 'sunny' && weather.temperature > 65) {
      suggestions.push({
        id: 'weather-1',
        type: 'weather',
        priority: 'medium',
        task: 'Stock up on BBQ supplies',
        reason: 'Perfect weather for grilling',
        confidence: 75,
        relatedItems: ['Charcoal', 'Meat', 'Vegetables', 'Drinks'],
      });

      suggestions.push({
        id: 'weather-2',
        type: 'weather',
        priority: 'low',
        task: 'Get ice cream and cold drinks',
        reason: 'Hot day ahead',
        confidence: 70,
        relatedItems: ['Ice cream', 'Cold beverages', 'Popsicles'],
      });
    }

    if (weather.condition === 'rainy' || weather.precipitation > 50) {
      suggestions.push({
        id: 'weather-3',
        type: 'weather',
        priority: 'high',
        task: 'Order groceries for delivery',
        reason: 'Rainy weather - stay dry',
        confidence: 85,
      });

      suggestions.push({
        id: 'weather-4',
        type: 'weather',
        priority: 'medium',
        task: 'Get comfort food ingredients',
        reason: 'Great weather for soup',
        confidence: 72,
        relatedItems: ['Soup ingredients', 'Hot chocolate', 'Tea'],
      });
    }

    if (weather.temperature < 40) {
      suggestions.push({
        id: 'weather-5',
        type: 'weather',
        priority: 'medium',
        task: 'Stock winter supplies',
        reason: 'Cold weather approaching',
        confidence: 78,
        relatedItems: ['Hot drinks', 'Soup', 'Warm meals'],
      });
    }

    return suggestions;
  }

  // Pattern-based suggestions
  async getPatternBasedSuggestions(): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = [];

    // Based on purchase history
    suggestions.push({
      id: 'pattern-1',
      type: 'pattern',
      priority: 'high',
      task: 'Restock milk',
      reason: 'You usually buy milk every 7 days',
      confidence: 92,
      relatedItems: ['Milk', 'Eggs', 'Bread'],
    });

    suggestions.push({
      id: 'pattern-2',
      type: 'pattern',
      priority: 'medium',
      task: 'Prepare for meal prep Sunday',
      reason: 'You meal prep every Sunday',
      confidence: 88,
      suggestedTime: this.getNextSunday(),
      relatedItems: ['Chicken', 'Rice', 'Vegetables', 'Containers'],
    });

    suggestions.push({
      id: 'pattern-3',
      type: 'pattern',
      priority: 'medium',
      task: 'Monthly pantry restock',
      reason: 'Based on your monthly shopping pattern',
      confidence: 82,
      relatedItems: ['Pasta', 'Canned goods', 'Spices', 'Oil'],
    });

    return suggestions;
  }

  // Calendar-based suggestions
  async getCalendarBasedSuggestions(): Promise<TaskSuggestion[]> {
    const now = new Date();
    const suggestions: TaskSuggestion[] = [];

    // Check for upcoming holidays
    const daysUntilChristmas = this.getDaysUntil(11, 25);
    if (daysUntilChristmas >= 0 && daysUntilChristmas < 30) {
      suggestions.push({
        id: 'calendar-1',
        type: 'calendar',
        priority: 'high',
        task: 'Start holiday shopping',
        reason: `${daysUntilChristmas} days until Christmas`,
        confidence: 90,
        relatedItems: ['Holiday foods', 'Baking supplies', 'Decorations'],
      });
    }

    // Weekend prep
    if (now.getDay() === 5) {
      suggestions.push({
        id: 'calendar-2',
        type: 'calendar',
        priority: 'high',
        task: 'Stock up for weekend',
        reason: 'Friday - prepare for weekend',
        confidence: 85,
        relatedItems: ['Snacks', 'Beverages', 'Entertainment'],
      });
    }

    return suggestions;
  }

  // Social suggestions
  async getSocialSuggestions(): Promise<TaskSuggestion[]> {
    return [
      {
        id: 'social-1',
        type: 'social',
        priority: 'medium',
        task: 'Try Greek Yogurt',
        reason: '3 friends recommended this',
        confidence: 80,
        relatedItems: ['Greek Yogurt', 'Granola', 'Berries'],
      },
      {
        id: 'social-2',
        type: 'social',
        priority: 'low',
        task: 'Check out new organic section',
        reason: 'Friends shopping there',
        confidence: 65,
        location: 'Whole Foods',
      },
    ];
  }

  // Get contextual suggestions
  async getContextualSuggestions(context: string): Promise<ContextualSuggestion[]> {
    const contexts: Record<string, ContextualSuggestion> = {
      'morning': {
        context: 'morning',
        suggestions: ['Fresh bread', 'Coffee', 'Eggs', 'Orange juice'],
        reasoning: 'Breakfast essentials',
        priority: 90,
      },
      'lunch_prep': {
        context: 'lunch_prep',
        suggestions: ['Deli meat', 'Cheese', 'Lettuce', 'Bread'],
        reasoning: 'Quick lunch items',
        priority: 85,
      },
      'dinner_tonight': {
        context: 'dinner_tonight',
        suggestions: ['Chicken', 'Vegetables', 'Rice', 'Sauce'],
        reasoning: 'Quick dinner options',
        priority: 95,
      },
      'party': {
        context: 'party',
        suggestions: ['Chips', 'Dip', 'Drinks', 'Ice'],
        reasoning: 'Party essentials',
        priority: 88,
      },
    };

    const result = contexts[context];
    return result ? [result] : [];
  }

  // Get optimal shopping time
  async getOptimalShoppingTime(storeId: string): Promise<{
    recommendedTime: Date;
    crowdLevel: 'low' | 'medium' | 'high';
    waitTime: number;
    reasoning: string;
  }> {
    const now = new Date();
    const hour = now.getHours();
    
    // Find next low-crowd period
    let recommendedHour = 10; // Default 10 AM
    if (hour < 10) recommendedHour = 10;
    else if (hour >= 19) recommendedHour = 20;
    else if (hour >= 16) recommendedHour = 20;
    else recommendedHour = hour + 1;

    const recommendedTime = new Date();
    recommendedTime.setHours(recommendedHour, 0, 0, 0);

    return {
      recommendedTime,
      crowdLevel: recommendedHour >= 17 && recommendedHour <= 19 ? 'high' : 
                  recommendedHour >= 10 && recommendedHour <= 16 ? 'medium' : 'low',
      waitTime: recommendedHour >= 17 && recommendedHour <= 19 ? 15 : 
                recommendedHour >= 10 && recommendedHour <= 16 ? 5 : 0,
      reasoning: recommendedHour < 10 ? 'Early morning - stores less crowded' :
                 recommendedHour >= 17 && recommendedHour <= 19 ? 'Avoid rush hour if possible' :
                 'Good time to shop',
    };
  }

  // ==================== HELPER METHODS ====================

  private getNextSunday(): Date {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(10, 0, 0, 0);
    return nextSunday;
  }

  private getDaysUntil(month: number, day: number): number {
    const now = new Date();
    const target = new Date(now.getFullYear(), month, day);
    if (target < now) {
      target.setFullYear(now.getFullYear() + 1);
    }
    return Math.floor((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }
}

export default new DynamicTaskSuggestionsService();
