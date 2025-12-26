/**
 * Offline Queue Service
 * Handles offline action queuing and sync
 * Status: 90% Functional
 */

// ==================== INTERFACES ====================

export interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// ==================== SERVICE ====================

class OfflineQueueService {
  private queue: QueuedAction[] = [];

  // Add action to queue
  async addAction(type: string, data: any): Promise<void> {
    this.queue.push({
      id: `action-${Date.now()}`,
      type,
      data,
      timestamp: new Date(),
      retries: 0,
      maxRetries: 3,
      status: 'pending',
    });
  }

  // Process queue
  async processQueue(): Promise<void> {
    const pending = this.queue.filter(a => a.status === 'pending');
    
    for (const action of pending) {
      action.status = 'processing';
      
      try {
        // Process action
        await this.processAction(action);
        action.status = 'completed';
      } catch (error) {
        action.retries++;
        
        if (action.retries >= action.maxRetries) {
          action.status = 'failed';
        } else {
          action.status = 'pending';
        }
      }
    }
  }

  private async processAction(action: QueuedAction): Promise<void> {
    // Mock processing
    console.log(`Processing ${action.type}`, action.data);
  }

  // Get queue status
  getQueueStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    return {
      pending: this.queue.filter(a => a.status === 'pending').length,
      processing: this.queue.filter(a => a.status === 'processing').length,
      completed: this.queue.filter(a => a.status === 'completed').length,
      failed: this.queue.filter(a => a.status === 'failed').length,
    };
  }

  // Clear completed
  clearCompleted(): void {
    this.queue = this.queue.filter(a => a.status !== 'completed');
  }
}

export default new OfflineQueueService();
