/**
 * Live Shopping Service
 * Handles group shopping, shared carts, and real-time collaboration
 * Status: 60% Functional
 */

// ==================== INTERFACES ====================

export interface ShoppingLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface ActiveShopper {
  userId: string;
  username: string;
  avatar?: string;
  location: ShoppingLocation;
  currentAisle?: string;
  status: 'shopping' | 'idle' | 'checking_out';
  lastSeen: Date;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price?: number;
  status: 'pending' | 'grabbed' | 'unavailable' | 'completed';
  assignedTo?: string;
  claimedBy?: string;
  claimedAt?: Date;
  location?: {
    aisle: string;
    section: string;
  };
  notes?: string;
}

export interface LiveSession {
  id: string;
  listId: string;
  listName: string;
  storeId?: string;
  storeName?: string;
  startedAt: Date;
  participants: ActiveShopper[];
  items: ShoppingItem[];
  chatEnabled: boolean;
  voiceChatEnabled: boolean;
  updates: LiveUpdate[];
}

export interface LiveUpdate {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  type: UpdateType;
  message: string;
  timestamp: Date;
  data?: any;
}

export enum UpdateType {
  JOINED = 'JOINED',
  LEFT = 'LEFT',
  ITEM_CLAIMED = 'ITEM_CLAIMED',
  ITEM_COMPLETED = 'ITEM_COMPLETED',
  ITEM_UNAVAILABLE = 'ITEM_UNAVAILABLE',
  LOCATION_UPDATE = 'LOCATION_UPDATE',
  MESSAGE = 'MESSAGE',
  CHECKOUT_STARTED = 'CHECKOUT_STARTED',
}

export interface ProximitySuggestion {
  item: ShoppingItem;
  distance: number;
  direction: string;
  shopper?: ActiveShopper;
  message: string;
}

export interface VoiceChatConfig {
  enabled: boolean;
  roomId: string;
  participants: string[];
  quality: 'low' | 'medium' | 'high';
}

// ==================== SERVICE ====================

class LiveShoppingService {
  private currentUserId: string = 'user-001';
  private activeSessions: Map<string, LiveSession> = new Map();

  // Start a live shopping session
  async startSession(listId: string, listName: string, storeId?: string, storeName?: string): Promise<LiveSession> {
    const session: LiveSession = {
      id: `session-${Date.now()}`,
      listId,
      listName,
      storeId,
      storeName,
      startedAt: new Date(),
      participants: [
        {
          userId: this.currentUserId,
          username: 'You',
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10,
            timestamp: new Date(),
          },
          status: 'shopping',
          lastSeen: new Date(),
        },
      ],
      items: this.getMockItems(),
      chatEnabled: true,
      voiceChatEnabled: false,
      updates: [
        {
          id: `update-${Date.now()}`,
          sessionId: `session-${Date.now()}`,
          userId: this.currentUserId,
          username: 'You',
          type: UpdateType.JOINED,
          message: 'Started shopping session',
          timestamp: new Date(),
        },
      ],
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  // Join an existing session
  async joinSession(sessionId: string, userId: string, username: string): Promise<LiveSession> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const shopper: ActiveShopper = {
      userId,
      username,
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: new Date(),
      },
      status: 'shopping',
      lastSeen: new Date(),
    };

    session.participants.push(shopper);
    
    const update: LiveUpdate = {
      id: `update-${Date.now()}`,
      sessionId,
      userId,
      username,
      type: UpdateType.JOINED,
      message: `${username} joined the session`,
      timestamp: new Date(),
    };
    
    session.updates.push(update);
    
