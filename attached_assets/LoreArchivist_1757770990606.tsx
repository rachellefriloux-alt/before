/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Lore Archivist - Captures decision journals, brand consistency, narrative threat detection, motif tracking, and archives creative evolution timeline.
 * Got it, love.
 */

import { DatabaseAbstractionLayer, DatabaseRecord } from './DatabaseIntegration';
import { EventEmitter } from 'events';

// Data models
export interface DecisionRecord {
  id: string;
  decision: string;
  reason: string;
  timestamp: Date;
}
export interface BrandAlert {
  id: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}
export interface ThreatAlert {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}
export interface MotifEntry {
  id: string;
  motif: string;
  context: string;
  timestamp: Date;
}
export interface EvolutionEntry {
  id: string;
  description: string;
  tags: string[];
  timestamp: Date;
}

/**
 * LoreArchivist orchestrates decision journaling, brand consistency checks,
 * narrative threat detection, motif tracking, and creative evolution archiving.
 */
export class LoreArchivist extends EventEmitter {
  private db: DatabaseAbstractionLayer;
  // Optional enhancements
  private plugins: Map<string, LorePlugin> = new Map();
  private metrics = {
    decisions: 0,
    brandAlerts: 0,
    threatAlerts: 0,
    motifs: 0,
    evolutions: 0
  };
  private cache: Map<string, any> = new Map();
  private backupStore: { type: string; record: any }[] = [];

