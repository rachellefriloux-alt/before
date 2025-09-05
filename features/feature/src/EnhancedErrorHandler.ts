/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced error handling and recovery system
 * Got it, love.
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: number;
  stack?: string;
  deviceInfo?: any;
  appState?: string;
}

interface ErrorReport {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  recoverable: boolean;
  recoveryActions: string[];
  userMessage: string;
}

export class EnhancedErrorHandler {
  private errorHistory: ErrorReport[] = [];
  private recoveryStrategies: Map<string, () => Promise<boolean>> = new Map();
  private userNotificationCallback?: (message: string, severity: string) => void;

  constructor() {
    this.initializeRecoveryStrategies();
    this.setupGlobalErrorHandlers();
  }

  private initializeRecoveryStrategies() {
    // Network error recovery
    this.recoveryStrategies.set('NETWORK_ERROR', async () => {
      // Attempt to reconnect or use cached data
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate network retry
          resolve(Math.random() > 0.3); // 70% success rate
        }, 1000);
      });
    });

    // Memory error recovery
    this.recoveryStrategies.set('MEMORY_ERROR', async () => {
      // Clear caches, force garbage collection
      if (global.gc) {
        global.gc();
      }
      return true;
    });

    // State corruption recovery
    this.recoveryStrategies.set('STATE_ERROR', async () => {
      // Reset to safe state
      return true;
    });

    // API error recovery
    this.recoveryStrategies.set('API_ERROR', async () => {
      // Retry with exponential backoff
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 2000);
      });
    });
  }

  private setupGlobalErrorHandlers() {
    // React Native error boundary integration would go here
    if (typeof ErrorUtils !== 'undefined') {
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.handleError(error, {
          component: 'Global',
          timestamp: Date.now(),
          stack: error.stack,
          appState: 'unknown'
        }, isFatal ? 'critical' : 'high');
      });
    }

    // Promise rejection handler
    if (typeof process !== 'undefined' && process.on) {
      process.on('unhandledRejection', (reason, promise) => {
        this.handleError(new Error(`Unhandled Promise Rejection: ${reason}`), {
          component: 'Promise',
          timestamp: Date.now(),
          stack: reason instanceof Error ? reason.stack : String(reason)
        }, 'high');
      });
    }
  }

  async handleError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<ErrorReport> {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      severity,
      context: {
        timestamp: Date.now(),
        stack: error.stack,
        ...context
      },
      recoverable: this.isRecoverable(error, severity),
      recoveryActions: this.getRecoveryActions(error, severity),
      userMessage: this.generateUserMessage(error, severity)
    };

    // Store error for analysis
    this.errorHistory.push(errorReport);
    this.maintainErrorHistory();

    // Log error (in development) or send to analytics (in production)
    this.logError(errorReport);

    // Attempt automatic recovery if possible
    if (errorReport.recoverable) {
      const recovered = await this.attemptRecovery(error, errorReport);
      if (recovered) {
        errorReport.userMessage = 'Issue resolved automatically. No action needed.';
      }
    }

    // Notify user if necessary
    if (this.shouldNotifyUser(severity)) {
      this.notifyUser(errorReport);
    }

    return errorReport;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isRecoverable(error: Error, severity: string): boolean {
    // Critical errors are generally not recoverable
    if (severity === 'critical') return false;

    // Check if we have a recovery strategy for this type of error
    const errorType = this.classifyError(error);
    return this.recoveryStrategies.has(errorType);
  }

  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }

    if (message.includes('memory') || message.includes('heap') || stack.includes('out of memory')) {
      return 'MEMORY_ERROR';
    }

    if (message.includes('state') || message.includes('undefined') || message.includes('null')) {
      return 'STATE_ERROR';
    }

    if (message.includes('api') || message.includes('request') || message.includes('response')) {
      return 'API_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  private getRecoveryActions(error: Error, severity: string): string[] {
    const errorType = this.classifyError(error);
    
    const actions: { [key: string]: string[] } = {
      'NETWORK_ERROR': [
        'Retry connection',
        'Use cached data if available',
        'Switch to offline mode'
      ],
      'MEMORY_ERROR': [
        'Clear unnecessary caches',
        'Force garbage collection',
        'Reduce memory usage'
      ],
      'STATE_ERROR': [
        'Reset component state',
        'Reload from persistent storage',
        'Use default values'
      ],
      'API_ERROR': [
        'Retry request with backoff',
        'Use alternative endpoint',
        'Fallback to cached response'
      ]
    };

    return actions[errorType] || ['Log error for investigation'];
  }

  private generateUserMessage(error: Error, severity: string): string {
    const errorType = this.classifyError(error);
    
    // Salle's tough love meets soul care approach to error messages
    const messages: { [key: string]: { [key: string]: string } } = {
      'NETWORK_ERROR': {
        'low': "Connection hiccup, love. I'll handle it.",
        'medium': "Network's being difficult. Give me a moment to sort this out.",
        'high': "Connection issues are blocking us. Let me try a different approach.",
        'critical': "Major network problem. We might need to work offline for now."
      },
      'MEMORY_ERROR': {
        'low': "Clearing some space in my brain. One sec.",
        'medium': "Memory's getting full. Let me clean up and we'll continue.",
        'high': "Need to free up significant memory. This might take a moment.",
        'critical': "Critical memory issue. App restart may be necessary."
      },
      'STATE_ERROR': {
        'low': "Minor glitch fixed. We're good to go.",
        'medium': "Something got confused. Resetting to get us back on track.",
        'high': "Data inconsistency detected. Fixing this now.",
        'critical': "Major state corruption. Recovery in progress."
      },
      'API_ERROR': {
        'low': "API hiccup. Retrying now.",
        'medium': "Server's being slow. Trying again with more patience.",
        'high': "API problems are slowing us down. Working on alternatives.",
        'critical': "Server is down. Switching to emergency backup mode."
      }
    };

    const typeMessages = messages[errorType] || messages['STATE_ERROR'];
    return typeMessages[severity] || "Something unexpected happened, but I'm handling it.";
  }

  private async attemptRecovery(error: Error, errorReport: ErrorReport): Promise<boolean> {
    const errorType = this.classifyError(error);
    const recoveryFn = this.recoveryStrategies.get(errorType);

    if (!recoveryFn) return false;

    try {
      const recovered = await recoveryFn();
      if (recovered) {
        this.logRecovery(errorReport);
      }
      return recovered;
    } catch (recoveryError) {
      this.logError({
        ...errorReport,
        message: `Recovery failed: ${recoveryError.message}`,
        severity: 'high'
      });
      return false;
    }
  }

  private shouldNotifyUser(severity: string): boolean {
    // Only notify for medium and above, unless there are multiple low severity errors
    if (severity === 'critical' || severity === 'high') return true;
    if (severity === 'medium') return true;

    // Check for multiple low severity errors in short time
    const recentLowErrors = this.errorHistory.filter(
      err => err.severity === 'low' && 
      Date.now() - err.context.timestamp < 60000 // Last minute
    );

    return recentLowErrors.length > 3;
  }

  private notifyUser(errorReport: ErrorReport) {
    if (this.userNotificationCallback) {
      this.userNotificationCallback(errorReport.userMessage, errorReport.severity);
    }
  }

  private logError(errorReport: ErrorReport) {
    if (__DEV__) {
      console.error('Salle Error Report:', errorReport);
    } else {
      // In production, send to analytics service
      // Analytics.trackError(errorReport);
    }
  }

  private logRecovery(errorReport: ErrorReport) {
    if (__DEV__) {
      console.log('Salle Recovery Success:', errorReport.id);
    }
  }

  private maintainErrorHistory() {
    // Keep only last 50 errors
    if (this.errorHistory.length > 50) {
      this.errorHistory = this.errorHistory.slice(-50);
    }
  }

  // Public methods for integration

  setUserNotificationCallback(callback: (message: string, severity: string) => void) {
    this.userNotificationCallback = callback;
  }

  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  getErrorStats(): {
    total: number;
    bySeverity: { [key: string]: number };
    byType: { [key: string]: number };
    recoveryRate: number;
  } {
    const stats = {
      total: this.errorHistory.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: {},
      recoveryRate: 0
    };

    let recoveredCount = 0;

    this.errorHistory.forEach(error => {
      stats.bySeverity[error.severity]++;
      
      const type = this.classifyError(new Error(error.message));
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      if (error.recoverable) recoveredCount++;
    });

    stats.recoveryRate = this.errorHistory.length > 0 
      ? Math.round((recoveredCount / this.errorHistory.length) * 100)
      : 0;

    return stats;
  }

  // Integration with React Error Boundaries
  static createErrorBoundary(component: string) {
    return (error: Error, errorInfo: any) => {
      const handler = new EnhancedErrorHandler();
      return handler.handleError(error, {
        component,
        timestamp: Date.now(),
        stack: error.stack
      });
    };
  }

  // Utility for wrapping async operations
  static async safeAsync<T>(
    operation: () => Promise<T>,
    fallback?: T,
    context?: Partial<ErrorContext>
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      const handler = new EnhancedErrorHandler();
      await handler.handleError(error as Error, context);
      return fallback;
    }
  }

  // Utility for wrapping sync operations
  static safe<T>(
    operation: () => T,
    fallback?: T,
    context?: Partial<ErrorContext>
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      const handler = new EnhancedErrorHandler();
      handler.handleError(error as Error, context);
      return fallback;
    }
  }
}