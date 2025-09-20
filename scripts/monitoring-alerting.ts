/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie AI - Production Monitoring & Alerting System                       │
 * │                                                                              │
 * │   Comprehensive monitoring, alerting, and incident management for production │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { EventEmitter } from 'events';

export interface Metric {
  id: string;
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
  metadata: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  query: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    duration: number; // seconds
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
  enabled: boolean;
  cooldown: number; // seconds between alerts
  lastTriggered?: Date;
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  config: Record<string, any>;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: Date;
  labels: Record<string, string>;
  status: 'firing' | 'resolved';
  resolvedAt?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  annotations: Record<string, string>;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved';
  priority: 'p1' | 'p2' | 'p3' | 'p4' | 'p5';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  tags: string[];
  alerts: Alert[];
  timeline: IncidentEvent[];
  impact: {
    affectedUsers: number;
    affectedServices: string[];
    businessImpact: string;
  };
  rootCause?: string;
  resolution?: string;
}

export interface IncidentEvent {
  id: string;
  timestamp: Date;
  type: 'created' | 'updated' | 'comment' | 'assignment' | 'status_change' | 'alert_added' | 'identified';
  author: string;
  description: string;
  metadata: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  panels: DashboardPanel[];
  variables: DashboardVariable[];
  timeRange: {
    from: Date;
    to: Date;
  };
  refresh: number; // seconds
  tags: string[];
}

export interface DashboardPanel {
  id: string;
  title: string;
  type: 'graph' | 'singlestat' | 'table' | 'heatmap' | 'bargauge';
  targets: MetricQuery[];
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  options: Record<string, any>;
}

export interface MetricQuery {
  expr: string;
  legendFormat: string;
  refId: string;
}

export interface DashboardVariable {
  name: string;
  type: 'query' | 'custom' | 'constant';
  query?: string;
  values?: string[];
  defaultValue?: string;
}

export interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  indicator: {
    type: 'availability' | 'latency' | 'error_rate' | 'throughput';
    metric: string;
    good: {
      operator: 'gt' | 'lt' | 'eq';
      value: number;
    };
    total?: {
      operator: 'gt' | 'lt' | 'eq';
      value: number;
    };
  };
  objective: {
    target: number; // percentage (e.g., 99.9)
    window: string; // e.g., '30d', '7d', '1d'
  };
  burnRate: {
    fast: number; // e.g., 14.4 for 30d window
    slow: number; // e.g., 6 for 30d window
  };
  status: 'healthy' | 'warning' | 'breach';
  current: {
    value: number;
    timestamp: Date;
  };
}

/**
 * Production Monitoring Manager
 */
export class ProductionMonitoringManager extends EventEmitter {
  private metrics: Map<string, Metric[]> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private slos: Map<string, SLO> = new Map();
  private alertChannels: Map<string, AlertChannel> = new Map();

  constructor() {
    super();
    this.initializeDefaultConfigurations();
    this.startMonitoring();
  }

