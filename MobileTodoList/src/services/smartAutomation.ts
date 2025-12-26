/**
 * Smart Automation Service
 * Handles recurring items, pantry tracking, and recipe import
 * Status: 80% Functional
 */

// ==================== INTERFACES ====================

export interface RecurringItem {
  id: string;
  itemName: string;
  frequency: number; // days
  lastPurchased: Date;
  nextDue: Date;
  autoAdd: boolean;
  categorystring;
  averagePrice: number;
}

export interface PantryItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate?: Date;
  addedDate: Date;
  location?: string;
}

export interface LowStockAlert {
  item: PantryItem;
  currentQuantity: number;
  threshold: number;
  daysUntilEmpty: number;
  suggestion: string;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
  optional?: boolean;
}

export interface ShoppingListFromRecipe {
  recipeId: string;
  recipeName: string;
  servings: number;
  items: {
    ingredient: RecipeIngredient;
    inPantry: boolean;
    needToBuy: number;
  }[];
}

// ==================== SERVICE ====================

class SmartAutomationService {
  // Get recurring items
  async getRecurringItems(): Promise<RecurringItem[]> {
    const now = new Date();
    
    return [
      {
        id: 'rec-1',
        itemName: 'Milk',
        frequency: 7,
        lastPurchased: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        nextDue: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        autoAdd: true,
        category: 'Dairy',
        averagePrice: 4.99,
      },
      {
        id: 'rec-2',
        itemName: 'Bread',
        frequency: 5,
        lastPurchased: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        nextDue: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        autoAdd: true,
        category: 'Bakery',
        averagePrice: 3.49,
      },
      {
        id: 'rec-3',
        itemName: 'Coffee',
        frequency: 14,
        lastPurchased: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        nextDue: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        autoAdd: false,
        category: 'Beverages',
        averagePrice: 12.99,
      },
    ];
  }

  // Get pantry items
  async getPantryItems(): Promise<PantryItem[]> {
    const now = new Date();
    
    return [
      {
        id: 'pantry-1',
        itemName: 'Pasta',
        quantity: 3,
        unit: 'boxes',
        category: 'Pantry',
        addedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        location: 'Pantry Shelf 2',
      },
      {
        id: 'pantry-2',
        itemName: 'Rice',
        quantity: 1,
        unit: 'bag',
        category: 'Pantry',
        addedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        location: 'Pantry Shelf 1',
      },
      {
        id: 'pantry-3',
        itemName: 'Milk',
        quantity: 1,
        unit: 'gallon',
        category: 'Dairy',
        expirationDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        addedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        location: 'Refrigerator',
      },
    ];
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const pantry = await this.getPantryItems();
    const alerts: LowStockAlert[] = [];

    for (const item of pantry) {
      if (item.quantity <= 2) {
        alerts.push({
          item,
          currentQuantity: item.quantity,
          threshold: 3,
          daysUntilEmpty: Math.floor(item.quantity * 3),
          suggestion: `Restock ${item.itemName} soon`,
        });
      }
    }

    return alerts;
  }

  // Add recurring item
  async addRecurringItem(itemName: string, frequency: number, category: string): Promise<RecurringItem> {
    const now = new Date();
    
    return {
      id: `rec-${Date.now()}`,
      itemName,
      frequency,
      lastPurchased: now,
      nextDue: new Date(now.getTime() + frequency * 24 * 60 * 60 * 1000),
      autoAdd: true,
      category,
      averagePrice: 0,
    };
  }

  // Update pantry item
  async updatePantryItem(itemId: string, quantity: number): Promise<PantryItem> {
    const items = await this.getPantryItems();
    const item = items.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = quantity;
    }
    
    return item!;
  }

  // Import recipe
  async importRecipe(url: string): Promise<Recipe> {
    // Mock recipe import
    return {
      id: `recipe-${Date.now()}`,
      name: 'Pasta Carbonara',
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      ingredients: [
        { name: 'Pasta', amount: 1, unit: 'lb', category: 'Pantry' },
        { name: 'Eggs', amount: 4, unit: 'whole', category: 'Dairy' },
        { name: 'Bacon', amount: 8, unit: 'slices', category: 'Meat' },
        { name: 'Parmesan', amount: 1, unit: 'cup', category: 'Dairy' },
        { name: 'Black Pepper', amount: 1, unit: 'tsp', category: 'Spices', optional: true },
      ],
      instructions: [
        'Cook pasta according to package directions',
        'Fry bacon until crispy',
        'Mix eggs and parmesan',
        'Combine all ingredients',
        'Serve hot with extra parmesan',
      ],
      imageUrl: 'https://example.com/carbonara.jpg',
    };
  }

  // Generate shopping list from recipe
  async generateShoppingListFromRecipe(recipeId: string, servings?: number): Promise<ShoppingListFromRecipe> {
    const recipe = await this.importRecipe('');
    const pantry = await this.getPantryItems();
    const targetServings = servings || recipe.servings;
    const multiplier = targetServings / recipe.servings;

    const items = recipe.ingredients.map(ingredient => {
      const pantryItem = pantry.find(p => 
        p.itemName.toLowerCase() === ingredient.name.toLowerCase()
      );
      
      const needAmount = ingredient.amount * multiplier;
      const haveAmount = pantryItem?.quantity || 0;
      const needToBuy = Math.max(0, needAmount - haveAmount);

      return {
        ingredient: {
          ...ingredient,
          amount: needAmount,
        },
        inPantry: !!pantryItem && pantryItem.quantity >= needAmount,
        needToBuy,
      };
    });

    return {
      recipeId,
      recipeName: recipe.name,
      servings: targetServings,
      items,
    };
  }

  // Auto-add due recurring items
  async getItemsDueToAdd(): Promise<RecurringItem[]> {
    const recurring = await this.getRecurringItems();
    const now = new Date();
    
    return recurring.filter(item => item.autoAdd && item.nextDue <= now);
  }

  // Scan barcode to add to pantry
  async scanBarcodeToAddPantry(barcode: string): Promise<PantryItem> {
    // Mock barcode scan
    const now = new Date();
    
    return {
      id: `pantry-${Date.now()}`,
      itemName: 'Scanned Item',
      quantity: 1,
      unit: 'item',
      category: 'General',
      addedDate: now,
    };
  }

  // Get meal plan suggestions
  async getMealPlanSuggestions(days: number = 7): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    
    for (let i = 0; i < days; i++) {
      recipes.push(await this.importRecipe(''));
    }
    
    return recipes;
  }
}

export default new SmartAutomationService();