  constructor(db: DatabaseAbstractionLayer) {
    super();
    this.db = db;
  }
  /** Register a plugin */
  public registerPlugin(plugin: LorePlugin): boolean {
    if (this.plugins.has(plugin.id)) return false;
    this.plugins.set(plugin.id, plugin);
    plugin.initialize?.(this);
    return true;
  }
  /** Unregister a plugin */
  public unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    plugin.cleanup?.();
    this.plugins.delete(pluginId);
    return true;
  }
  /** Record the 'why' behind key decisions */
  public async recordDecision(decision: string, reason: string): Promise<void> {
    this.metrics.decisions++;
    const record: DecisionRecord = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      decision,
      reason,
      timestamp: new Date()
    };
    const dbRecord: DatabaseRecord = { id: record.id, data: record, timestamp: record.timestamp, version: 1 };
    await this.db.create('decisions', dbRecord);
    this.backupStore.push({ type: 'decision', record });
    this.emit('decision:recorded', record);
    this.plugins.forEach(p => p.onDecisionRecorded?.(record));
  }
  /** Check brand consistency in a text and flag deviations */
  public async checkBrandConsistency(text: string): Promise<BrandAlert[]> {
    const alerts: BrandAlert[] = [];
    // Stub: simple check for forbidden terms or style guide violations
    const forbidden = ['[LLM]', 'TODO', 'placeholder'];
    forbidden.forEach(term => {
      if (text.includes(term)) {
        alerts.push({
          id: `brand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          issue: `Prohibited term detected: ${term}`,
          severity: 'medium',
          timestamp: new Date()
        });
      }
    });
    // Persist and emit
    for (const alert of alerts) {
      const dbAlert: DatabaseRecord = { id: alert.id, data: alert, timestamp: alert.timestamp, version: 1 };
      await this.db.create('brandAlerts', dbAlert);
      this.metrics.brandAlerts++;
      this.backupStore.push({ type: 'brand', record: alert });
      this.emit('brand:alert', alert);
      this.plugins.forEach(p => p.onBrandAlert?.(alert));
    }
    return alerts;
  }

  /** Detect narrative threats such as inconsistency or logical gaps */
  public async detectNarrativeThreat(text: string): Promise<ThreatAlert[]> {
    const alerts: ThreatAlert[] = [];
    // Stub: check for common continuity errors (e.g., character disappearance)
    const patterns = [/character [A-Z]\w+ disappears/, /suddenly [A-Z]\w+/];
    patterns.forEach((regex) => {
      if (regex.test(text)) {
        alerts.push({
          id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          description: `Possible continuity issue detected: ${regex.toString()}`,
          severity: 'high',
          timestamp: new Date()
        });
      }
    });
    for (const alert of alerts) {
      const dbAlert: DatabaseRecord = { id: alert.id, data: alert, timestamp: alert.timestamp, version: 1 };
      await this.db.create('threatAlerts', dbAlert);
      this.metrics.threatAlerts++;
      this.backupStore.push({ type: 'threat', record: alert });
      this.emit('threat:alert', alert);
      this.plugins.forEach(p => p.onThreatAlert?.(alert));
    }
    return alerts;
  }

  /** Track recurring motifs and contexts */
  public async trackMotif(motif: string, context: string): Promise<void> {
    const entry: MotifEntry = {
      id: `motif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      motif,
      context,
      timestamp: new Date()
    };
    const dbEntry: DatabaseRecord = { id: entry.id, data: entry, timestamp: entry.timestamp, version: 1 };
    await this.db.create('motifEntries', dbEntry);
    this.metrics.motifs++;
    this.backupStore.push({ type: 'motif', record: entry });
    this.emit('motif:tracked', entry);
    this.plugins.forEach(p => p.onMotifTracked?.(entry));
  }

  /** Archive creative evolution steps with tags and descriptions */
  public async archiveEvolution(description: string, tags: string[]): Promise<void> {
    const entry: EvolutionEntry = {
      id: `evolution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      tags,
      timestamp: new Date()
    };
    const dbEntry: DatabaseRecord = { id: entry.id, data: entry, timestamp: entry.timestamp, version: 1 };
    await this.db.create('evolutionEntries', dbEntry);
    this.metrics.evolutions++;
    this.backupStore.push({ type: 'evolution', record: entry });
    this.emit('evolution:recorded', entry);
    this.plugins.forEach(p => p.onEvolutionArchived?.(entry));
  }

  /** Retrieve the full timeline of evolution entries, sorted chronologically */
  public async getTimeline(): Promise<EvolutionEntry[]> {
    const records = await this.db.query('evolutionEntries');
    const entries = (records.map(r => r.data as EvolutionEntry)).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const key = 'timeline'; if (!this.cache.has(key)) this.cache.set(key, entries);
    return entries;
  }

  /**
   * Retrieve full journey timeline: evolution entries, brand and threat alerts sorted by timestamp
   */
  public async getJourneyTimeline(): Promise<Array<{ type: 'evolution' | 'brand' | 'threat'; item: any }>> {
    // Evolution entries
    const evolutions = await this.getTimeline();

    // Brand alerts
    const brandRecs = await this.db.query('brandAlerts');
    const brandAlerts = brandRecs.map(r => r.data as BrandAlert);

    // Threat alerts
    const threatRecs = await this.db.query('threatAlerts');
    const threatAlerts = threatRecs.map(r => r.data as ThreatAlert);

    // Merge all items
    const timeline: Array<{ type: 'evolution' | 'brand' | 'threat'; item: any }> = [];
    evolutions.forEach(e => timeline.push({ type: 'evolution', item: e }));
    brandAlerts.forEach(a => timeline.push({ type: 'brand', item: a }));
    threatAlerts.forEach(t => timeline.push({ type: 'threat', item: t }));

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.item.timestamp).getTime() - new Date(b.item.timestamp).getTime());

    // Export support
    this.plugins.forEach(p => p.onAnalyticsUpdate?.({ metrics: this.metrics, timeline }));
    return timeline;
  }
  /** Backup all stored records */
  public backupHistory(): string {
    return JSON.stringify(this.backupStore);
  }
  /** Restore records from a backup */
  public async restoreHistory(data: string): Promise<void> {
    try {
      const items = JSON.parse(data) as { type: string; record: any }[];
      for (const item of items) {
        const rec: DatabaseRecord = { id: item.record.id, data: item.record, timestamp: new Date(item.record.timestamp), version: 1 };
        await this.db.create(`${item.type}Entries`, rec);
      }
      this.backupStore = items;
    } catch (err) {
      console.error('LoreArchivist restore failed:', err);
    }
  }
  /** Search records by type and filter */
  public async search<T>(type: 'decision'|'brand'|'threat'|'motif'|'evolution', filter: (rec: any) => boolean): Promise<T[]> {
    const raw = this.backupStore.filter(i => i.type === type).map(i => i.record);
    return (raw as T[]).filter(filter);
  }
  /** Export timeline or history as JSON or CSV */
  /** Export timeline or history as JSON or CSV */
  public async export(format: 'json'|'csv', type: 'decision'|'brand'|'threat'|'motif'|'evolution'|'journey'): Promise<string> {
    let data: any[];
    if (type === 'journey') {
      data = await this.getJourneyTimeline();
    } else {
      data = this.backupStore.filter(i => i.type === type).map(i => i.record);
    }
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    // CSV simple
    const keys = Object.keys(data[0] || {});
    const rows = data.map(d => keys.map(k => JSON.stringify((d as any)[k] ?? '')).join(','));
    return [keys.join(','), ...rows].join('\n');
  }
}

/** Plugin hooks for LoreArchivist */
export interface LorePlugin {
  id: string;
  initialize?: (archivist: LoreArchivist) => void;
  cleanup?: () => void;
  onDecisionRecorded?: (record: DecisionRecord) => void;
  onBrandAlert?: (alert: BrandAlert) => void;
  onThreatAlert?: (alert: ThreatAlert) => void;
  onMotifTracked?: (entry: MotifEntry) => void;
  onEvolutionArchived?: (entry: EvolutionEntry) => void;
  onAnalyticsUpdate?: (data: { metrics: any; timeline: any }) => void;
}