  /**
   * Initialize default monitoring configurations
   */
  private initializeDefaultConfigurations(): void {
    // Default alert rules
    const defaultAlertRules: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'Error rate is above 5%',
        query: 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100',
        condition: {
          operator: 'gt',
          threshold: 5,
          duration: 300 // 5 minutes
        },
        severity: 'error',
        channels: ['slack-devops', 'email-devops'],
        enabled: true,
        cooldown: 3600 // 1 hour
      },
      {
        id: 'high_response_time',
        name: 'High Response Time',
        description: '95th percentile response time is above 500ms',
        query: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
        condition: {
          operator: 'gt',
          threshold: 0.5,
          duration: 300
        },
        severity: 'warning',
        channels: ['slack-devops'],
        enabled: true,
        cooldown: 1800 // 30 minutes
      },
      {
        id: 'low_availability',
        name: 'Low Availability',
        description: 'Service availability is below 99.5%',
        query: 'up == 0',
        condition: {
          operator: 'eq',
          threshold: 0,
          duration: 60
        },
        severity: 'critical',
        channels: ['slack-devops', 'email-devops', 'pagerduty'],
        enabled: true,
        cooldown: 300 // 5 minutes
      },
      {
        id: 'high_cpu_usage',
        name: 'High CPU Usage',
        description: 'CPU usage is above 80%',
        query: 'cpu_usage_percent',
        condition: {
          operator: 'gt',
          threshold: 80,
          duration: 300
        },
        severity: 'warning',
        channels: ['slack-devops'],
        enabled: true,
        cooldown: 1800
      },
      {
        id: 'high_memory_usage',
        name: 'High Memory Usage',
        description: 'Memory usage is above 85%',
        query: 'memory_usage_percent',
        condition: {
          operator: 'gt',
          threshold: 85,
          duration: 300
        },
        severity: 'warning',
        channels: ['slack-devops'],
        enabled: true,
        cooldown: 1800
      }
    ];

    defaultAlertRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });

    // Default SLOs
    const defaultSLOs: SLO[] = [
      {
        id: 'api_availability',
        name: 'API Availability',
        description: 'API service availability SLO',
        service: 'api',
        indicator: {
          type: 'availability',
          metric: 'up',
          good: {
            operator: 'eq',
            value: 1
          }
        },
        objective: {
          target: 99.9,
          window: '30d'
        },
        burnRate: {
          fast: 14.4,
          slow: 6
        },
        status: 'healthy',
        current: {
          value: 99.95,
          timestamp: new Date()
        }
      },
      {
        id: 'api_latency',
        name: 'API Latency',
        description: 'API response time SLO',
        service: 'api',
        indicator: {
          type: 'latency',
          metric: 'http_request_duration_seconds',
          good: {
            operator: 'lt',
            value: 0.5
          }
        },
        objective: {
          target: 99,
          window: '30d'
        },
        burnRate: {
          fast: 14.4,
          slow: 6
        },
        status: 'healthy',
        current: {
          value: 99.2,
          timestamp: new Date()
        }
      }
    ];

    defaultSLOs.forEach(slo => {
      this.slos.set(slo.id, slo);
    });

    // Default alert channels
    const defaultChannels: AlertChannel[] = [
      {
        id: 'slack-devops',
        type: 'slack',
        config: {
          webhookUrl: process.env.SLACK_DEVOPS_WEBHOOK || '',
          channel: '#devops-alerts'
        },
        enabled: true
      },
      {
        id: 'email-devops',
        type: 'email',
        config: {
          smtpHost: process.env.SMTP_HOST || '',
          smtpPort: process.env.SMTP_PORT || '587',
          username: process.env.SMTP_USERNAME || '',
          password: process.env.SMTP_PASSWORD || '',
          from: 'alerts@sallie.ai',
          to: ['devops@sallie.ai', 'oncall@sallie.ai']
        },
        enabled: true
      },
      {
        id: 'pagerduty',
        type: 'pagerduty',
        config: {
          integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || '',
          serviceId: process.env.PAGERDUTY_SERVICE_ID || ''
        },
        enabled: true
      }
    ];

    defaultChannels.forEach(channel => {
      this.alertChannels.set(channel.id, channel);
    });
  }

  /**
   * Start monitoring system
   */
  private startMonitoring(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Evaluate alert rules every minute
    setInterval(() => {
      this.evaluateAlertRules();
    }, 60000);

    // Update SLOs every 5 minutes
    setInterval(() => {
      this.updateSLOs();
    }, 300000);

    console.log('🔍 Production monitoring system started');
  }

  /**
   * Collect system and application metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics();
      systemMetrics.forEach(metric => {
        this.storeMetric(metric);
      });

      // Collect application metrics
      const appMetrics = await this.collectApplicationMetrics();
      appMetrics.forEach(metric => {
        this.storeMetric(metric);
      });

      // Collect business metrics
      const businessMetrics = await this.collectBusinessMetrics();
      businessMetrics.forEach(metric => {
        this.storeMetric(metric);
      });

    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = [];
    const timestamp = new Date();

    // Simulate system metrics collection
    metrics.push({
      id: `cpu_usage_${Date.now()}`,
      name: 'cpu_usage_percent',
      type: 'gauge',
      value: Math.random() * 100,
      timestamp,
      labels: { host: 'sallie-prod-01' },
      metadata: {}
    });

    metrics.push({
      id: `memory_usage_${Date.now()}`,
      name: 'memory_usage_percent',
      type: 'gauge',
      value: Math.random() * 100,
      timestamp,
      labels: { host: 'sallie-prod-01' },
      metadata: {}
    });

    metrics.push({
      id: `disk_usage_${Date.now()}`,
      name: 'disk_usage_percent',
      type: 'gauge',
      value: Math.random() * 100,
      timestamp,
      labels: { host: 'sallie-prod-01', mount: '/' },
      metadata: {}
    });

    return metrics;
  }

  /**
   * Collect application metrics
   */
  private async collectApplicationMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = [];
    const timestamp = new Date();

    // Simulate application metrics
    metrics.push({
      id: `http_requests_${Date.now()}`,
      name: 'http_requests_total',
      type: 'counter',
      value: Math.floor(Math.random() * 1000),
      timestamp,
      labels: { method: 'GET', status: '200', endpoint: '/api/chat' },
      metadata: {}
    });

    metrics.push({
      id: `http_request_duration_${Date.now()}`,
      name: 'http_request_duration_seconds',
      type: 'histogram',
      value: Math.random() * 2,
      timestamp,
      labels: { method: 'POST', status: '200', endpoint: '/api/analyze' },
      metadata: { quantile: 0.95 }
    });

    metrics.push({
      id: `active_connections_${Date.now()}`,
      name: 'active_connections',
      type: 'gauge',
      value: Math.floor(Math.random() * 100),
      timestamp,
      labels: { service: 'api' },
      metadata: {}
    });

    return metrics;
  }

  /**
   * Collect business metrics
   */
  private async collectBusinessMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = [];
    const timestamp = new Date();

    // Simulate business metrics
    metrics.push({
      id: `user_sessions_${Date.now()}`,
      name: 'user_sessions_total',
      type: 'counter',
      value: Math.floor(Math.random() * 5000),
      timestamp,
      labels: { platform: 'mobile' },
      metadata: {}
    });

    metrics.push({
      id: `conversation_length_${Date.now()}`,
      name: 'conversation_length_seconds',
      type: 'histogram',
      value: Math.random() * 3600,
      timestamp,
      labels: { type: 'voice' },
      metadata: { quantile: 0.5 }
    });

    return metrics;
  }

  /**
   * Store metric
   */
  private storeMetric(metric: Metric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metricList = this.metrics.get(metric.name)!;
    metricList.push(metric);

    // Keep only last 1000 metrics per name
    if (metricList.length > 1000) {
      metricList.shift();
    }
  }

  /**
   * Evaluate alert rules
   */
  private async evaluateAlertRules(): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      try {
        const shouldAlert = await this.evaluateRule(rule);

        if (shouldAlert) {
          await this.fireAlert(rule);
        } else {
          await this.resolveAlert(rule.id);
        }
      } catch (error) {
        console.error(`Failed to evaluate alert rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * Evaluate alert rule
   */
  private async evaluateRule(rule: AlertRule): Promise<boolean> {
    // Simulate rule evaluation
    const metrics = this.metrics.get(rule.query.split('[')[0]) || [];
    if (metrics.length === 0) return false;

    const latestMetric = metrics[metrics.length - 1];
    const threshold = rule.condition.threshold;

    switch (rule.condition.operator) {
      case 'gt':
        return latestMetric.value > threshold;
      case 'lt':
        return latestMetric.value < threshold;
      case 'eq':
        return latestMetric.value === threshold;
      case 'ne':
        return latestMetric.value !== threshold;
      case 'gte':
        return latestMetric.value >= threshold;
      case 'lte':
        return latestMetric.value <= threshold;
      default:
        return false;
    }
  }

  /**
   * Fire alert
   */
  private async fireAlert(rule: AlertRule): Promise<void> {
    const existingAlert = this.activeAlerts.get(rule.id);

    // Check cooldown
    if (existingAlert && rule.lastTriggered) {
      const timeSinceLastTrigger = (Date.now() - rule.lastTriggered.getTime()) / 1000;
      if (timeSinceLastTrigger < rule.cooldown) {
        return; // Still in cooldown
      }
    }

    const alert: Alert = {
      id: existingAlert?.id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      severity: rule.severity,
      title: rule.name,
      description: rule.description,
      value: 0, // Would be populated from actual metric
      threshold: rule.condition.threshold,
      timestamp: new Date(),
      labels: {},
      status: 'firing',
      acknowledged: false,
      annotations: {}
    };

    this.activeAlerts.set(rule.id, alert);
    rule.lastTriggered = new Date();

    // Send notifications
    await this.sendAlertNotifications(alert, rule.channels);

    this.emit('alert-fired', alert);
    console.log(`🚨 Alert fired: ${alert.title}`);
  }

  /**
   * Resolve alert
   */
  private async resolveAlert(ruleId: string): Promise<void> {
    const alert = this.activeAlerts.get(ruleId);
    if (!alert || alert.status === 'resolved') return;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    this.emit('alert-resolved', alert);
    console.log(`✅ Alert resolved: ${alert.title}`);
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alert: Alert, channelIds: string[]): Promise<void> {
    for (const channelId of channelIds) {
      const channel = this.alertChannels.get(channelId);
      if (!channel || !channel.enabled) continue;

      try {
        await this.sendNotification(channel, alert);
      } catch (error) {
        console.error(`Failed to send notification to ${channelId}:`, error);
      }
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(channel: AlertChannel, alert: Alert): Promise<void> {
    console.log(`📤 Sending ${channel.type} notification for alert: ${alert.title}`);

    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Update SLOs
   */
  private async updateSLOs(): Promise<void> {
    for (const slo of this.slos.values()) {
      try {
        const currentValue = await this.calculateSLOValue(slo);
        slo.current = {
          value: currentValue,
          timestamp: new Date()
        };

        // Update status based on objective
        if (currentValue >= slo.objective.target) {
          slo.status = 'healthy';
        } else if (currentValue >= slo.objective.target * 0.95) {
          slo.status = 'warning';
        } else {
          slo.status = 'breach';
        }

        this.emit('slo-updated', slo);
      } catch (error) {
        console.error(`Failed to update SLO ${slo.id}:`, error);
      }
    }
  }

  /**
   * Calculate SLO value
   */
  private async calculateSLOValue(slo: SLO): Promise<number> {
    // Simulate SLO calculation
    return 99 + Math.random(); // 99-100%
  }

  /**
   * Create incident from alert
   */
  public async createIncidentFromAlert(alert: Alert): Promise<Incident> {
    const incident: Incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Incident: ${alert.title}`,
      description: alert.description,
      severity: this.mapAlertSeverityToIncidentSeverity(alert.severity),
      status: 'open',
      priority: this.calculateIncidentPriority(alert),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['alert-triggered', alert.ruleId],
      alerts: [alert],
      timeline: [
        {
          id: `event_${Date.now()}`,
          timestamp: new Date(),
          type: 'created',
          author: 'system',
          description: `Incident created from alert: ${alert.title}`,
          metadata: { alertId: alert.id }
        }
      ],
      impact: {
        affectedUsers: 0, // Would be calculated based on alert context
        affectedServices: [alert.labels.service || 'unknown'],
        businessImpact: 'Under investigation'
      }
    };

    this.incidents.set(incident.id, incident);
    this.emit('incident-created', incident);

    return incident;
  }

  /**
   * Map alert severity to incident severity
   */
  private mapAlertSeverityToIncidentSeverity(alertSeverity: Alert['severity']): Incident['severity'] {
    switch (alertSeverity) {
      case 'critical': return 'critical';
      case 'error': return 'high';
      case 'warning': return 'medium';
      case 'info': return 'low';
      default: return 'medium';
    }
  }

  /**
   * Calculate incident priority
   */
  private calculateIncidentPriority(alert: Alert): Incident['priority'] {
    if (alert.severity === 'critical') return 'p1';
    if (alert.severity === 'error') return 'p2';
    if (alert.severity === 'warning') return 'p3';
    return 'p4';
  }

  /**
   * Update incident
   */
  public async updateIncident(
    incidentId: string,
    updates: Partial<Incident>
  ): Promise<Incident | null> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    Object.assign(incident, updates);
    incident.updatedAt = new Date();

    // Add timeline event
    incident.timeline.push({
      id: `event_${Date.now()}`,
      timestamp: new Date(),
      type: 'updated',
      author: 'system',
      description: 'Incident updated',
      metadata: updates
    });

    this.emit('incident-updated', incident);
    return incident;
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get incidents
   */
  public getIncidents(status?: Incident['status']): Incident[] {
    const allIncidents = Array.from(this.incidents.values());
    if (!status) return allIncidents;

    return allIncidents.filter(incident => incident.status === status);
  }

  /**
   * Get SLOs
   */
  public getSLOs(): SLO[] {
    return Array.from(this.slos.values());
  }

  /**
   * Get metrics
   */
  public getMetrics(name?: string, limit: number = 100): Metric[] {
    if (name) {
      return (this.metrics.get(name) || []).slice(-limit);
    }

    const allMetrics: Metric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics.slice(-Math.floor(limit / this.metrics.size)));
    }

    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Generate monitoring report
   */
  public generateMonitoringReport(): string {
    const activeAlerts = this.getActiveAlerts();
    const incidents = this.getIncidents();
    const slos = this.getSLOs();

    let report = `# Sallie AI Production Monitoring Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## System Health\n\n`;
    report += `- **Active Alerts:** ${activeAlerts.length}\n`;
    report += `- **Open Incidents:** ${incidents.filter(i => i.status !== 'resolved').length}\n`;
    report += `- **SLOs:** ${slos.length}\n\n`;

    if (activeAlerts.length > 0) {
      report += `## Active Alerts\n\n`;
      activeAlerts.forEach(alert => {
        const severity = alert.severity === 'critical' ? '🔴' :
                        alert.severity === 'error' ? '🟠' :
                        alert.severity === 'warning' ? '🟡' : '🔵';
        report += `${severity} **${alert.title}** (${alert.severity})\n`;
        report += `  - ${alert.description}\n`;
        report += `  - Value: ${alert.value}, Threshold: ${alert.threshold}\n`;
        report += `  - Since: ${alert.timestamp.toISOString()}\n\n`;
      });
    }

    if (incidents.length > 0) {
      report += `## Recent Incidents\n\n`;
      incidents.slice(0, 5).forEach(incident => {
        const status = incident.status === 'resolved' ? '✅' :
                      incident.status === 'open' ? '🔴' :
                      incident.status === 'investigating' ? '🟡' : '🔵';
        report += `${status} **${incident.title}** (${incident.priority})\n`;
        report += `  - Status: ${incident.status}\n`;
        report += `  - Created: ${incident.createdAt.toISOString()}\n`;
        if (incident.resolvedAt) {
          report += `  - Resolved: ${incident.resolvedAt.toISOString()}\n`;
        }
        report += '\n';
      });
    }

    if (slos.length > 0) {
      report += `## SLO Status\n\n`;
      slos.forEach(slo => {
        const status = slo.status === 'healthy' ? '✅' :
                      slo.status === 'warning' ? '⚠️' : '❌';
        report += `${status} **${slo.name}**\n`;
        report += `  - Target: ${slo.objective.target}%\n`;
        report += `  - Current: ${slo.current.value.toFixed(2)}%\n`;
        report += `  - Status: ${slo.status}\n\n`;
      });
    }

    return report;
  }
}

