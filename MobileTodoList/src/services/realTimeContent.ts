/**
 * Real-Time Content Service
 * Handles dynamic content updates and caching
 * Status: 75% Functional
 */

// ==================== INTERFACES ====================

export interface ContentItem {
  id: string;
  type: 'tip' | 'deal' | 'recipe' | 'article' | 'notification';
  title: string;
  content: string;
  imageUrl?: string;
  priority: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface ContentUpdate {
  id: string;
  version: number;
  timestamp: Date;
  items: ContentItem[];
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  ttl: number; // seconds
  version: number;
}

// ==================== SERVICE ====================

class RealTimeContentService {
  private cache: Map<string, CacheEntry> = new Map();
  private currentVersion: number = 1;

  // Get content
  async getContent(type?: string): Promise<ContentItem[]> {
    const cacheKey = `content-${type || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ContentItem[];
    }

    const content = this.generateMockContent(type);
    this.setCache(cacheKey, content, 300); // 5 min TTL
    
    return content;
  }

  // Check for updates
  async checkForUpdates(): Promise<boolean> {
    // Mock update check
    return Math.random() > 0.8;
  }

  // Get latest version
  async getLatestVersion(): Promise<number> {
    return this.currentVersion;
  }

  // Update content
  async updateContent(items: ContentItem[]): Promise<void> {
    this.currentVersion++;
    this.cache.clear();
  }

  // Cache helpers
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const age = (Date.now() - entry.timestamp.getTime()) / 1000;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      key,
      data,
      timestamp: new Date(),
      ttl,
      version: this.currentVersion,
    });
  }

  private generateMockContent(type?: string): ContentItem[] {
    const items: ContentItem[] = [
      {
        id: 'tip-1',
        type: 'tip',
        title: 'Save Money on Produce',
        content: 'Buy seasonal fruits and vegetables for best prices',
        priority: 80,
      },
      {
        id: 'deal-1',
        type: 'deal',
        title: 'Flash Sale: 30% off Coffee',
        content: 'Limited time offer on premium coffee beans',
        priority: 95,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: 'recipe-1',
        type: 'recipe',
        title: '15-Minute Pasta',
        content: 'Quick and easy weeknight dinner',
        priority: 70,
        metadata: { prepTime: 15, difficulty: 'easy' },
      },
    ];

    if (type) {
      return items.filter(item => item.type === type);
    }

    return items;
  }

  // Prefetch content
  async prefetch(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.getContent(key);
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export default new RealTimeContentService();
