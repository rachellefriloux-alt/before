/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie AI - Performance Optimization and Scaling System                    │
 * │                                                                              │
 * │   Comprehensive performance monitoring and auto-scaling for production      │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { EventEmitter } from 'events';

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  source: string;
}

export interface ScalingRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'ne';
  threshold: number;
  duration: number; // seconds
  cooldown: number; // seconds
  action: 'scale_up' | 'scale_down' | 'alert';
  parameters: {
    minInstances?: number;
    maxInstances?: number;
    stepSize?: number;
  };
  enabled: boolean;
  lastTriggered?: Date;
}

export interface AutoScalingGroup {
  id: string;
  name: string;
  service: string;
  minInstances: number;
  maxInstances: number;
  currentInstances: number;
  targetInstances: number;
  scalingRules: string[]; // Rule IDs
  lastScalingEvent?: Date;
  status: 'healthy' | 'scaling_up' | 'scaling_down' | 'error';
}

export interface PerformanceProfile {
  id: string;
  name: string;
  description: string;
  targetMetrics: {
    responseTime: number; // ms
    throughput: number; // req/sec
    errorRate: number; // percentage
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
  };
  optimizationStrategies: OptimizationStrategy[];
  active: boolean;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  type: 'caching' | 'database' | 'code' | 'infrastructure' | 'algorithm';
  description: string;
  impact: 'high' | 'medium' | 'low';
  complexity: 'high' | 'medium' | 'low';
  estimatedImprovement: number; // percentage
  implementationStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
  appliedAt?: Date;
  results?: {
    before: Record<string, number>;
    after: Record<string, number>;
    improvement: number;
  };
}

export interface LoadTestResult {
  id: string;
  timestamp: Date;
  scenario: string;
  duration: number; // seconds
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number; // req/sec
    errorRate: number;
  };
  recommendations: string[];
  passed: boolean;
}

export interface PerformanceAlert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface ResourcePool {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'disk' | 'network';
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  allocationStrategy: 'fair' | 'priority' | 'reservation';
  reservations: ResourceReservation[];
}

export interface ResourceReservation {
  id: string;
  service: string;
  amount: number;
  priority: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'expired' | 'cancelled';
}

/**
 * Performance Optimization and Scaling Manager
 */