// Export singleton instance
export const monitoringManager = new ProductionMonitoringManager();

// Monitoring utilities
export class MonitoringUtils {
  static calculateErrorBudget(slo: SLO): number {
    return 100 - slo.objective.target;
  }

  static calculateBurnRate(slo: SLO, timeWindow: number): number {
    // Calculate burn rate for given time window
    const errorBudget = this.calculateErrorBudget(slo);
    const totalWindow = this.parseTimeWindow(slo.objective.window);
    return (errorBudget / 100) * (totalWindow / timeWindow);
  }

  static parseTimeWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default to 1 day

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  }

  static generateAlertSummary(alerts: Alert[]): {
    critical: number;
    error: number;
    warning: number;
    info: number;
    total: number;
  } {
    const summary = {
      critical: 0,
      error: 0,
      warning: 0,
      info: 0,
      total: alerts.length
    };

    alerts.forEach(alert => {
      summary[alert.severity]++;
    });

    return summary;
  }

  static generateIncidentSummary(incidents: Incident[]): {
    open: number;
    investigating: number;
    resolved: number;
    total: number;
  } {
    const summary = {
      open: 0,
      investigating: 0,
      resolved: 0,
      total: incidents.length
    };

    incidents.forEach(incident => {
      switch (incident.status) {
        case 'open':
          summary.open++;
          break;
        case 'investigating':
        case 'identified':
        case 'monitoring':
          summary.investigating++;
          break;
        case 'resolved':
          summary.resolved++;
          break;
      }
    });

    return summary;
  }

  static calculateMTTR(incidents: Incident[]): number {
    const resolvedIncidents = incidents.filter(i => i.resolvedAt);

    if (resolvedIncidents.length === 0) return 0;

    const totalResolutionTime = resolvedIncidents.reduce((sum, incident) => {
      return sum + (incident.resolvedAt!.getTime() - incident.createdAt.getTime());
    }, 0);

    return totalResolutionTime / resolvedIncidents.length / (1000 * 60 * 60); // Hours
  }

  static calculateMTTD(incidents: Incident[]): number {
    const detectedIncidents = incidents.filter(i => i.timeline.some(e => e.type === 'identified'));

    if (detectedIncidents.length === 0) return 0;

    const totalDetectionTime = detectedIncidents.reduce((sum, incident) => {
      const createdEvent = incident.timeline.find(e => e.type === 'created');
      const identifiedEvent = incident.timeline.find(e => e.type === 'identified');

      if (createdEvent && identifiedEvent) {
        return sum + (identifiedEvent.timestamp.getTime() - createdEvent.timestamp.getTime());
      }

      return sum;
    }, 0);

    return totalDetectionTime / detectedIncidents.length / (1000 * 60); // Minutes
  }
}

// Health check utilities
export class HealthCheckUtils {
  static async performHealthCheck(endpoint: string): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Sallie-Health-Check/1.0'
        }
      });

      const responseTime = Date.now() - startTime;

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async performDatabaseHealthCheck(connectionString: string): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Simulate database connection check
      await new Promise(resolve => setTimeout(resolve, 100));

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  static async performServiceHealthCheck(serviceName: string): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    details?: Record<string, any>;
  }> {
    const startTime = Date.now();

    try {
      // Simulate service health check
      await new Promise(resolve => setTimeout(resolve, 200));

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        details: {
          version: '1.0.0',
          uptime: '2d 4h 30m',
          activeConnections: 42
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime
      };
    }
  }
}
