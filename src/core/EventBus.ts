/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Event Bus System                                                  │
 * │                                                                              │
 * │   Central event management for PersonaEngine and system-wide communication   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { EventEmitter } from 'events';

export interface SallieEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface EventBusMetrics {
  totalEvents: number;
  eventsPerType: Record<string, number>;
  lastEventTime: Date;
  errorCount: number;
  listenerCount: number;
}

class SallieEventBus extends EventEmitter {
  private metrics: EventBusMetrics = {
    totalEvents: 0,
    eventsPerType: {},
    lastEventTime: new Date(),
    errorCount: 0,
    listenerCount: 0,
  };

  private eventHistory: SallieEvent[] = [];
  private readonly maxHistorySize = 1000;

  constructor() {
    super();
    this.setMaxListeners(50); // Increase default limit for multiple listeners
    
    // Set up error handling
    this.on('error', (error) => {
      console.error('EventBus Error:', error);
      this.metrics.errorCount++;
    });
  }

  /**
   * Emit a structured Sallie event
   */
  emitSallieEvent(event: SallieEvent): boolean {
    try {
      // Update metrics
      this.metrics.totalEvents++;
      this.metrics.lastEventTime = new Date();
      this.metrics.eventsPerType[event.type] = (this.metrics.eventsPerType[event.type] || 0) + 1;

      // Store in history
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory = this.eventHistory.slice(-this.maxHistorySize + 100);
      }

      // Emit the event
      const result = this.emit(event.type, event);
      
      // Also emit a generic event for global listeners
      this.emit('sallie:event', event);
      
      return result;
    } catch (error) {
      console.error('Error emitting Sallie event:', error);
      this.metrics.errorCount++;
      return false;
    }
  }

  /**
   * Create a properly formatted Sallie event
   */
  createEvent(
    type: string,
    payload: any,
    source: string = 'unknown',
    priority: SallieEvent['priority'] = 'normal'
  ): SallieEvent {
    return {
      id: `sallie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      source,
      timestamp: new Date(),
      payload,
      priority,
    };
  }

  /**
   * Get event bus metrics
   */
  getMetrics(): EventBusMetrics {
    this.metrics.listenerCount = this.eventNames().length;
    return { ...this.metrics };
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 10): SallieEvent[] {
    return this.eventHistory.slice(-count);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string, count: number = 10): SallieEvent[] {
    return this.eventHistory
      .filter(event => event.type === type)
      .slice(-count);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Subscribe to multiple event types with one callback
   */
  onMultiple(eventTypes: string[], callback: (event: SallieEvent) => void): void {
    eventTypes.forEach(type => {
      this.on(type, callback);
    });
  }

  /**
   * Unsubscribe from multiple event types
   */
  offMultiple(eventTypes: string[], callback: (event: SallieEvent) => void): void {
    eventTypes.forEach(type => {
      this.off(type, callback);
    });
  }

  /**
   * Wait for a specific event (Promise-based)
   */
  waitForEvent(eventType: string, timeout: number = 5000): Promise<SallieEvent> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(eventType, eventHandler);
        reject(new Error(`Event ${eventType} timeout after ${timeout}ms`));
      }, timeout);

      const eventHandler = (event: SallieEvent) => {
        clearTimeout(timer);
        this.off(eventType, eventHandler);
        resolve(event);
      };

      this.once(eventType, eventHandler);
    });
  }

  /**
   * Get health status of the event bus
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    uptime: number;
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check error rate
    const errorRate = this.metrics.errorCount / Math.max(this.metrics.totalEvents, 1);
    if (errorRate > 0.1) {
      issues.push('High error rate detected');
      status = 'critical';
    } else if (errorRate > 0.05) {
      issues.push('Elevated error rate');
      status = 'warning';
    }

    // Check listener count
    if (this.metrics.listenerCount > 100) {
      issues.push('High number of listeners may affect performance');
      status = status === 'critical' ? 'critical' : 'warning';
    }

    // Check event history size
    if (this.eventHistory.length >= this.maxHistorySize) {
      issues.push('Event history buffer is full');
      if (status === 'healthy') status = 'warning';
    }

    return {
      status,
      issues,
      uptime: Date.now() - this.metrics.lastEventTime.getTime(),
    };
  }

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    this.removeAllListeners();
    this.eventHistory = [];
    this.metrics = {
      totalEvents: 0,
      eventsPerType: {},
      lastEventTime: new Date(),
      errorCount: 0,
      listenerCount: 0,
    };
  }
}

// Singleton instance
let eventBusInstance: SallieEventBus | null = null;

/**
 * Get the global event bus instance
 */
export function getEventBus(): SallieEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new SallieEventBus();
  }
  return eventBusInstance;
}

/**
 * Dispose the global event bus instance
 */
export function disposeEventBus(): void {
  if (eventBusInstance) {
    eventBusInstance.dispose();
    eventBusInstance = null;
  }
}

export { SallieEventBus };