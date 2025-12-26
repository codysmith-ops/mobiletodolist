/**
 * Wearables Service
 * Handles Apple Watch and wearable device integration
 * Status: 35% Functional (Mock - requires WatchConnectivity)
 */

// ==================== INTERFACES ====================

export interface WearableDevice {
  id: string;
  type: 'apple_watch' | 'fitbit' | 'other';
  name: string;
  connected: boolean;
  lastSync: Date;
  batteryLevel?: number;
}

export interface WearableListItem {
  id: string;
  name: string;
  completed: boolean;
  priority: number;
}

export interface ProximityAlert {
  itemName: string;
  storeName: string;
  distance: number;
  direction: string;
}

export interface WidgetData {
  listCount: number;
  itemsDueToday: number;
  upcomingTrip?: {
    store: string;
    time: Date;
    items: number;
  };
}

export interface QuickAddTemplate {
  id: string;
  name: string;
  items: string[];
  icon: string;
}

// ==================== SERVICE ====================

class WearablesService {
  // Get connected wearables
  async getDevices(): Promise<WearableDevice[]> {
    return [
      {
        id: 'watch-1',
        type: 'apple_watch',
        name: 'Apple Watch',
        connected: false,
        lastSync: new Date(),
        batteryLevel: 75,
      },
    ];
  }

  // Sync list to watch
  async syncToWatch(listId: string): Promise<WearableListItem[]> {
    return [
      {
        id: 'item-1',
        name: 'Milk',
        completed: false,
        priority: 1,
      },
      {
        id: 'item-2',
        name: 'Bread',
        completed: false,
        priority: 2,
      },
      {
        id: 'item-3',
        name: 'Eggs',
        completed: true,
        priority: 3,
      },
    ];
  }

  // Send proximity alert to watch
  async sendProximityAlert(itemName: string, storeName: string, distance: number): Promise<void> {
    console.log(`Proximity alert: ${itemName} at ${storeName} - ${distance}m away`);
  }

  // Get widget data
  async getWidgetData(): Promise<WidgetData> {
    return {
      listCount: 3,
      itemsDueToday: 5,
      upcomingTrip: {
        store: 'Whole Foods',
        time: new Date(Date.now() + 2 * 60 * 60 * 1000),
        items: 12,
      },
    };
  }

  // Get quick add templates
  async getQuickAddTemplates(): Promise<QuickAddTemplate[]> {
    return [
      {
        id: 'template-1',
        name: 'Breakfast',
        items: ['Milk', 'Eggs', 'Bread', 'Butter'],
        icon: '🍳',
      },
      {
        id: 'template-2',
        name: 'Dinner',
        items: ['Chicken', 'Vegetables', 'Rice'],
        icon: '🍽️',
      },
    ];
  }

  // Complete item from watch
  async completeItemFromWatch(itemId: string): Promise<void> {
    console.log(`Item ${itemId} completed from watch`);
  }

  // Add item from watch
  async addItemFromWatch(itemName: string): Promise<void> {
    console.log(`Item ${itemName} added from watch`);
  }
}

export default new WearablesService();
