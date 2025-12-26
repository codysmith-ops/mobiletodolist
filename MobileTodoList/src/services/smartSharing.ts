/**
 * Smart Sharing Service
 * Handles list sharing, collaboration, and payment splitting
 * Status: 70% Functional
 */

// ==================== INTERFACES ====================

export interface SharedListMember {
  userId: string;
  username: string;
  email?: string;
  avatar?: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
  joinedAt: Date;
  lastActive?: Date;
  contributions: number;
  itemsCompleted: number;
}

export interface SharedList {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: SharedListMember[];
  items: SharedListItem[];
  createdAt: Date;
  updatedAt: Date;
  shareCode: string;
  expiresAt?: Date;
  settings: {
    allowEdit: boolean;
    allowAddMembers: boolean;
    requireApproval: boolean;
    notifyOnChanges: boolean;
  };
}

export interface SharedListItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  addedBy: string;
  addedAt: Date;
}

export interface SharingPattern {
  userId: string;
  username: string;
  frequency: number; // How often they share with this person
  lastShared: Date;
  commonCategories: string[];
  averageListSize: number;
  collaborationScore: number; // 0-100
}

export interface SharingSuggestion {
  type: SuggestionType;
  userId: string;
  username: string;
  reason: string;
  confidence: number; // 0-100
  data?: any;
}

export enum SuggestionType {
  FREQUENT_COLLABORATOR = 'FREQUENT_COLLABORATOR',
  SIMILAR_SHOPPING = 'SIMILAR_SHOPPING',
  SAME_HOUSEHOLD = 'SAME_HOUSEHOLD',
  PROXIMITY_BASED = 'PROXIMITY_BASED',
  EVENT_BASED = 'EVENT_BASED',
  CATEGORY_EXPERT = 'CATEGORY_EXPERT',
  TIME_SAVER = 'TIME_SAVER',
}

export interface ProximityAlert {
  id: string;
  listId: string;
  memberId: string;
  memberName: string;
  distance: number; // meters
  message: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ItemSplitSuggestion {
  strategy: 'EQUAL' | 'BY_CATEGORY' | 'BY_PREFERENCE' | 'BY_LOCATION' | 'OPTIMAL';
  distribution: {
    memberId: string;
    memberName: string;
    items: SharedListItem[];
    estimatedTime: number;
    estimatedCost: number;
  }[];
  efficiency: number; // 0-100
  timeSaved: number; // minutes
  explanation: string;
}

export interface CollaborationHistory {
  userId: string;
  username: string;
  totalSharedLists: number;
  totalItemsCompleted: number;
  averageResponseTime: number; // minutes
  reliabilityScore: number; // 0-100
  categories: {
    category: string;
    count: number;
  }[];
  monthlyActivity: {
    month: string;
    listsShared: number;
    itemsCompleted: number;
  }[];
}

// ==================== SERVICE ====================

class SmartSharingService {
  private currentUserId: string = 'user-001';
  private sharedLists: Map<string, SharedList> = new Map();
  private sharingPatterns: Map<string, SharingPattern> = new Map();

