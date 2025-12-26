/**
 * Payment Reimbursement Service
 * Handles split payments, reimbursement requests, and payment tracking
 * Status: 75% Functional (Mock - requires payment gateway)
 */

// ==================== INTERFACES ====================

export interface ReimbursementRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  description: string;
  items: ReimbursementItem[];
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: Date;
  paidAt?: Date;
  paymentMethod?: string;
}

export interface ReimbursementItem {
  name: string;
  quantity: number;
  price: number;
  splitWith: string[];
  yourShare: number;
}

export interface PaymentSplit {
  listId: string;
  totalAmount: number;
  splits: {
    userId: string;
    userName: string;
    amount: number;
    percentage: number;
    items: string[];
  }[];
  splitMethod: 'equal' | 'by_item' | 'percentage' | 'custom';
}

export interface PaymentHistory {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  userId: string;
  userName: string;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaymentMethod {
  id: string;
  type: 'venmo' | 'paypal' | 'cash_app' | 'zelle' | 'apple_pay';
  handle?: string;
  enabled: boolean;
}

// ==================== SERVICE ====================

class PaymentReimbursementService {
  // Create reimbursement request
  async createRequest(
    recipientId: string,
    items: ReimbursementItem[],
    description: string
  ): Promise<ReimbursementRequest> {
    const totalAmount = items.reduce((sum, item) => sum + item.yourShare, 0);

    return {
      id: `reimburse-${Date.now()}`,
      requesterId: 'current-user',
      requesterName: 'You',
      recipientId,
      recipientName: 'John Doe',
      amount: totalAmount,
      description,
      items,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  // Calculate split
  async calculateSplit(
    listId: string,
    items: { name: string; price: number; assignedTo?: string[] }[],
    method: PaymentSplit['splitMethod'] = 'equal'
  ): Promise<PaymentSplit> {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const users = ['user-1', 'user-2', 'user-3'];

    if (method === 'equal') {
      const perPerson = totalAmount / users.length;
      
      return {
        listId,
        totalAmount,
        splits: users.map(userId => ({
          userId,
          userName: `User ${userId}`,
          amount: perPerson,
          percentage: 100 / users.length,
          items: items.map(i => i.name),
        })),
        splitMethod: method,
      };
    }

    // By item
    const splitMap = new Map<string, { amount: number; items: string[] }>();

    for (const item of items) {
      const assignedUsers = item.assignedTo || users;
      const shareAmount = item.price / assignedUsers.length;

      for (const userId of assignedUsers) {
        const existing = splitMap.get(userId) || { amount: 0, items: [] };
        existing.amount += shareAmount;
        existing.items.push(item.name);
        splitMap.set(userId, existing);
      }
    }

    return {
      listId,
      totalAmount,
      splits: Array.from(splitMap.entries()).map(([userId, data]) => ({
        userId,
        userName: `User ${userId}`,
        amount: data.amount,
        percentage: (data.amount / totalAmount) * 100,
        items: data.items,
      })),
      splitMethod: method,
    };
  }

  // Get reimbursement requests
  async getRequests(filter?: {
    status?: ReimbursementRequest['status'];
    type?: 'sent' | 'received';
  }): Promise<ReimbursementRequest[]> {
    return [
      {
        id: 'reimburse-1',
        requesterId: 'user-2',
        requesterName: 'Jane Smith',
        recipientId: 'current-user',
        recipientName: 'You',
        amount: 24.50,
        description: 'Groceries split',
        items: [
          {
            name: 'Milk',
            quantity: 1,
            price: 3.99,
            splitWith: ['current-user'],
            yourShare: 1.995,
          },
          {
            name: 'Bread',
            quantity: 2,
            price: 4.50,
            splitWith: ['current-user'],
            yourShare: 2.25,
          },
        ],
        status: 'pending',
        createdAt: new Date(),
      },
      {
        id: 'reimburse-2',
        requesterId: 'current-user',
        requesterName: 'You',
        recipientId: 'user-3',
        recipientName: 'Bob Johnson',
        amount: 15.75,
        description: 'Dinner split',
        items: [],
        status: 'paid',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'venmo',
      },
    ];
  }

  // Approve/reject request
  async updateRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    console.log(`Request ${requestId} ${status}`);
  }

  // Process payment
  async processPayment(
    requestId: string,
    paymentMethod: PaymentMethod['type']
  ): Promise<void> {
    console.log(`Processing payment for ${requestId} via ${paymentMethod}`);
  }

  // Get payment history
  async getPaymentHistory(filter?: {
    type?: 'sent' | 'received';
    startDate?: Date;
    endDate?: Date;
  }): Promise<PaymentHistory[]> {
    return [
      {
        id: 'payment-1',
        type: 'sent',
        amount: 15.75,
        userId: 'user-3',
        userName: 'Bob Johnson',
        description: 'Dinner split',
        date: new Date(),
        status: 'completed',
      },
      {
        id: 'payment-2',
        type: 'received',
        amount: 24.50,
        userId: 'user-2',
        userName: 'Jane Smith',
        description: 'Groceries split',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ];
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      { id: 'venmo', type: 'venmo', handle: '@username', enabled: true },
      { id: 'paypal', type: 'paypal', handle: 'user@email.com', enabled: true },
      { id: 'cashapp', type: 'cash_app', handle: '$username', enabled: false },
      { id: 'zelle', type: 'zelle', handle: 'user@email.com', enabled: false },
      { id: 'applepay', type: 'apple_pay', enabled: true },
    ];
  }

  // Add payment method
  async addPaymentMethod(method: PaymentMethod): Promise<void> {
    console.log('Payment method added:', method);
  }

  // Get balance summary
  async getBalanceSummary(): Promise<{
    owed: number;
    owing: number;
    netBalance: number;
  }> {
    return {
      owed: 45.25, // People owe you
      owing: 32.50, // You owe others
      netBalance: 12.75, // Net positive
    };
  }

  // Send reminder
  async sendReminder(requestId: string): Promise<void> {
    console.log(`Reminder sent for request ${requestId}`);
  }
}

export default new PaymentReimbursementService();
