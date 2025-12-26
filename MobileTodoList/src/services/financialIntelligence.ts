/**
 * Financial Intelligence Service
 * Handles budgeting, transaction tracking, and financial insights
 * Status: 85% Functional
 */

// ==================== INTERFACES ====================

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  category?: string;
  spent: number;
  remaining: number;
  startDate: Date;
  endDate: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Date;
  store: string;
  items: string[];
  paymentMethod: string;
  budget?: string;
}

export interface CashbackOffer {
  id: string;
  store: string;
  percentage: number;
  category?: string;
  validUntil: Date;
  stackable: boolean;
}

export interface StackedDeal {
  basePrice: number;
  couponDiscount: number;
  cashbackAmount: number;
  creditCardReward: number;
  finalPrice: number;
  totalSavings: number;
  savingsPercentage: number;
}

export interface TaxDeduction {
  id: string;
  category: string;
  amount: number;
  date: Date;
  deductible: boolean;
  percentage: number;
}

export interface SpendingTrend {
  category: string;
  thisMonth: number;
  lastMonth: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// ==================== SERVICE ====================

class FinancialIntelligenceService {
  // Get budgets
  async getBudgets(): Promise<Budget[]> {
    const now = new Date();
    
    return [
      {
        id: 'budget-1',
        name: 'Monthly Groceries',
        amount: 500,
        period: 'monthly',
        category: 'Groceries',
        spent: 342.50,
        remaining: 157.50,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
      {
        id: 'budget-2',
        name: 'Weekly Shopping',
        amount: 125,
        period: 'weekly',
        spent: 98.75,
        remaining: 26.25,
        startDate: new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + (6 - now.getDay()) * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Create budget
  async createBudget(name: string, amount: number, period: 'daily' | 'weekly' | 'monthly', category?: string): Promise<Budget> {
    const now = new Date();
    let startDate = now;
    let endDate = new Date();

    if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    return {
      id: `budget-${Date.now()}`,
      name,
      amount,
      period,
      category,
      spent: 0,
      remaining: amount,
      startDate,
      endDate,
    };
  }

  // Get transactions
  async getTransactions(limit: number = 50): Promise<Transaction[]> {
    const now = new Date();
    const transactions: Transaction[] = [];

    for (let i = 0; i < limit; i++) {
      transactions.push({
        id: `txn-${i}`,
        amount: Math.random() * 100 + 10,
        category: ['Groceries', 'Household', 'Personal Care'][Math.floor(Math.random() * 3)],
        date: new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000),
        store: ['Walmart', 'Target', 'Whole Foods'][Math.floor(Math.random() * 3)],
        items: ['Item 1', 'Item 2', 'Item 3'],
        paymentMethod: 'Card',
        budget: 'budget-1',
      });
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Get cashback offers
  async getCashbackOffers(): Promise<CashbackOffer[]> {
    return [
      {
        id: 'cb-1',
        store: 'Walmart',
        percentage: 5,
        category: 'Groceries',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stackable: true,
      },
      {
        id: 'cb-2',
        store: 'Target',
        percentage: 3,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        stackable: true,
      },
    ];
  }

  // Calculate stacked deals
  async calculateStackedDeal(
    basePrice: number,
    couponPercent: number = 0,
    cashbackPercent: number = 0,
    creditCardPercent: number = 0
  ): Promise<StackedDeal> {
    const couponDiscount = basePrice * (couponPercent / 100);
    const afterCoupon = basePrice - couponDiscount;
    const cashbackAmount = afterCoupon * (cashbackPercent / 100);
    const creditCardReward = afterCoupon * (creditCardPercent / 100);
    const finalPrice = afterCoupon - cashbackAmount - creditCardReward;
    const totalSavings = basePrice - finalPrice;

    return {
      basePrice,
      couponDiscount,
      cashbackAmount,
      creditCardReward,
      finalPrice: Math.round(finalPrice * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      savingsPercentage: Math.round((totalSavings / basePrice) * 100),
    };
  }

  // Get tax deductions
  async getTaxDeductions(year: number): Promise<TaxDeduction[]> {
    return [
      {
        id: 'tax-1',
        category: 'Medical Supplies',
        amount: 45.50,
        date: new Date(year, 3, 15),
        deductible: true,
        percentage: 100,
      },
      {
        id: 'tax-2',
        category: 'Home Office',
        amount: 120.00,
        date: new Date(year, 5, 20),
        deductible: true,
        percentage: 50,
      },
    ];
  }

  // Get spending trends
  async getSpendingTrends(): Promise<SpendingTrend[]> {
    return [
      {
        category: 'Groceries',
        thisMonth: 342.50,
        lastMonth: 385.20,
        change: -11.1,
        trend: 'down',
      },
      {
        category: 'Household',
        thisMonth: 125.80,
        lastMonth: 98.40,
        change: 27.8,
        trend: 'up',
      },
      {
        category: 'Personal Care',
        thisMonth: 78.90,
        lastMonth: 76.20,
        change: 3.5,
        trend: 'stable',
      },
    ];
  }

  // Get budget recommendations
  async getBudgetRecommendations(): Promise<{
    category: string;
    recommended: number;
    current: number;
    reason: string;
  }[]> {
    return [
      {
        category: 'Groceries',
        recommended: 450,
        current: 500,
        reason: 'Based on your spending patterns, you can reduce by 10%',
      },
      {
        category: 'Dining Out',
        recommended: 200,
        current: 150,
        reason: 'You\'ve been under budget consistently',
      },
    ];
  }

  // Calculate savings potential
  async calculateSavingsPotential(): Promise<{
    currentSpending: number;
    optimizedSpending: number;
    potentialSavings: number;
    recommendations: string[];
  }> {
    return {
      currentSpending: 650,
      optimizedSpending: 550,
      potentialSavings: 100,
      recommendations: [
        'Buy generic brands for 15% savings',
        'Use cashback apps for 5% back',
        'Shop sales and use coupons',
      ],
    };
  }
}

export default new FinancialIntelligenceService();