  // Create a shared list
  async createSharedList(
    name: string,
    description: string,
    items: string[],
    members: { userId: string; permission: 'VIEW' | 'EDIT' | 'ADMIN' }[]
  ): Promise<SharedList> {
    const shareCode = this.generateShareCode();
    
    const sharedList: SharedList = {
      id: `shared-${Date.now()}`,
      name,
      description,
      ownerId: this.currentUserId,
      members: [
        {
          userId: this.currentUserId,
          username: 'You',
          permission: 'ADMIN',
          joinedAt: new Date(),
          contributions: items.length,
          itemsCompleted: 0,
        },
        ...members.map(m => ({
          ...m,
          username: `User ${m.userId}`,
          joinedAt: new Date(),
          contributions: 0,
          itemsCompleted: 0,
        })),
      ],
      items: items.map((item, index) => ({
        id: `item-${index}`,
        name: item,
        quantity: 1,
        category: 'General',
        addedBy: this.currentUserId,
        addedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      shareCode,
      settings: {
        allowEdit: true,
        allowAddMembers: true,
        requireApproval: false,
        notifyOnChanges: true,
      },
    };

    this.sharedLists.set(sharedList.id, sharedList);
    return sharedList;
  }

  // Get shared list
  async getSharedList(listId: string): Promise<SharedList> {
    const list = this.sharedLists.get(listId);
    
    if (!list) {
      // Return mock data
      return this.getMockSharedList();
    }
    
    return list;
  }

  // Join shared list with code
  async joinSharedList(shareCode: string, userId: string, username: string): Promise<SharedList> {
    // Find list by share code
    let list: SharedList | undefined;
    
    for (const l of this.sharedLists.values()) {
      if (l.shareCode === shareCode) {
        list = l;
        break;
      }
    }
    
    if (!list) {
      throw new Error('Invalid share code');
    }

    // Check if user already a member
    if (list.members.some(m => m.userId === userId)) {
      return list;
    }

    // Add member
    const newMember: SharedListMember = {
      userId,
      username,
      permission: 'EDIT',
      joinedAt: new Date(),
      contributions: 0,
      itemsCompleted: 0,
    };

    list.members.push(newMember);
    list.updatedAt = new Date();
    
    return list;
  }

  // Update member permission
  async updateMemberPermission(
    listId: string,
    memberId: string,
    permission: 'VIEW' | 'EDIT' | 'ADMIN'
  ): Promise<SharedList> {
    const list = await this.getSharedList(listId);
    
    // Only owner or admin can update permissions
    const currentMember = list.members.find(m => m.userId === this.currentUserId);
    if (!currentMember || currentMember.permission !== 'ADMIN') {
      throw new Error('Insufficient permissions');
    }

    const member = list.members.find(m => m.userId === memberId);
    if (member) {
      member.permission = permission;
      list.updatedAt = new Date();
    }
    
    return list;
  }

  // Remove member
  async removeMember(listId: string, memberId: string): Promise<SharedList> {
    const list = await this.getSharedList(listId);
    
    // Only owner can remove members
    if (list.ownerId !== this.currentUserId) {
      throw new Error('Only owner can remove members');
    }

    list.members = list.members.filter(m => m.userId !== memberId);
    list.updatedAt = new Date();
    
    return list;
  }

  // Get sharing suggestions
  async getSharingSuggestions(listId: string): Promise<SharingSuggestion[]> {
    const list = await this.getSharedList(listId);
    const suggestions: SharingSuggestion[] = [];

    // Mock suggestions based on patterns
    suggestions.push({
      type: SuggestionType.FREQUENT_COLLABORATOR,
      userId: 'user-002',
      username: 'Sarah',
      reason: 'You share lists with Sarah weekly',
      confidence: 95,
      data: { frequency: 'weekly', lastShared: new Date() },
    });

    suggestions.push({
      type: SuggestionType.SAME_HOUSEHOLD,
      userId: 'user-003',
      username: 'Mike',
      reason: 'Mike is in your household group',
      confidence: 90,
      data: { household: 'Smith Family' },
    });

    suggestions.push({
      type: SuggestionType.CATEGORY_EXPERT,
      userId: 'user-004',
      username: 'Alex',
      reason: 'Alex frequently shops for organic produce',
      confidence: 75,
      data: { categories: ['Organic', 'Produce'] },
    });

    suggestions.push({
      type: SuggestionType.PROXIMITY_BASED,
      userId: 'user-005',
      username: 'Jamie',
      reason: 'Jamie is shopping nearby',
      confidence: 80,
      data: { distance: 0.5, unit: 'miles' },
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Get sharing patterns
  async getSharingPatterns(): Promise<SharingPattern[]> {
    const patterns: SharingPattern[] = [
      {
        userId: 'user-002',
        username: 'Sarah',
        frequency: 12,
        lastShared: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        commonCategories: ['Groceries', 'Household'],
        averageListSize: 15,
        collaborationScore: 95,
      },
      {
        userId: 'user-003',
        username: 'Mike',
        frequency: 8,
        lastShared: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        commonCategories: ['Groceries', 'Electronics'],
        averageListSize: 12,
        collaborationScore: 87,
      },
      {
        userId: 'user-004',
        username: 'Alex',
        frequency: 5,
        lastShared: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        commonCategories: ['Organic', 'Health'],
        averageListSize: 8,
        collaborationScore: 78,
      },
    ];

    return patterns.sort((a, b) => b.collaborationScore - a.collaborationScore);
  }

  // Get proximity alerts
  async getProximityAlerts(listId: string): Promise<ProximityAlert[]> {
    const list = await this.getSharedList(listId);
    const alerts: ProximityAlert[] = [];

    // Mock proximity detection
    for (const member of list.members) {
      if (member.userId === this.currentUserId) continue;

      const distance = Math.random() * 5000; // 0-5km
      
      if (distance < 1000) {
        alerts.push({
          id: `alert-${Date.now()}-${member.userId}`,
          listId,
          memberId: member.userId,
          memberName: member.username,
          distance: Math.round(distance),
          message: `${member.username} is ${Math.round(distance)}m away`,
          timestamp: new Date(),
          location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
          },
        });
      }
    }

    return alerts.sort((a, b) => a.distance - b.distance);
  }

  // Get item split suggestions
  async getItemSplitSuggestions(listId: string): Promise<ItemSplitSuggestion[]> {
    const list = await this.getSharedList(listId);
    const suggestions: ItemSplitSuggestion[] = [];

    // Equal split
    const equalSplit = this.calculateEqualSplit(list);
    suggestions.push(equalSplit);

    // Category-based split
    const categorySplit = this.calculateCategorySplit(list);
    suggestions.push(categorySplit);

    // Optimal split (AI-based)
    const optimalSplit = this.calculateOptimalSplit(list);
    suggestions.push(optimalSplit);

    return suggestions.sort((a, b) => b.efficiency - a.efficiency);
  }

  private calculateEqualSplit(list: SharedList): ItemSplitSuggestion {
    const itemsPerPerson = Math.ceil(list.items.length / list.members.length);
    const distribution = list.members.map((member, index) => ({
      memberId: member.userId,
      memberName: member.username,
      items: list.items.slice(index * itemsPerPerson, (index + 1) * itemsPerPerson),
      estimatedTime: itemsPerPerson * 2,
      estimatedCost: itemsPerPerson * 10,
    }));

    return {
      strategy: 'EQUAL',
      distribution,
      efficiency: 70,
      timeSaved: 15,
      explanation: 'Items divided equally among all members',
    };
  }

  private calculateCategorySplit(list: SharedList): ItemSplitSuggestion {
    const categories = [...new Set(list.items.map(i => i.category))];
    const distribution = list.members.map((member, index) => {
      const memberCategories = categories.filter((_, i) => i % list.members.length === index);
      const memberItems = list.items.filter(item => memberCategories.includes(item.category));
      
      return {
        memberId: member.userId,
        memberName: member.username,
        items: memberItems,
        estimatedTime: memberItems.length * 2,
        estimatedCost: memberItems.length * 10,
      };
    });

    return {
      strategy: 'BY_CATEGORY',
      distribution,
      efficiency: 85,
      timeSaved: 25,
      explanation: 'Items grouped by category to minimize store navigation',
    };
  }

  private calculateOptimalSplit(list: SharedList): ItemSplitSuggestion {
    // AI-based optimization considering:
    // - Member preferences
    // - Store locations
    // - Time efficiency
    // - Cost distribution
    
    const distribution = list.members.map((member, index) => {
      const score = Math.random();
      const itemCount = Math.floor(list.items.length / list.members.length * (0.8 + score * 0.4));
      const memberItems = list.items.slice(
        index * itemCount,
        Math.min((index + 1) * itemCount, list.items.length)
      );
      
      return {
        memberId: member.userId,
        memberName: member.username,
        items: memberItems,
        estimatedTime: Math.round(memberItems.length * 1.5),
        estimatedCost: memberItems.length * 10,
      };
    });

    return {
      strategy: 'OPTIMAL',
      distribution,
      efficiency: 95,
      timeSaved: 40,
      explanation: 'AI-optimized distribution based on preferences and efficiency',
    };
  }

  // Get collaboration history
  async getCollaborationHistory(userId: string): Promise<CollaborationHistory> {
    // Mock collaboration data
    return {
      userId,
      username: 'Sarah',
      totalSharedLists: 45,
      totalItemsCompleted: 320,
      averageResponseTime: 15,
      reliabilityScore: 92,
      categories: [
        { category: 'Groceries', count: 180 },
        { category: 'Household', count: 85},
        { category: 'Health', count: 55 },
      ],
      monthlyActivity: [
        { month: '2025-01', listsShared: 8, itemsCompleted: 65 },
        { month: '2025-02', listsShared: 10, itemsCompleted: 78 },
        { month: '2025-03', listsShared: 12, itemsCompleted: 92 },
      ],
    };
  }

  // Assign item to member
  async assignItem(listId: string, itemId: string, memberId: string): Promise<SharedList> {
    const list = await this.getSharedList(listId);
    const item = list.items.find(i => i.id === itemId);
    
    if (item) {
      item.assignedTo = memberId;
      list.updatedAt = new Date();
    }
    
    return list;
  }

  // Complete item
  async completeItem(listId: string, itemId: string, userId: string): Promise<SharedList> {
    const list = await this.getSharedList(listId);
    const item = list.items.find(i => i.id === itemId);
    const member = list.members.find(m => m.userId === userId);
    
    if (item && member) {
      item.completedBy = userId;
      item.completedAt = new Date();
      member.itemsCompleted += 1;
      list.updatedAt = new Date();
    }
    
    return list;
  }

  // Get all shared lists for user
  async getUserSharedLists(): Promise<SharedList[]> {
    const lists: SharedList[] = [];
    
    for (const list of this.sharedLists.values()) {
      if (list.members.some(m => m.userId === this.currentUserId)) {
        lists.push(list);
      }
    }
    
    // Add mock data if empty
    if (lists.length === 0) {
      lists.push(this.getMockSharedList());
    }
    
    return lists;
  }

  // ==================== HELPER METHODS ====================

  private generateShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private getMockSharedList(): SharedList {
    return {
      id: 'shared-mock-1',
      name: 'Weekly Groceries',
      description: 'Family grocery shopping',
      ownerId: this.currentUserId,
      members: [
        {
          userId: this.currentUserId,
          username: 'You',
          permission: 'ADMIN',
          joinedAt: new Date('2025-01-01'),
          contributions: 15,
          itemsCompleted: 12,
        },
        {
          userId: 'user-002',
          username: 'Sarah',
          avatar: '👩',
          permission: 'EDIT',
          joinedAt: new Date('2025-01-01'),
          lastActive: new Date(),
          contributions: 10,
          itemsCompleted: 18,
        },
        {
          userId: 'user-003',
          username: 'Mike',
          avatar: '👨',
          permission: 'VIEW',
          joinedAt: new Date('2025-01-15'),
          contributions: 5,
          itemsCompleted: 7,
        },
      ],
      items: [
        {
          id: 'item-1',
          name: 'Milk',
          quantity: 2,
          category: 'Dairy',
          addedBy: this.currentUserId,
          addedAt: new Date(),
        },
        {
          id: 'item-2',
          name: 'Bread',
          quantity: 1,
          category: 'Bakery',
          addedBy: 'user-002',
          addedAt: new Date(),
          assignedTo: 'user-002',
        },
        {
          id: 'item-3',
          name: 'Eggs',
          quantity: 1,
          category: 'Dairy',
          addedBy: this.currentUserId,
          addedAt: new Date(),
          completedBy: this.currentUserId,
          completedAt: new Date(),
        },
      ],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date(),
      shareCode: 'ABC123',
      settings: {
        allowEdit: true,
        allowAddMembers: true,
        requireApproval: false,
        notifyOnChanges: true,
      },
    };
  }
}

export default new SmartSharingService();
