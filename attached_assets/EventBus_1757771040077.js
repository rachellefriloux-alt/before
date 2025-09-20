"use strict";
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Advanced Event Bus System                                         │
 * │                                                                              │
 * │   Centralized event communication system with advanced features              │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventBus = void 0;
const events_1 = require("events");
class SallieEventBus extends events_1.EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
        this.eventHistory = [];
        this.isPaused = false;
        this.metricsEnabled = false;
        this.startTime = new Date();
        this.errorCount = 0;
        this.setMaxListeners(100);
        this.analytics = this.initializeAnalytics();
        this.setupPeriodicCleanup();
    }
    initializeAnalytics() {
        return {
            totalEvents: 0,
            eventsByType: {},
            eventsBySource: {},
            averageProcessingTime: 0,
            errorRate: 0,
            throughput: 0,
            peakHourlyRate: 0
        };
    }
    setupPeriodicCleanup() {
        setInterval(() => {
            this.cleanupExpiredEvents();
            this.updateAnalytics();
        }, 60000); // Every minute
    }
    cleanupExpiredEvents() {
        const now = Date.now();
        this.eventHistory = this.eventHistory.filter(event => {
            if (event.ttl && event.timestamp.getTime() + event.ttl < now) {
                return false;
            }
            return true;
        });
    }
    updateAnalytics() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        // Update throughput and peak rates
        const recentEvents = this.eventHistory.filter(e => e.timestamp.getTime() > oneHourAgo);
        this.analytics.throughput = recentEvents.length / 3600; // events per second average
        this.analytics.peakHourlyRate = Math.max(this.analytics.peakHourlyRate, recentEvents.length);
        // Update error rate
        this.analytics.errorRate = this.errorCount / Math.max(this.analytics.totalEvents, 1);
    }
    matchesFilter(event, filter) {
        if (filter.eventTypes && !filter.eventTypes.includes(event.type))
            return false;
        if (filter.sources && !filter.sources.includes(event.source))
            return false;
        if (filter.priority && event.priority && !filter.priority.includes(event.priority))
            return false;
        if (filter.tags && event.tags && !filter.tags.some(tag => event.tags.includes(tag)))
            return false;
        if (filter.timeRange) {
            const eventTime = event.timestamp.getTime();
            if (eventTime < filter.timeRange.start.getTime() || eventTime > filter.timeRange.end.getTime())
                return false;
        }
        if (filter.customFilter && !filter.customFilter(event))
            return false;
        return true;
    }
    async executeHandler(handler, event) {
        const startTime = Date.now();
        try {
            await handler.handler(event);
            const processingTime = Date.now() - startTime;
            this.analytics.averageProcessingTime =
                (this.analytics.averageProcessingTime + processingTime) / 2;
        }
        catch (error) {
            this.errorCount++;
            this.lastError = error;
            console.error(`Event handler error for ${event.type}:`, error);
        }
    }
    static getInstance() {
        if (!SallieEventBus.instance) {
            SallieEventBus.instance = new SallieEventBus();
        }
        return SallieEventBus.instance;
    }
    // Core methods
    emit(eventType, event) {
        var _a;
        if (this.isPaused)
            return false;
        if (this.globalFilter && !this.matchesFilter(event, this.globalFilter))
            return false;
        // Update analytics
        this.analytics.totalEvents++;
        this.analytics.eventsByType[event.type] = (this.analytics.eventsByType[event.type] || 0) + 1;
        this.analytics.eventsBySource[event.source] = (this.analytics.eventsBySource[event.source] || 0) + 1;
        // Store event history if persistence is enabled
        if ((_a = this.persistenceConfig) === null || _a === void 0 ? void 0 : _a.enabled) {
            this.eventHistory.push(event);
            if (this.persistenceConfig.maxEvents && this.eventHistory.length > this.persistenceConfig.maxEvents) {
                this.eventHistory.shift();
            }
        }
        return super.emit(eventType, event);
    }
    on(eventType, listener) {
        return super.on(eventType, listener);
    }
    off(eventType, listener) {
        return super.off(eventType, listener);
    }
    once(eventType, listener) {
        return super.once(eventType, listener);
    }
    removeAllListeners(eventType) {
        return super.removeAllListeners(eventType);
    }
    // Advanced methods
    emitWithOptions(eventType, event, options) {
        const enhancedEvent = Object.assign(Object.assign({}, event), { priority: (options === null || options === void 0 ? void 0 : options.priority) || event.priority || 'normal', ttl: (options === null || options === void 0 ? void 0 : options.ttl) || event.ttl, correlationId: (options === null || options === void 0 ? void 0 : options.correlationId) || event.correlationId, causationId: (options === null || options === void 0 ? void 0 : options.causationId) || event.causationId });
        if (options === null || options === void 0 ? void 0 : options.async) {
            setImmediate(() => this.emit(eventType, enhancedEvent));
        }
        else {
            this.emit(eventType, enhancedEvent);
        }
    }
    subscribe(handler) {
        const handlerId = `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.handlers.set(handlerId, handler);
        // Register with EventEmitter for each event type
        handler.eventTypes.forEach(eventType => {
            this.on(eventType, async (event) => {
                if (handler.filter && !this.matchesFilter(event, handler.filter))
                    return;
                await this.executeHandler(handler, event);
            });
        });
        return handlerId;
    }
    unsubscribe(handlerId) {
        const handler = this.handlers.get(handlerId);
        if (!handler)
            return false;
        handler.eventTypes.forEach(eventType => {
            // Note: This is a simplified implementation
            // In a real system, we'd need to track listeners per handler
        });
        this.handlers.delete(handlerId);
        return true;
    }
    getAnalytics() {
        return Object.assign({}, this.analytics);
    }
    async replayEvents(config) {
        const events = this.eventHistory.filter(event => {
            const inTimeRange = event.timestamp >= config.startTime && event.timestamp <= config.endTime;
            const matchesTypes = !config.eventTypes || config.eventTypes.includes(event.type);
            const matchesFilter = !config.filter || this.matchesFilter(event, config.filter);
            return inTimeRange && matchesTypes && matchesFilter;
        });
        const speed = config.speed || 1.0;
        const delay = 1000 / speed; // Base delay in milliseconds
        for (const event of events) {
            await new Promise(resolve => setTimeout(resolve, delay));
            this.emit(event.type, event);
        }
    }
    pause() {
        this.isPaused = true;
    }
    resume() {
        this.isPaused = false;
    }
    getHealthStatus() {
        var _a;
        return {
            status: this.errorCount > 100 ? 'unhealthy' : this.errorCount > 10 ? 'degraded' : 'healthy',
            uptime: Date.now() - this.startTime.getTime(),
            totalEvents: this.analytics.totalEvents,
            activeHandlers: this.handlers.size,
            errorCount: this.errorCount,
            memoryUsage: ((_a = process.memoryUsage) === null || _a === void 0 ? void 0 : _a.call(process).heapUsed) || 0,
            lastError: this.lastError
        };
    }
    configureDistributed(config) {
        this.distributedConfig = config;
        // Implementation would include cluster communication, load balancing, etc.
        console.log('Distributed configuration applied:', config);
    }
    enablePersistence(config) {
        this.persistenceConfig = config;
        console.log('Persistence enabled:', config);
    }
    createEventStream(filter) {
        // Simplified implementation
        return {
            onData: (callback) => {
                const handler = {
                    id: 'stream_' + Date.now(),
                    eventTypes: ['*'], // Listen to all events
                    handler: callback,
                    filter
                };
                this.subscribe(handler);
            },
            onError: (callback) => {
                // Error handling would be implemented here
            },
            onEnd: (callback) => {
                // Stream end handling
            },
            pause: () => this.pause(),
            resume: () => this.resume(),
            close: () => {
                // Close stream
            }
        };
    }
    getEventHistory(filter, limit) {
        let events = this.eventHistory;
        if (filter) {
            events = events.filter(event => this.matchesFilter(event, filter));
        }
        if (limit) {
            events = events.slice(-limit);
        }
        return events;
    }
    purgeEvents(filter) {
        if (!filter) {
            const count = this.eventHistory.length;
            this.eventHistory = [];
            return count;
        }
        const initialLength = this.eventHistory.length;
        this.eventHistory = this.eventHistory.filter(event => !this.matchesFilter(event, filter));
        return initialLength - this.eventHistory.length;
    }
    setGlobalFilter(filter) {
        this.globalFilter = filter;
    }
    enableMetrics(enabled) {
        this.metricsEnabled = enabled;
    }
    exportEvents(format, filter) {
        let events = this.eventHistory;
        if (filter) {
            events = events.filter(event => this.matchesFilter(event, filter));
        }
        switch (format) {
            case 'json':
                return JSON.stringify(events, null, 2);
            case 'csv':
                const headers = ['id', 'type', 'source', 'timestamp', 'priority'];
                const csvData = events.map(event => [
                    event.id,
                    event.type,
                    event.source,
                    event.timestamp.toISOString(),
                    event.priority || 'normal'
                ]);
                return [headers, ...csvData].map(row => row.join(',')).join('\n');
            case 'xml':
                return `<events>${events.map(event => `<event id="${event.id}" type="${event.type}" source="${event.source}" timestamp="${event.timestamp.toISOString()}">${JSON.stringify(event.payload || {})}</event>`).join('')}</events>`;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    importEvents(data, format) {
        let events = [];
        switch (format) {
            case 'json':
                events = JSON.parse(data);
                break;
            case 'csv':
                // Simplified CSV parsing
                const lines = data.split('\n');
                const headers = lines[0].split(',');
                events = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return {
                        id: values[0],
                        type: values[1],
                        source: values[2],
                        timestamp: new Date(values[3])
                    };
                });
                break;
            case 'xml':
                // Simplified XML parsing
                const eventMatches = data.match(/<event[^>]*>(.*?)<\/event>/g) || [];
                events = eventMatches.map(match => {
                    var _a, _b, _c, _d;
                    const id = ((_a = match.match(/id="([^"]*)"/)) === null || _a === void 0 ? void 0 : _a[1]) || '';
                    const type = ((_b = match.match(/type="([^"]*)"/)) === null || _b === void 0 ? void 0 : _b[1]) || '';
                    const source = ((_c = match.match(/source="([^"]*)"/)) === null || _c === void 0 ? void 0 : _c[1]) || '';
                    const timestamp = ((_d = match.match(/timestamp="([^"]*)"/)) === null || _d === void 0 ? void 0 : _d[1]) || '';
                    return {
                        id,
                        type,
                        source,
                        timestamp: new Date(timestamp)
                    };
                });
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        events.forEach(event => this.emit(event.type, event));
        return events.length;
    }
}
const getEventBus = () => {
    return SallieEventBus.getInstance();
};
exports.getEventBus = getEventBus;
exports.default = exports.getEventBus;
