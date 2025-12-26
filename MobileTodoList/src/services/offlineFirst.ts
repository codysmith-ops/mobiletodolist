/**
 * Offline First Service
 * Handles offline functionality, sync queue, and conflict resolution
 * Status: 70% Functional
 */

// ==================== INTERFACES ====================

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'list' | 'item' | 'user' | 'settings';
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
  version: number;
}

export interface ConflictResolution {
  strategy: 'client_wins' | 'server_wins' | 'merge';
  clientData: any;
  serverData: any;
  resolvedData: any;
  timestamp: Date;
}

export interface NetworkStatus {
  online: boolean;
  type: 'wifi' | 'cellular' | 'none';
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
}

export interface BackgroundSyncTask {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
}

// ==================== SERVICE ====================

class OfflineFirstService {
  private syncQueue: SyncQueueItem[] = [];
  private cache: Map<string, CacheEntry<any>> = new Map();
  private networkStatus: NetworkStatus = {
    online: true,
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  };

  // Add item to sync queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.syncQueue.push(queueItem);
    this.sortSyncQueue();

    if (this.networkStatus.online) {
      await this.processSyncQueue();
    }
  }

  // Process sync queue
  async processSyncQueue(): Promise<void> {
    if (!this.networkStatus.online || this.syncQueue.length === 0) {
      return;
    }

    const item = this.syncQueue[0];
    
    try {
      // Mock sync operation
      console.log(`Syncing ${item.type} ${item.resource}:`, item.data);
      
      // Remove from queue on success
      this.syncQueue.shift();
      
      // Process next item
      if (this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }
    } catch (error) {
      item.retryCount++;
      
      if (item.retryCount >= 3) {
        // Remove after 3 retries
        this.syncQueue.shift();
      } else {
        // Move to end of queue
        this.syncQueue.push(this.syncQueue.shift()!);
      }
    }
  }

  private sortSyncQueue(): void {
    this.syncQueue.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Older items first
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  // Get sync queue
  getSyncQueue(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  // Clear sync queue
  clearSyncQueue(): void {
    this.syncQueue = [];
  }

  // Cache data with TTL
  async cacheData<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl,
      version: 1,
    });
  }

  // Get cached data
  async getCachedData<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp.getTime();

    if (age > entry.ttl) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Invalidate cache
  async invalidateCache(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  // Resolve conflict
  async resolveConflict(
    clientData: any,
    serverData: any,
    strategy: ConflictResolution['strategy'] = 'server_wins'
  ): Promise<ConflictResolution> {
    let resolvedData: any;

    switch (strategy) {
      case 'client_wins':
        resolvedData = clientData;
        break;
      
      case 'server_wins':
        resolvedData = serverData;
        break;
      
      case 'merge':
        resolvedData = this.mergeData(clientData, serverData);
        break;
    }

    return {
      strategy,
      clientData,
      serverData,
      resolvedData,
      timestamp: new Date(),
    };
  }

  private mergeData(client: any, server: any): any {
    // Simple merge strategy - prefer newer timestamps
    const merged = { ...server };

    for (const key in client) {
      if (client[key] !== undefined && client[key] !== server[key]) {
        // If client has newer data, use it
        if (client.updatedAt > server.updatedAt) {
          merged[key] = client[key];
        }
      }
    }

    return merged;
  }

  // Get network status
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  // Update network status
  updateNetworkStatus(status: Partial<NetworkStatus>): void {
    this.networkStatus = { ...this.networkStatus, ...status };

    if (status.online && this.syncQueue.length > 0) {
      this.processSyncQueue();
    }
  }

  // Schedule background sync
  async scheduleBackgroundSync(type: string, interval: number): Promise<BackgroundSyncTask> {
    const task: BackgroundSyncTask = {
      id: `bg-sync-${Date.now()}`,
      type,
      status: 'pending',
      nextRun: new Date(Date.now() + interval),
    };

    return task;
  }

  // Get cache size
  getCacheSize(): { entries: number; estimatedBytes: number } {
    let estimatedBytes = 0;

    for (const entry of this.cache.values()) {
      estimatedBytes += JSON.stringify(entry.data).length;
    }

    return {
      entries: this.cache.size,
      estimatedBytes,
    };
  }

  // Optimize cache
  async optimizeCache(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }
}

export default new OfflineFirstService();