    return session;
  }

  // Leave session
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const shopper = session.participants.find(p => p.userId === userId);
    
    if (shopper) {
      session.participants = session.participants.filter(p => p.userId !== userId);
      
      const update: LiveUpdate = {
        id: `update-${Date.now()}`,
        sessionId,
        userId,
        username: shopper.username,
        type: UpdateType.LEFT,
        message: `${shopper.username} left the session`,
        timestamp: new Date(),
      };
      
      session.updates.push(update);
    }

    // Delete session if no participants
    if (session.participants.length === 0) {
      this.activeSessions.delete(sessionId);
    }
  }

  // Update shopper location
  async updateLocation(sessionId: string, userId: string, location: ShoppingLocation, aisle?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const shopper = session.participants.find(p => p.userId === userId);
    
    if (shopper) {
      shopper.location = location;
      shopper.currentAisle = aisle;
      shopper.lastSeen = new Date();
      
      const update: LiveUpdate = {
        id: `update-${Date.now()}`,
        sessionId,
        userId,
        username: shopper.username,
        type: UpdateType.LOCATION_UPDATE,
        message: aisle ? `${shopper.username} is in ${aisle}` : `${shopper.username} updated location`,
        timestamp: new Date(),
        data: { location, aisle },
      };
      
      session.updates.push(update);
    }
  }

  // Claim an item
  async claimItem(sessionId: string, itemId: string, userId: string): Promise<ShoppingItem> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const item = session.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.claimedBy && item.claimedBy !== userId) {
      throw new Error('Item already claimed by another user');
    }

    const shopper = session.participants.find(p => p.userId === userId);
    
    if (!shopper) {
      throw new Error('User not in session');
    }

    item.claimedBy = userId;
    item.claimedAt = new Date();
    item.status = 'grabbed';
    
    const update: LiveUpdate = {
      id: `update-${Date.now()}`,
      sessionId,
      userId,
      username: shopper.username,
      type: UpdateType.ITEM_CLAIMED,
      message: `${shopper.username} is getting ${item.name}`,
      timestamp: new Date(),
      data: { itemId, itemName: item.name },
    };
    
    session.updates.push(update);
    
    return item;
  }

  // Complete an item
  async completeItem(sessionId: string, itemId: string, userId: string): Promise<ShoppingItem> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const item = session.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    const shopper = session.participants.find(p => p.userId === userId);
    
    if (!shopper) {
      throw new Error('User not in session');
    }

    item.status = 'completed';
    
    const update: LiveUpdate = {
      id: `update-${Date.now()}`,
      sessionId,
      userId,
      username: shopper.username,
      type: UpdateType.ITEM_COMPLETED,
      message: `${shopper.username} got ${item.name}`,
      timestamp: new Date(),
      data: { itemId, itemName: item.name },
    };
    
    session.updates.push(update);
    
    return item;
  }

  // Mark item as unavailable
  async markItemUnavailable(sessionId: string, itemId: string, userId: string, reason?: string): Promise<ShoppingItem> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const item = session.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    const shopper = session.participants.find(p => p.userId === userId);
    
    if (!shopper) {
      throw new Error('User not in session');
    }

    item.status = 'unavailable';
    if (reason) {
      item.notes = reason;
    }
    
    const update: LiveUpdate = {
      id: `update-${Date.now()}`,
      sessionId,
      userId,
      username: shopper.username,
      type: UpdateType.ITEM_UNAVAILABLE,
      message: `${item.name} is unavailable${reason ? ': ' + reason : ''}`,
      timestamp: new Date(),
      data: { itemId, itemName: item.name, reason },
    };
    
    session.updates.push(update);
    
    return item;
  }

  // Get proximity suggestions
  async getProximitySuggestions(sessionId: string, userId: string): Promise<ProximitySuggestion[]> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const currentShopper = session.participants.find(p => p.userId === userId);
    
    if (!currentShopper) {
      throw new Error('User not in session');
    }

    const suggestions: ProximitySuggestion[] = [];
    
    // Find nearby unclaimed items
    const unclaimedItems = session.items.filter(i => i.status === 'pending' && !i.claimedBy);
    
    for (const item of unclaimedItems.slice(0, 3)) {
      // Calculate mock distance
      const distance = Math.random() * 50; // 0-50 meters
      
      suggestions.push({
        item,
        distance,
        direction: this.getRandomDirection(),
        message: `${item.name} is ${Math.round(distance)}m away`,
      });
    }

    // Find items being grabbed by nearby shoppers
    const nearbyShoppers = session.participants.filter(p => p.userId !== userId && p.status === 'shopping');
    
    for (const shopper of nearbyShoppers) {
      const theirItems = session.items.filter(i => i.claimedBy === shopper.userId && i.status === 'grabbed');
      
      for (const item of theirItems.slice(0, 1)) {
        const distance = Math.random() * 30;
        
        suggestions.push({
          item,
          distance,
          direction: this.getRandomDirection(),
          shopper,
          message: `${shopper.username} is getting ${item.name} nearby`,
        });
      }
    }

    return suggestions.sort((a, b) => a.distance - b.distance);
  }

  // Send chat message
  async sendMessage(sessionId: string, userId: string, message: string): Promise<LiveUpdate> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const shopper = session.participants.find(p => p.userId === userId);
    
    if (!shopper) {
      throw new Error('User not in session');
    }

    const update: LiveUpdate = {
      id: `update-${Date.now()}`,
      sessionId,
      userId,
      username: shopper.username,
      type: UpdateType.MESSAGE,
      message,
      timestamp: new Date(),
    };
    
    session.updates.push(update);
    
    return update;
  }

  // Get session updates
  async getUpdates(sessionId: string, since?: Date): Promise<LiveUpdate[]> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (since) {
      return session.updates.filter(u => u.timestamp > since);
    }
    
    return session.updates;
  }

  // Enable voice chat
  async enableVoiceChat(sessionId: string): Promise<VoiceChatConfig> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.voiceChatEnabled = true;
    
    const config: VoiceChatConfig = {
      enabled: true,
      roomId: `voice-${sessionId}`,
      participants: session.participants.map(p => p.userId),
      quality: 'medium',
    };
    
    return config;
  }

  // Get active sessions for user
  async getUserActiveSessions(userId: string): Promise<LiveSession[]> {
    const sessions: LiveSession[] = [];
    
    for (const session of this.activeSessions.values()) {
      if (session.participants.some(p => p.userId === userId)) {
        sessions.push(session);
      }
    }
    
    return sessions;
  }

  // End session
  async endSession(sessionId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Only creator can end session
    if (session.participants[0].userId !== userId) {
      throw new Error('Only session creator can end session');
    }

    this.activeSessions.delete(sessionId);
  }

  // Get session summary
  async getSessionSummary(sessionId: string): Promise<{
    totalItems: number;
    completedItems: number;
    unavailableItems: number;
    totalTime: number;
    participants: number;
  }> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const now = new Date();
    const totalTime = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000 / 60); // minutes

    return {
      totalItems: session.items.length,
      completedItems: session.items.filter(i => i.status === 'completed').length,
      unavailableItems: session.items.filter(i => i.status === 'unavailable').length,
      totalTime,
      participants: session.participants.length,
    };
  }

  // ==================== HELPER METHODS ====================

  private getMockItems(): ShoppingItem[] {
    return [
      {
        id: 'item-1',
        name: 'Milk',
        category: 'Dairy',
        quantity: 1,
        price: 3.99,
        status: 'pending',
        location: { aisle: 'Aisle 3', section: 'Dairy' },
      },
      {
        id: 'item-2',
        name: 'Bread',
        category: 'Bakery',
        quantity: 2,
        price: 2.49,
        status: 'pending',
        location: { aisle: 'Aisle 1', section: 'Bakery' },
      },
      {
        id: 'item-3',
        name: 'Eggs',
        category: 'Dairy',
        quantity: 1,
        price: 4.99,
        status: 'pending',
        location: { aisle: 'Aisle 3', section: 'Dairy' },
      },
      {
        id: 'item-4',
        name: 'Apples',
        category: 'Produce',
        quantity: 6,
        price: 5.99,
        status: 'pending',
        location: { aisle: 'Produce', section: 'Fruit' },
      },
      {
        id: 'item-5',
        name: 'Chicken Breast',
        category: 'Meat',
        quantity: 2,
        price: 12.99,
        status: 'pending',
        location: { aisle: 'Aisle 5', section: 'Meat' },
      },
    ];
  }

  private getRandomDirection(): string {
    const directions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
    return directions[Math.floor(Math.random() * directions.length)];
  }
}

export default new LiveShoppingService();
