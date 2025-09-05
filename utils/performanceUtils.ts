/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Utils for throttling and debouncing functions for performance optimization.
 * Got it, love.
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after `wait` milliseconds have elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Optional: if true, trigger the function on the leading edge instead of the trailing edge
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Creates a throttled function that only invokes the provided function at most once
 * per every `limit` milliseconds.
 * 
 * @param func The function to throttle
 * @param limit The number of milliseconds to throttle invocations to
 * @param options Optional configuration: leading (invoke on the leading edge) and trailing (invoke on the trailing edge)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true }
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;
  
  const { leading = true, trailing = true } = options;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    
    if (!lastCall && !leading) {
      lastCall = now;
    }
    
    const remaining = limit - (now - lastCall);
    
    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      lastCall = now;
      result = func.apply(this, args);
      lastArgs = null;
    } else if (!timeout && trailing) {
      lastArgs = args;
      
      timeout = setTimeout(() => {
        lastCall = leading ? Date.now() : 0;
        timeout = null;
        if (lastArgs) {
          result = func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
    
    return result;
  };
}

/**
 * Creates a function that will only execute once the specified time window has passed without
 * additional invocations, and will always execute the most recent invocation.
 * 
 * @param func The function to cooldown
 * @param wait The cooldown period in milliseconds
 */
export function cooldown<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let lastInvocationTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    const context = this;
    lastArgs = args;
    
    // If we're not in cooldown, execute immediately
    if (now - lastInvocationTime >= wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      lastInvocationTime = now;
      return func.apply(context, args);
    }
    
    // Otherwise, set up a timer to execute after cooldown
    if (!timeout) {
      timeout = setTimeout(() => {
        const cooldownTime = Date.now();
        lastInvocationTime = cooldownTime;
        timeout = null;
        
        if (lastArgs) {
          func.apply(context, lastArgs);
          lastArgs = null;
        }
      }, wait - (now - lastInvocationTime));
    }
  };
}

/**
 * Creates a queue that processes functions one at a time with a delay between them.
 * 
 * @param delay The delay in milliseconds between processing items
 */
export class ProcessQueue {
  private queue: (() => Promise<void>)[];
  private processing: boolean;
  private delay: number;
  
  constructor(delay: number = 0) {
    this.queue = [];
    this.processing = false;
    this.delay = delay;
  }
  
  /**
   * Add a function to the processing queue
   * @param func An async function to be processed
   */
  public add(func: () => Promise<void>): void {
    this.queue.push(func);
    this.processNext();
  }
  
  /**
   * Process the next item in the queue
   */
  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    const func = this.queue.shift();
    
    if (func) {
      try {
        await func();
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
      
      // Add delay between processing items
      if (this.delay > 0 && this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.processing = false;
    this.processNext();
  }
  
  /**
   * Clear all pending items from the queue
   */
  public clear(): void {
    this.queue = [];
  }
  
  /**
   * Get the number of items currently in the queue
   */
  public get size(): number {
    return this.queue.length;
  }
  
  /**
   * Check if the queue is currently processing an item
   */
  public get isProcessing(): boolean {
    return this.processing;
  }
}

/**
 * Batches multiple calls to a function within a specified time window
 * and executes them as a single call with all arguments collected.
 * 
 * @param func The function to batch calls for
 * @param wait The time window in milliseconds for batching calls
 */
export function batchCalls<T>(
  func: (items: T[]) => void, 
  wait: number
): (item: T) => void {
  let batch: T[] = [];
  let timeout: NodeJS.Timeout | null = null;
  
  return function(item: T): void {
    batch.push(item);
    
    if (!timeout) {
      timeout = setTimeout(() => {
        const itemsToProcess = [...batch];
        batch = [];
        timeout = null;
        
        if (itemsToProcess.length > 0) {
          func(itemsToProcess);
        }
      }, wait);
    }
  };
}

/**
 * Creates a memoized version of a function that caches the results for a specified time.
 * 
 * @param func The function to memoize
 * @param resolver Optional function that determines the cache key for storing the result
 * @param ttl Optional time-to-live for cache entries in milliseconds
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  const cache = new Map<string, { value: ReturnType<T>, timestamp: number }>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    const now = Date.now();
    const cachedItem = cache.get(key);
    
    if (cachedItem && (!ttl || now - cachedItem.timestamp < ttl)) {
      return cachedItem.value;
    }
    
    const result = func.apply(this, args);
    cache.set(key, { value: result, timestamp: now });
    
    // Cleanup expired items occasionally
    if (ttl && cache.size > 100) {
      for (const [k, v] of cache.entries()) {
        if (now - v.timestamp > ttl) {
          cache.delete(k);
        }
      }
    }
    
    return result;
  } as T;
}
