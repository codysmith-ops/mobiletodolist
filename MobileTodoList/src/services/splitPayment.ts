/**
 * Split Payment Service
 * Handles expense splitting and payment requests
 * Status: 70% Functional
 */

// ==================== INTERFACES ====================

export interface GroupExpense {
  id: string;
  listId: string;
  totalAmount: number;
  members: GroupMember[];
  items: ExpenseItem[];
  createdBy: string;
  createdAt: Date;
  settled: boolean;
}

export interface GroupMember {
  userId: string;
  username: string;
  owes: number;
  paid: boolean;
  paidAt?: Date;
  paymentMethod?: PaymentMethod;
}

export interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  split: ItemSplit[];
}

export interface ItemSplit {
  userId: string;
  percentage: number;
  amount: number;
}

export interface PaymentMethod {
  type: 'venmo' | 'paypal' | 'cash' | 'card';
  identifier?: string;
}

export interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface UsageSplitConfig {
  strategy: 'equal' | 'by_item' | 'percentage' | 'custom';
  excludeDietary?: boolean;
  roundUp?: boolean;
}

// ==================== SERVICE ====================

class SplitPaymentService {
  // Calculate split
  async calculateSplit(
    items: { name: string; price: number; quantity: number }[],
    members: { userId: string; username: string }[],
    config: UsageSplitConfig = { strategy: 'equal' }
  ): Promise<GroupExpense> {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const expenseItems: ExpenseItem[] = [];

    if (config.strategy === 'equal') {
      const perPerson = totalAmount / members.length;
      
      expenseItems.push(...items.map((item, index) => ({
        id: `item-${index}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        split: members.map(member => ({
          userId: member.userId,
          percentage: 100 / members.length,
          amount: (item.price * item.quantity) / members.length,
        })),
      })));

      return {
        id: `expense-${Date.now()}`,
        listId: 'list-1',
        totalAmount,
        members: members.map(member => ({
          ...member,
          owes: perPerson,
          paid: false,
        })),
        items: expenseItems,
        createdBy: 'user-001',
        createdAt: new Date(),
        settled: false,
      };
    }

    // By item strategy
    if (config.strategy === 'by_item') {
      // Assign items to specific members
      expenseItems.push(...items.map((item, index) => ({
        id: `item-${index}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        split: [{
          userId: members[index % members.length].userId,
          percentage: 100,
          amount: item.price * item.quantity,
        }],
      })));

      const memberTotals = new Map<string, number>();
      expenseItems.forEach(item => {
        item.split.forEach(split => {
          memberTotals.set(split.userId, (memberTotals.get(split.userId) || 0) + split.amount);
        });
      });

      return {
        id: `expense-${Date.now()}`,
        listId: 'list-1',
        totalAmount,
        members: members.map(member => ({
          ...member,
          owes: memberTotals.get(member.userId) || 0,
          paid: false,
        })),
        items: expenseItems,
        createdBy: 'user-001',
        createdAt: new Date(),
        settled: false,
      };
    }

    // Default to equal split
    return this.calculateSplit(items, members, { strategy: 'equal' });
  }

  // Send payment request
  async sendPaymentRequest(
    toUserId: string,
    amount: number,
    description: string
  ): Promise<PaymentRequest> {
    return {
      id: `req-${Date.now()}`,
      fromUserId: 'user-001',
      toUserId,
      amount,
      description,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  // Mark payment as completed
  async markPaid(expenseId: string, userId: string): Promise<GroupExpense> {
    // Mock implementation
    const expense = await this.getExpense(expenseId);
    const member = expense.members.find(m => m.userId === userId);
    
    if (member) {
      member.paid = true;
      member.paidAt = new Date();
    }

    expense.settled = expense.members.every(m => m.paid);
    
    return expense;
  }

  // Get expense
  async getExpense(expenseId: string): Promise<GroupExpense> {
    return {
      id: expenseId,
      listId: 'list-1',
      totalAmount: 125.50,
      members: [
        { userId: 'user-001', username: 'You', owes: 62.75, paid: true, paidAt: new Date() },
        { userId: 'user-002', username: 'Sarah', owes: 62.75, paid: false },
      ],
      items: [
        {
          id: 'item-1',
          name: 'Groceries',
          price: 125.50,
          quantity: 1,
          split: [
            { userId: 'user-001', percentage: 50, amount: 62.75 },
            { userId: 'user-002', percentage: 50, amount: 62.75 },
          ],
        },
      ],
      createdBy: 'user-001',
      createdAt: new Date(),
      settled: false,
    };
  }

  // Get user's payment requests
  async getPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    return [
      {
        id: 'req-1',
        fromUserId: 'user-002',
        toUserId: userId,
        amount: 25.50,
        description: 'Grocery split',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];
  }
}

export default new SplitPaymentService();