export class PerformanceOptimizationManager extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private scalingRules: Map<string, ScalingRule> = new Map();
  private autoScalingGroups: Map<string, AutoScalingGroup> = new Map();
  private performanceProfiles: Map<string, PerformanceProfile> = new Map();
  private loadTestResults: LoadTestResult[] = [];
  private performanceAlerts: PerformanceAlert[] = [];
  private resourcePools: Map<string, ResourcePool> = new Map();

  private monitoringInterval: NodeJS.Timeout | null = null;
  private scalingInterval: NodeJS.Timeout | null = null;
  private optimizationInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeDefaultScalingRules();
    this.initializeDefaultAutoScalingGroups();
    this.initializeDefaultPerformanceProfiles();
    this.initializeResourcePools();
  }

  /**
   * Initialize default scaling rules
   */
  private initializeDefaultScalingRules(): void {
    const defaultRules: ScalingRule[] = [
      {
        id: 'cpu_scale_up',
        name: 'CPU Scale Up',
        description: 'Scale up when CPU usage exceeds 70%',
        metric: 'cpu_usage',
        condition: 'gt',
        threshold: 70,
        duration: 300, // 5 minutes
        cooldown: 600, // 10 minutes
        action: 'scale_up',
        parameters: {
          minInstances: 1,
          maxInstances: 10,
          stepSize: 1
        },
        enabled: true
      },
      {
        id: 'cpu_scale_down',
        name: 'CPU Scale Down',
        description: 'Scale down when CPU usage drops below 30%',
        metric: 'cpu_usage',
        condition: 'lt',
        threshold: 30,
        duration: 600, // 10 minutes
        cooldown: 1200, // 20 minutes
        action: 'scale_down',
        parameters: {
          minInstances: 1,
          maxInstances: 10,
          stepSize: 1
        },
        enabled: true
      },
      {
        id: 'memory_scale_up',
        name: 'Memory Scale Up',
        description: 'Scale up when memory usage exceeds 80%',
        metric: 'memory_usage',
        condition: 'gt',
        threshold: 80,
        duration: 300,
        cooldown: 600,
        action: 'scale_up',
        parameters: {
          minInstances: 1,
          maxInstances: 10,
          stepSize: 1
        },
        enabled: true
      },
      {
        id: 'response_time_alert',
        name: 'High Response Time Alert',
        description: 'Alert when response time exceeds 2 seconds',
        metric: 'response_time_p95',
        condition: 'gt',
        threshold: 2000,
        duration: 60, // 1 minute
        cooldown: 300, // 5 minutes
        action: 'alert',
        parameters: {},
        enabled: true
      },
      {
        id: 'throughput_scale_up',
        name: 'Throughput Scale Up',
        description: 'Scale up when throughput exceeds capacity',
        metric: 'throughput',
        condition: 'gt',
        threshold: 1000, // 1000 req/sec
        duration: 300,
        cooldown: 600,
        action: 'scale_up',
        parameters: {
          minInstances: 1,
          maxInstances: 20,
          stepSize: 2
        },
        enabled: true
      }
    ];

    defaultRules.forEach(rule => this.scalingRules.set(rule.id, rule));
  }

  /**
   * Initialize default auto-scaling groups
   */
  private initializeDefaultAutoScalingGroups(): void {
    const defaultGroups: AutoScalingGroup[] = [
      {
        id: 'api_servers',
        name: 'API Servers',
        service: 'api',
        minInstances: 2,
        maxInstances: 10,
        currentInstances: 3,
        targetInstances: 3,
        scalingRules: ['cpu_scale_up', 'cpu_scale_down', 'memory_scale_up', 'response_time_alert'],
        status: 'healthy'
      },
      {
        id: 'ai_workers',
        name: 'AI Workers',
        service: 'ai',
        minInstances: 1,
        maxInstances: 5,
        currentInstances: 2,
        targetInstances: 2,
        scalingRules: ['cpu_scale_up', 'cpu_scale_down', 'throughput_scale_up'],
        status: 'healthy'
      },
      {
        id: 'database_replicas',
        name: 'Database Replicas',
        service: 'database',
        minInstances: 1,
        maxInstances: 3,
        currentInstances: 1,
        targetInstances: 1,
        scalingRules: ['cpu_scale_up', 'memory_scale_up'],
        status: 'healthy'
      }
    ];

    defaultGroups.forEach(group => this.autoScalingGroups.set(group.id, group));
  }

  /**
   * Initialize default performance profiles
   */
  private initializeDefaultPerformanceProfiles(): void {
    const defaultProfiles: PerformanceProfile[] = [
      {
        id: 'production_optimized',
        name: 'Production Optimized',
        description: 'Optimized for production workloads with high availability',
        targetMetrics: {
          responseTime: 500, // 500ms
          throughput: 1000, // 1000 req/sec
          errorRate: 0.1, // 0.1%
          cpuUsage: 70, // 70%
          memoryUsage: 80 // 80%
        },
        optimizationStrategies: [
          {
            id: 'redis_caching',
            name: 'Redis Caching Layer',
            type: 'caching',
            description: 'Implement Redis for frequently accessed data',
            impact: 'high',
            complexity: 'medium',
            estimatedImprovement: 40,
            implementationStatus: 'completed'
          },
          {
            id: 'db_query_optimization',
            name: 'Database Query Optimization',
            type: 'database',
            description: 'Optimize slow database queries and add indexes',
            impact: 'high',
            complexity: 'medium',
            estimatedImprovement: 30,
            implementationStatus: 'in_progress'
          },
          {
            id: 'code_profiling',
            name: 'Code Profiling and Optimization',
            type: 'code',
            description: 'Profile and optimize performance bottlenecks',
            impact: 'medium',
            complexity: 'high',
            estimatedImprovement: 20,
            implementationStatus: 'not_started'
          }
        ],
        active: true
      },
      {
        id: 'high_performance',
        name: 'High Performance',
        description: 'Maximum performance configuration for peak loads',
        targetMetrics: {
          responseTime: 200, // 200ms
          throughput: 2000, // 2000 req/sec
          errorRate: 0.05, // 0.05%
          cpuUsage: 80, // 80%
          memoryUsage: 85 // 85%
        },
        optimizationStrategies: [
          {
            id: 'advanced_caching',
            name: 'Advanced Multi-Level Caching',
            type: 'caching',
            description: 'Implement multi-level caching with CDN',
            impact: 'high',
            complexity: 'high',
            estimatedImprovement: 50,
            implementationStatus: 'not_started'
          },
          {
            id: 'horizontal_scaling',
            name: 'Horizontal Pod Autoscaling',
            type: 'infrastructure',
            description: 'Implement advanced horizontal scaling',
            impact: 'high',
            complexity: 'high',
            estimatedImprovement: 60,
            implementationStatus: 'not_started'
          }
        ],
        active: false
      }
    ];

    defaultProfiles.forEach(profile => this.performanceProfiles.set(profile.id, profile));
  }

  /**
   * Initialize resource pools
   */
  private initializeResourcePools(): void {
    const defaultPools: ResourcePool[] = [
      {
        id: 'cpu_pool',
        name: 'CPU Resource Pool',
        type: 'cpu',
        totalCapacity: 100, // 100 CPU cores
        usedCapacity: 30,
        availableCapacity: 70,
        allocationStrategy: 'fair',
        reservations: []
      },
      {
        id: 'memory_pool',
        name: 'Memory Resource Pool',
        type: 'memory',
        totalCapacity: 1024, // 1024 GB
        usedCapacity: 256,
        availableCapacity: 768,
        allocationStrategy: 'priority',
        reservations: []
      },
      {
        id: 'disk_pool',
        name: 'Disk Resource Pool',
        type: 'disk',
        totalCapacity: 10000, // 10000 GB
        usedCapacity: 2000,
        availableCapacity: 8000,
        allocationStrategy: 'reservation',
        reservations: []
      }
    ];

    defaultPools.forEach(pool => this.resourcePools.set(pool.id, pool));
  }

  /**
   * Start performance monitoring and optimization
   */
  public startPerformanceOptimization(): void {
    console.log('⚡ Starting performance optimization...');

    // Monitor performance metrics
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
      this.checkScalingRules();
      this.checkPerformanceAlerts();
    }, 30000); // Every 30 seconds

    // Run optimization checks
    this.optimizationInterval = setInterval(() => {
      this.runOptimizationStrategies();
    }, 300000); // Every 5 minutes

    // Auto-scaling decisions
    this.scalingInterval = setInterval(() => {
      this.evaluateAutoScaling();
    }, 60000); // Every minute

    this.emit('optimization-started');
  }

  /**
   * Stop performance optimization
   */
  public stopPerformanceOptimization(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }

    if (this.scalingInterval) {
      clearInterval(this.scalingInterval);
      this.scalingInterval = null;
    }

    this.emit('optimization-stopped');
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      // Collect system metrics
      await this.collectSystemMetrics();

      // Collect application metrics
      await this.collectApplicationMetrics();

      // Collect business metrics
      await this.collectBusinessMetrics();

      this.emit('metrics-collected');

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    // Simulate system metrics collection
    const metrics: Omit<PerformanceMetric, 'id' | 'timestamp'>[] = [
      {
        name: 'cpu_usage',
        value: Math.random() * 30 + 40, // 40-70%
        unit: 'percentage',
        tags: { service: 'system' },
        source: 'system_monitor'
      },
      {
        name: 'memory_usage',
        value: Math.random() * 20 + 50, // 50-70%
        unit: 'percentage',
        tags: { service: 'system' },
        source: 'system_monitor'
      },
      {
        name: 'disk_usage',
        value: Math.random() * 10 + 40, // 40-50%
        unit: 'percentage',
        tags: { service: 'system' },
        source: 'system_monitor'
      },
      {
        name: 'network_in',
        value: Math.random() * 100 + 200, // 200-300 MB/s
        unit: 'MB/s',
        tags: { service: 'system' },
        source: 'system_monitor'
      },
      {
        name: 'network_out',
        value: Math.random() * 100 + 200, // 200-300 MB/s
        unit: 'MB/s',
        tags: { service: 'system' },
        source: 'system_monitor'
      }
    ];

    metrics.forEach(metric => this.storeMetric(metric));
  }

  /**
   * Collect application metrics
   */
  private async collectApplicationMetrics(): Promise<void> {
    // Simulate application metrics collection
    const metrics: Omit<PerformanceMetric, 'id' | 'timestamp'>[] = [
      {
        name: 'response_time_p50',
        value: Math.random() * 100 + 200, // 200-300ms
        unit: 'milliseconds',
        tags: { service: 'api', endpoint: '/api/v1/*' },
        source: 'application_monitor'
      },
      {
        name: 'response_time_p95',
        value: Math.random() * 200 + 400, // 400-600ms
        unit: 'milliseconds',
        tags: { service: 'api', endpoint: '/api/v1/*' },
        source: 'application_monitor'
      },
      {
        name: 'response_time_p99',
        value: Math.random() * 500 + 800, // 800-1300ms
        unit: 'milliseconds',
        tags: { service: 'api', endpoint: '/api/v1/*' },
        source: 'application_monitor'
      },
      {
        name: 'throughput',
        value: Math.floor(Math.random() * 200) + 300, // 300-500 req/sec
        unit: 'requests/second',
        tags: { service: 'api' },
        source: 'application_monitor'
      },
      {
        name: 'error_rate',
        value: Math.random() * 2, // 0-2%
        unit: 'percentage',
        tags: { service: 'api' },
        source: 'application_monitor'
      },
      {
        name: 'active_connections',
        value: Math.floor(Math.random() * 100) + 200, // 200-300 connections
        unit: 'count',
        tags: { service: 'api' },
        source: 'application_monitor'
      }
    ];

    metrics.forEach(metric => this.storeMetric(metric));
  }

  /**
   * Collect business metrics
   */
  private async collectBusinessMetrics(): Promise<void> {
    // Simulate business metrics collection
    const metrics: Omit<PerformanceMetric, 'id' | 'timestamp'>[] = [
      {
        name: 'user_sessions',
        value: Math.floor(Math.random() * 1000) + 5000, // 5000-6000 sessions
        unit: 'count',
        tags: { business: 'engagement' },
        source: 'business_monitor'
      },
      {
        name: 'api_calls',
        value: Math.floor(Math.random() * 5000) + 10000, // 10000-15000 calls
        unit: 'count',
        tags: { business: 'usage' },
        source: 'business_monitor'
      },
      {
        name: 'data_processed',
        value: Math.random() * 100 + 500, // 500-600 GB
        unit: 'GB',
        tags: { business: 'data' },
        source: 'business_monitor'
      }
    ];

    metrics.forEach(metric => this.storeMetric(metric));
  }

  /**
   * Store performance metric
   */
  private storeMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const metricData: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...metric
    };

    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metricHistory = this.metrics.get(metric.name)!;
    metricHistory.push(metricData);

    // Keep only last 1000 data points per metric
    if (metricHistory.length > 1000) {
      metricHistory.shift();
    }
  }

  /**
   * Check scaling rules
   */
  private checkScalingRules(): void {
    const now = new Date();

    this.scalingRules.forEach(rule => {
      if (!rule.enabled) return;

      // Check cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = (now.getTime() - rule.lastTriggered.getTime()) / 1000;
        if (timeSinceLastTrigger < rule.cooldown) return;
      }

      // Check condition
      const metricValue = this.getCurrentMetricValue(rule.metric);
      if (metricValue === null) return;

      let conditionMet = false;
      switch (rule.condition) {
        case 'gt':
          conditionMet = metricValue > rule.threshold;
          break;
        case 'lt':
          conditionMet = metricValue < rule.threshold;
          break;
        case 'eq':
          conditionMet = metricValue === rule.threshold;
          break;
        case 'ne':
          conditionMet = metricValue !== rule.threshold;
          break;
      }

      if (conditionMet) {
        this.triggerScalingAction(rule, metricValue);
      }
    });
  }

  /**
   * Get current metric value
   */
  private getCurrentMetricValue(metricName: string): number | null {
    const metricHistory = this.metrics.get(metricName);
    if (!metricHistory || metricHistory.length === 0) return null;

    return metricHistory[metricHistory.length - 1].value;
  }

  /**
   * Trigger scaling action
   */
  private triggerScalingAction(rule: ScalingRule, metricValue: number): void {
    console.log(`🔄 Triggering scaling action: ${rule.name} (${metricValue} ${rule.condition} ${rule.threshold})`);

    rule.lastTriggered = new Date();

    if (rule.action === 'alert') {
      this.createPerformanceAlert(rule, metricValue);
    } else {
      // Find affected auto-scaling groups
      this.autoScalingGroups.forEach(group => {
        if (group.scalingRules.includes(rule.id)) {
          this.scaleAutoScalingGroup(group, rule);
        }
      });
    }

    this.emit('scaling-action-triggered', { rule, metricValue });
  }

  /**
   * Scale auto-scaling group
   */
  private async scaleAutoScalingGroup(group: AutoScalingGroup, rule: ScalingRule): Promise<void> {
    const stepSize = rule.parameters.stepSize || 1;
    let newTargetInstances = group.targetInstances;

    if (rule.action === 'scale_up') {
      newTargetInstances = Math.min(group.maxInstances, group.targetInstances + stepSize);
    } else if (rule.action === 'scale_down') {
      newTargetInstances = Math.max(group.minInstances, group.targetInstances - stepSize);
    }

    if (newTargetInstances !== group.targetInstances) {
      console.log(`📈 Scaling ${group.name}: ${group.targetInstances} → ${newTargetInstances} instances`);

      group.targetInstances = newTargetInstances;
      group.status = rule.action === 'scale_up' ? 'scaling_up' : 'scaling_down';
      group.lastScalingEvent = new Date();

      // Simulate scaling operation
      setTimeout(() => {
        group.currentInstances = newTargetInstances;
        group.status = 'healthy';
        this.autoScalingGroups.set(group.id, group);
        this.emit('scaling-completed', group);
      }, 30000); // 30 seconds scaling time

      this.autoScalingGroups.set(group.id, group);
      this.emit('scaling-initiated', group);
    }
  }

  /**
   * Create performance alert
   */
  private createPerformanceAlert(rule: ScalingRule, metricValue: number): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity: 'warning',
      metric: rule.metric,
      currentValue: metricValue,
      threshold: rule.threshold,
      message: `${rule.name}: ${rule.metric} is ${metricValue} (threshold: ${rule.threshold})`,
      resolved: false
    };

    this.performanceAlerts.push(alert);
    this.emit('performance-alert', alert);

    console.log(`🚨 Performance Alert: ${alert.message}`);
  }

  /**
   * Check performance alerts
   */
  private checkPerformanceAlerts(): void {
    const now = new Date();

    this.performanceAlerts.forEach(alert => {
      if (alert.resolved) return;

      const metricValue = this.getCurrentMetricValue(alert.metric);
      if (metricValue === null) return;

      // Check if alert condition is no longer met
      const stillAlerting = alert.metric.includes('response_time') ?
        metricValue > alert.threshold :
        metricValue > alert.threshold;

      if (!stillAlerting) {
        alert.resolved = true;
        alert.resolvedAt = now;
        this.emit('alert-resolved', alert);
        console.log(`✅ Alert resolved: ${alert.message}`);
      }
    });
  }

  /**
   * Evaluate auto-scaling decisions
   */
  private evaluateAutoScaling(): void {
    this.autoScalingGroups.forEach(group => {
      if (group.currentInstances !== group.targetInstances) {
        // Continue scaling operation
        console.log(`⏳ Scaling ${group.name}: ${group.currentInstances}/${group.targetInstances} instances`);
      }
    });
  }

  /**
   * Run optimization strategies
   */
  private async runOptimizationStrategies(): Promise<void> {
    for (const [profileId, profile] of this.performanceProfiles) {
      if (!profile.active) continue;

      for (const strategy of profile.optimizationStrategies) {
        if (strategy.implementationStatus === 'not_started') {
          await this.implementOptimizationStrategy(strategy, profile);
        }
      }
    }
  }

  /**
   * Implement optimization strategy
   */
  private async implementOptimizationStrategy(
    strategy: OptimizationStrategy,
    profile: PerformanceProfile
  ): Promise<void> {
    console.log(`🔧 Implementing optimization: ${strategy.name}`);

    strategy.implementationStatus = 'in_progress';

    try {
      // Capture before metrics
      const beforeMetrics = this.captureCurrentMetrics();

      // Simulate strategy implementation
      await this.simulateStrategyImplementation(strategy);

      // Capture after metrics
      const afterMetrics = this.captureCurrentMetrics();

      // Calculate improvement
      const improvement = this.calculateImprovement(beforeMetrics, afterMetrics);

      strategy.implementationStatus = 'completed';
      strategy.appliedAt = new Date();
      strategy.results = {
        before: beforeMetrics,
        after: afterMetrics,
        improvement
      };

      console.log(`✅ Optimization completed: ${strategy.name} (${improvement.toFixed(1)}% improvement)`);

    } catch (error) {
      strategy.implementationStatus = 'failed';
      console.error(`❌ Optimization failed: ${strategy.name}`, error);
    }

    this.emit('optimization-strategy-completed', { strategy, profile });
  }

  /**
   * Capture current metrics for comparison
   */
  private captureCurrentMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};

    ['response_time_p95', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage'].forEach(metric => {
      const value = this.getCurrentMetricValue(metric);
      if (value !== null) {
        metrics[metric] = value;
      }
    });

    return metrics;
  }

  /**
   * Simulate strategy implementation
   */
  private async simulateStrategyImplementation(strategy: OptimizationStrategy): Promise<void> {
    // Simulate implementation time based on complexity
    const implementationTime = strategy.complexity === 'high' ? 10000 :
                              strategy.complexity === 'medium' ? 5000 : 2000;

    await new Promise(resolve => setTimeout(resolve, implementationTime));
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(before: Record<string, number>, after: Record<string, number>): number {
    let totalImprovement = 0;
    let metricCount = 0;

    Object.keys(before).forEach(metric => {
      if (after[metric]) {
        const improvement = ((before[metric] - after[metric]) / before[metric]) * 100;
        totalImprovement += improvement;
        metricCount++;
      }
    });

    return metricCount > 0 ? totalImprovement / metricCount : 0;
  }

  /**
   * Run load test
   */
  public async runLoadTest(scenario: string, duration: number = 300): Promise<LoadTestResult> {
    console.log(`🧪 Running load test: ${scenario}`);

    const startTime = Date.now();
    const testResult: LoadTestResult = {
      id: `loadtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      scenario,
      duration,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        throughput: 0,
        errorRate: 0
      },
      recommendations: [],
      passed: false
    };

    try {
      // Simulate load test execution
      await this.simulateLoadTest(testResult);

      // Analyze results
      testResult.passed = this.analyzeLoadTestResults(testResult);
      testResult.recommendations = this.generateLoadTestRecommendations(testResult);

      console.log(`✅ Load test completed: ${scenario} (${testResult.passed ? 'PASSED' : 'FAILED'})`);

    } catch (error) {
      console.error(`❌ Load test failed: ${scenario}`, error);
    }

    this.loadTestResults.push(testResult);
    this.emit('load-test-completed', testResult);

    return testResult;
  }

  /**
   * Simulate load test execution
   */
  private async simulateLoadTest(result: LoadTestResult): Promise<void> {
    // Simulate test execution
    const totalRequests = Math.floor(Math.random() * 50000) + 50000; // 50k-100k requests
    const successfulRequests = Math.floor(totalRequests * (0.95 + Math.random() * 0.04)); // 95-99% success
    const failedRequests = totalRequests - successfulRequests;

    result.metrics = {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.random() * 200 + 300, // 300-500ms
      p95ResponseTime: Math.random() * 300 + 600, // 600-900ms
      p99ResponseTime: Math.random() * 500 + 1000, // 1000-1500ms
      throughput: totalRequests / result.duration,
      errorRate: (failedRequests / totalRequests) * 100
    };

    // Simulate test duration
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Analyze load test results
   */
  private analyzeLoadTestResults(result: LoadTestResult): boolean {
    const { metrics } = result;

    // Define pass criteria
    const passCriteria = {
      errorRate: 5, // < 5%
      p95ResponseTime: 1000, // < 1000ms
      throughput: 500 // > 500 req/sec
    };

    return metrics.errorRate < passCriteria.errorRate &&
           metrics.p95ResponseTime < passCriteria.p95ResponseTime &&
           metrics.throughput > passCriteria.throughput;
  }

  /**
   * Generate load test recommendations
   */
  private generateLoadTestRecommendations(result: LoadTestResult): string[] {
    const recommendations: string[] = [];
    const { metrics } = result;

    if (metrics.errorRate > 5) {
      recommendations.push('High error rate detected. Consider increasing instance capacity or optimizing error handling.');
    }

    if (metrics.p95ResponseTime > 1000) {
      recommendations.push('Slow response times detected. Consider implementing caching or database optimization.');
    }

    if (metrics.throughput < 500) {
      recommendations.push('Low throughput detected. Consider horizontal scaling or performance optimization.');
    }

    if (metrics.p99ResponseTime > 2000) {
      recommendations.push('Extreme response time outliers detected. Investigate and optimize slow requests.');
    }

    return recommendations;
  }

  /**
   * Get performance metrics
   */
  public getMetrics(metricName?: string, hours: number = 1): PerformanceMetric[] {
    if (metricName) {
      const metrics = this.metrics.get(metricName) || [];
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      return metrics.filter(m => m.timestamp >= cutoffTime);
    }

    // Return all metrics
    const allMetrics: PerformanceMetric[] = [];
    this.metrics.forEach(metrics => allMetrics.push(...metrics));
    return allMetrics;
  }

  /**
   * Get auto-scaling groups
   */
  public getAutoScalingGroups(): AutoScalingGroup[] {
    return Array.from(this.autoScalingGroups.values());
  }

  /**
   * Get performance profiles
   */
  public getPerformanceProfiles(): PerformanceProfile[] {
    return Array.from(this.performanceProfiles.values());
  }

  /**
   * Get load test results
   */
  public getLoadTestResults(limit: number = 10): LoadTestResult[] {
    return this.loadTestResults.slice(-limit);
  }

  /**
   * Get active performance alerts
   */
  public getActiveAlerts(): PerformanceAlert[] {
    return this.performanceAlerts.filter(alert => !alert.resolved);
  }

  /**
   * Get resource pools
   */
  public getResourcePools(): ResourcePool[] {
    return Array.from(this.resourcePools.values());
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): string {
    const currentMetrics = this.captureCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    const scalingGroups = this.getAutoScalingGroups();
    const recentLoadTests = this.getLoadTestResults(5);

    let report = `# Sallie AI Performance Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Current Performance Metrics\n\n`;
    Object.entries(currentMetrics).forEach(([metric, value]) => {
      const formattedValue = metric.includes('time') ? `${value.toFixed(0)}ms` :
                           metric.includes('rate') ? `${value.toFixed(2)}%` :
                           metric.includes('usage') ? `${value.toFixed(1)}%` :
                           value.toFixed(2);
      report += `- **${metric.replace(/_/g, ' ').toUpperCase()}:** ${formattedValue}\n`;
    });
    report += '\n';

    report += `## Auto-Scaling Status\n\n`;
    scalingGroups.forEach(group => {
      const status = group.status === 'healthy' ? '✅' :
                    group.status === 'scaling_up' ? '📈' :
                    group.status === 'scaling_down' ? '📉' : '❌';
      report += `${status} **${group.name}:** ${group.currentInstances}/${group.targetInstances} instances (${group.status})\n`;
    });
    report += '\n';

    if (activeAlerts.length > 0) {
      report += `## Active Performance Alerts\n\n`;
      activeAlerts.forEach(alert => {
        const severity = alert.severity === 'critical' ? '🚨' :
                        alert.severity === 'warning' ? '⚠️' : 'ℹ️';
        report += `${severity} **${alert.metric}:** ${alert.currentValue} (threshold: ${alert.threshold})\n`;
      });
      report += '\n';
    }

    report += `## Recent Load Tests\n\n`;
    if (recentLoadTests.length === 0) {
      report += 'No load tests completed.\n\n';
    } else {
      recentLoadTests.forEach(test => {
        const status = test.passed ? '✅ PASSED' : '❌ FAILED';
        report += `- **${test.scenario}** (${test.timestamp.toISOString()}): ${status}\n`;
        report += `  - Throughput: ${test.metrics.throughput.toFixed(0)} req/sec\n`;
        report += `  - Error Rate: ${test.metrics.errorRate.toFixed(2)}%\n`;
        report += `  - P95 Response Time: ${test.metrics.p95ResponseTime.toFixed(0)}ms\n`;
        if (test.recommendations.length > 0) {
          report += `  - Recommendations: ${test.recommendations.join('; ')}\n`;
        }
      });
      report += '\n';
    }

    return report;
  }
}

// Export singleton instance
export const performanceManager = new PerformanceOptimizationManager();

// Performance utilities
export class PerformanceUtils {
  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }

  static calculateMovingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];

    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, value) => sum + value, 0) / windowSize;
      result.push(average);
    }

    return result;
  }

  static detectAnomalies(values: number[], threshold: number = 2): number[] {
    if (values.length < 10) return [];

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
    );

    const anomalies: number[] = [];
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push(index);
      }
    });

    return anomalies;
  }

  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  static generateScalingRecommendation(
    currentMetrics: Record<string, number>,
    targetMetrics: Record<string, number>
  ): {
    shouldScale: boolean;
    direction: 'up' | 'down' | 'none';
    reason: string;
    confidence: number;
  } {
    let scaleUpScore = 0;
    let scaleDownScore = 0;

    // Evaluate each metric
    Object.entries(currentMetrics).forEach(([metric, currentValue]) => {
      const targetValue = targetMetrics[metric];
      if (!targetValue) return;

      if (metric.includes('usage') || metric.includes('rate')) {
        // Higher usage = potential scale up
        if (currentValue > targetValue * 0.8) scaleUpScore += 1;
        if (currentValue < targetValue * 0.3) scaleDownScore += 1;
      } else if (metric.includes('response_time')) {
        // Higher response time = potential scale up
        if (currentValue > targetValue * 1.2) scaleUpScore += 1;
        if (currentValue < targetValue * 0.8) scaleDownScore += 1;
      }
    });

    if (scaleUpScore > scaleDownScore) {
      return {
        shouldScale: true,
        direction: 'up',
        reason: `High resource usage detected (${scaleUpScore} indicators)`,
        confidence: Math.min(scaleUpScore / 3, 1)
      };
    } else if (scaleDownScore > scaleUpScore) {
      return {
        shouldScale: true,
        direction: 'down',
        reason: `Low resource usage detected (${scaleDownScore} indicators)`,
        confidence: Math.min(scaleDownScore / 3, 1)
      };
    } else {
      return {
        shouldScale: false,
        direction: 'none',
        reason: 'Resource usage within acceptable range',
        confidence: 0.5
      };
    }
  }
}

// Initialize performance optimization
performanceManager.startPerformanceOptimization();
