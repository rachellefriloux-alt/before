/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Security & Privacy System                                         │
 * │                                                                              │
 * │   Comprehensive security measures and privacy protection                    │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Security & Privacy System for Sallie
// Implements comprehensive security measures and privacy protection

import { EventEmitter } from 'events';

export interface EncryptionKey {
  id: string;
  algorithm: 'AES-256-GCM' | 'RSA-OAEP' | 'ChaCha20-Poly1305';
  key: CryptoKey;
  iv?: Uint8Array;
  created: Date;
  expires?: Date;
  usage: 'encrypt' | 'decrypt' | 'sign' | 'verify';
}

export interface PrivacySettings {
  userId: string;
  dataCollection: {
    analytics: boolean;
    personalization: boolean;
    location: boolean;
    voice: boolean;
    biometrics: boolean;
  };
  dataRetention: {
    conversations: number; // days
    analytics: number; // days
    backups: number; // days
  };
  sharing: {
    allowPublicSharing: boolean;
    allowAnonymousData: boolean;
    allowThirdPartyAccess: boolean;
    approvedPartners: string[];
  };
  notifications: {
    privacyUpdates: boolean;
    dataUsage: boolean;
    securityAlerts: boolean;
  };
  lastUpdated: Date;
}

export interface BiometricData {
  userId: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris';
  template: ArrayBuffer;
  confidence: number;
  enrolled: Date;
  lastUsed: Date;
  deviceId: string;
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  event: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  resolved: boolean;
}

export interface SecureStorageEntry {
  id: string;
  key: string;
  value: string;
  encrypted: boolean;
  created: Date;
  lastAccessed: Date;
  accessCount: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface AccessToken {
  id: string;
  userId: string;
  token: string;
  type: 'access' | 'refresh' | 'api';
  scope: string[];
  expires: Date;
  created: Date;
  lastUsed?: Date;
  deviceId?: string;
  ipAddress?: string;
}

/**
 * Encryption Engine
 */
export class EncryptionEngine extends EventEmitter {
  private keys: Map<string, EncryptionKey> = new Map();
  private keyStore: Map<string, CryptoKey> = new Map();

  constructor() {
    super();
  }

  /**
   * Generate new encryption key
   */
  public async generateKey(
    algorithm: EncryptionKey['algorithm'] = 'AES-256-GCM',
    usage: EncryptionKey['usage'][] = ['encrypt', 'decrypt']
  ): Promise<EncryptionKey> {
    const keyId = this.generateKeyId();

    let key: CryptoKey;
    let iv: Uint8Array | undefined;

    switch (algorithm) {
      case 'AES-256-GCM':
        key = await crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256
          },
          true,
          usage
        );
        iv = crypto.getRandomValues(new Uint8Array(12));
        break;

      case 'RSA-OAEP':
        const rsaKeyPair = await crypto.subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
          },
          true,
          usage
        );
        key = (rsaKeyPair as any).privateKey || (rsaKeyPair as any).publicKey;
        break;

      case 'ChaCha20-Poly1305':
        // ChaCha20-Poly1305 implementation would require additional library
        throw new Error('ChaCha20-Poly1305 not yet implemented');
    }

    const encryptionKey: EncryptionKey = {
      id: keyId,
      algorithm,
      key,
      iv,
      created: new Date(),
      usage: usage[0]
    };

    this.keys.set(keyId, encryptionKey);
    this.keyStore.set(keyId, key);

    this.emit('key-generated', encryptionKey);
    return encryptionKey;
  }

  /**
   * Encrypt data
   */
  public async encrypt(
    data: string | ArrayBuffer,
    keyId: string
  ): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const key = this.keyStore.get(keyId);
    if (!key) {
      throw new Error(`Key ${keyId} not found`);
    }

    const encryptionKey = this.keys.get(keyId);
    if (!encryptionKey) {
      throw new Error(`Encryption key ${keyId} not found`);
    }

    let dataBuffer: ArrayBuffer;
    if (typeof data === 'string') {
      dataBuffer = new TextEncoder().encode(data).buffer;
    } else {
      dataBuffer = data;
    }

    let encrypted: ArrayBuffer;
    let iv: Uint8Array;

    switch (encryptionKey.algorithm) {
      case 'AES-256-GCM':
        iv = encryptionKey.iv || crypto.getRandomValues(new Uint8Array(12));
        encrypted = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: iv as BufferSource
          },
          key,
          dataBuffer
        );
        break;

      case 'RSA-OAEP':
        encrypted = await crypto.subtle.encrypt(
          {
            name: 'RSA-OAEP'
          },
          key,
          dataBuffer
        );
        iv = new Uint8Array(0); // RSA doesn't use IV
        break;

      default:
        throw new Error(`Unsupported algorithm: ${encryptionKey.algorithm}`);
    }

    this.emit('data-encrypted', { keyId, size: encrypted.byteLength });
    return { encrypted, iv };
  }

  /**
   * Decrypt data
   */
  public async decrypt(
    encrypted: ArrayBuffer,
    keyId: string,
    iv?: Uint8Array
  ): Promise<string | ArrayBuffer> {
    const key = this.keyStore.get(keyId);
    if (!key) {
      throw new Error(`Key ${keyId} not found`);
    }

    const encryptionKey = this.keys.get(keyId);
    if (!encryptionKey) {
      throw new Error(`Encryption key ${keyId} not found`);
    }

    let decrypted: ArrayBuffer;

    switch (encryptionKey.algorithm) {
      case 'AES-256-GCM':
        const decryptionIv = iv || encryptionKey.iv;
        if (!decryptionIv) {
          throw new Error('IV required for AES-GCM decryption');
        }
        decrypted = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: decryptionIv as BufferSource
          },
          key,
          encrypted
        );
        break;

      case 'RSA-OAEP':
        decrypted = await crypto.subtle.decrypt(
          {
            name: 'RSA-OAEP'
          },
          key,
          encrypted
        );
        break;

      default:
        throw new Error(`Unsupported algorithm: ${encryptionKey.algorithm}`);
    }

    const result = new TextDecoder().decode(decrypted);
    this.emit('data-decrypted', { keyId, size: decrypted.byteLength });
    return result;
  }

  /**
   * Export key for backup
   */
  public async exportKey(keyId: string): Promise<JsonWebKey> {
    const key = this.keyStore.get(keyId);
    if (!key) {
      throw new Error(`Key ${keyId} not found`);
    }

    return await crypto.subtle.exportKey('jwk', key);
  }

  /**
   * Import key from backup
   */
  public async importKey(
    keyData: JsonWebKey,
    algorithm: EncryptionKey['algorithm'],
    usage: EncryptionKey['usage'][] = ['encrypt', 'decrypt']
  ): Promise<EncryptionKey> {
    const keyId = this.generateKeyId();

    const key = await crypto.subtle.importKey(
      'jwk',
      keyData,
      this.getAlgorithmParams(algorithm),
      true,
      usage
    );

    const encryptionKey: EncryptionKey = {
      id: keyId,
      algorithm,
      key,
      created: new Date(),
      usage: usage[0]
    };

    this.keys.set(keyId, encryptionKey);
    this.keyStore.set(keyId, key);

    return encryptionKey;
  }

  /**
   * Rotate encryption key
   */
  public async rotateKey(oldKeyId: string): Promise<EncryptionKey> {
    const oldKey = this.keys.get(oldKeyId);
    if (!oldKey) {
      throw new Error(`Key ${oldKeyId} not found`);
    }

    // Generate new key
    const newKey = await this.generateKey(oldKey.algorithm, [oldKey.usage]);

    // Mark old key as expired
    oldKey.expires = new Date();

    this.emit('key-rotated', { oldKeyId, newKeyId: newKey.id });
    return newKey;
  }

  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAlgorithmParams(algorithm: EncryptionKey['algorithm']): any {
    switch (algorithm) {
      case 'AES-256-GCM':
        return { name: 'AES-GCM', length: 256 };
      case 'RSA-OAEP':
        return {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        };
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }
}

/**
 * Privacy Manager
 */
export class PrivacyManager extends EventEmitter {
  private settings: Map<string, PrivacySettings> = new Map();
  private dataUsage: Map<string, any[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Initialize privacy settings for user
   */
  public initializePrivacySettings(userId: string): PrivacySettings {
    const defaultSettings: PrivacySettings = {
      userId,
      dataCollection: {
        analytics: true,
        personalization: true,
        location: false,
        voice: false,
        biometrics: false
      },
      dataRetention: {
        conversations: 365, // 1 year
        analytics: 90, // 3 months
        backups: 730 // 2 years
      },
      sharing: {
        allowPublicSharing: false,
        allowAnonymousData: true,
        allowThirdPartyAccess: false,
        approvedPartners: []
      },
      notifications: {
        privacyUpdates: true,
        dataUsage: true,
        securityAlerts: true
      },
      lastUpdated: new Date()
    };

    this.settings.set(userId, defaultSettings);
    this.emit('privacy-initialized', userId);
    return defaultSettings;
  }

  /**
   * Update privacy settings
   */
  public updatePrivacySettings(userId: string, updates: Partial<PrivacySettings>): PrivacySettings {
    const currentSettings = this.settings.get(userId);
    if (!currentSettings) {
      throw new Error(`Privacy settings not found for user ${userId}`);
    }

    const updatedSettings = {
      ...currentSettings,
      ...updates,
      lastUpdated: new Date()
    };

    this.settings.set(userId, updatedSettings);
    this.emit('privacy-updated', { userId, updates });
    return updatedSettings;
  }

  /**
   * Get privacy settings
   */
  public getPrivacySettings(userId: string): PrivacySettings | null {
    return this.settings.get(userId) || null;
  }

  /**
   * Check if data collection is allowed
   */
  public isDataCollectionAllowed(userId: string, dataType: keyof PrivacySettings['dataCollection']): boolean {
    const settings = this.settings.get(userId);
    return settings?.dataCollection[dataType] || false;
  }

  /**
   * Record data usage
   */
  public recordDataUsage(
    userId: string,
    dataType: string,
    action: string,
    details?: Record<string, any>
  ): void {
    const usage = {
      timestamp: new Date(),
      dataType,
      action,
      details: details || {}
    };

    if (!this.dataUsage.has(userId)) {
      this.dataUsage.set(userId, []);
    }

    this.dataUsage.get(userId)!.push(usage);

    // Check privacy settings
    const settings = this.settings.get(userId);
    if (settings?.notifications.dataUsage) {
      this.emit('data-usage-recorded', { userId, usage });
    }
  }

  /**
   * Get data usage history
   */
  public getDataUsageHistory(userId: string, limit: number = 100): any[] {
    const usage = this.dataUsage.get(userId) || [];
    return usage.slice(-limit);
  }

  /**
   * Export user data
   */
  public exportUserData(userId: string): any {
    const settings = this.settings.get(userId);
    const usage = this.dataUsage.get(userId) || [];

    return {
      userId,
      privacySettings: settings,
      dataUsage: usage,
      exportDate: new Date()
    };
  }

  /**
   * Delete user data
   */
  public deleteUserData(userId: string): void {
    this.settings.delete(userId);
    this.dataUsage.delete(userId);
    this.emit('data-deleted', userId);
  }

  /**
   * Check data retention compliance
   */
  public checkDataRetentionCompliance(userId: string): string[] {
    const settings = this.settings.get(userId);
    if (!settings) return [];

    const issues: string[] = [];
    const usage = this.dataUsage.get(userId) || [];
    const now = new Date();

    // Check conversation retention
    const oldConversations = usage.filter(u =>
      u.dataType === 'conversation' &&
      (now.getTime() - u.timestamp.getTime()) > (settings.dataRetention.conversations * 24 * 60 * 60 * 1000)
    );

    if (oldConversations.length > 0) {
      issues.push(`${oldConversations.length} conversations exceed retention period`);
    }

    // Check analytics retention
    const oldAnalytics = usage.filter(u =>
      u.dataType === 'analytics' &&
      (now.getTime() - u.timestamp.getTime()) > (settings.dataRetention.analytics * 24 * 60 * 60 * 1000)
    );

    if (oldAnalytics.length > 0) {
      issues.push(`${oldAnalytics.length} analytics entries exceed retention period`);
    }

    return issues;
  }

  /**
   * Anonymize data for analytics
   */
  public anonymizeData(data: any): any {
    const anonymized = { ...data };

    // Remove personally identifiable information
    delete anonymized.userId;
    delete anonymized.email;
    delete anonymized.name;
    delete anonymized.location;

    // Hash sensitive data
    if (anonymized.ipAddress) {
      anonymized.ipAddress = this.hashData(anonymized.ipAddress);
    }

    return anonymized;
  }

  private hashData(data: string): string {
    // Simple hash for anonymization (in production, use proper hashing)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

/**
 * Biometric Authentication Manager
 */
export class BiometricAuthManager extends EventEmitter {
  private biometricData: Map<string, BiometricData[]> = new Map();
  private isSupported: boolean = false;

  constructor() {
    super();
    this.checkBiometricSupport();
  }

  /**
   * Check if biometric authentication is supported
   */
  private checkBiometricSupport(): void {
    this.isSupported = !!(window as any).PublicKeyCredential &&
                      !!(navigator.credentials);
  }

  /**
   * Enroll biometric data
   */
  public async enrollBiometric(
    userId: string,
    type: BiometricData['type']
  ): Promise<BiometricData> {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      // Create credential for biometric enrollment
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'Sallie AI', id: window.location.hostname },
          user: {
            id: new Uint8Array(16),
            name: userId,
            displayName: userId
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000
        }
      }) as PublicKeyCredential;

      const biometricData: BiometricData = {
        userId,
        type,
        template: credential.rawId,
        confidence: 0.9, // Initial confidence
        enrolled: new Date(),
        lastUsed: new Date(),
        deviceId: this.getDeviceId()
      };

      if (!this.biometricData.has(userId)) {
        this.biometricData.set(userId, []);
      }

      this.biometricData.get(userId)!.push(biometricData);
      this.emit('biometric-enrolled', biometricData);

      return biometricData;
    } catch (error) {
      throw new Error(`Biometric enrollment failed: ${error}`);
    }
  }

  /**
   * Authenticate using biometrics
   */
  public async authenticateBiometric(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    const userBiometrics = this.biometricData.get(userId);
    if (!userBiometrics || userBiometrics.length === 0) {
      throw new Error('No biometric data enrolled for user');
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: userBiometrics.map(bio => ({
            id: bio.template,
            type: 'public-key'
          })),
          userVerification: 'required',
          timeout: 60000
        }
      }) as PublicKeyCredential;

      // Verify credential
      const isValid = userBiometrics.some(bio =>
        this.arrayBuffersEqual(bio.template, credential.rawId)
      );

      if (isValid) {
        // Update last used timestamp
        const bio = userBiometrics.find(b =>
          this.arrayBuffersEqual(b.template, credential.rawId)
        );
        if (bio) {
          bio.lastUsed = new Date();
        }

        this.emit('biometric-authenticated', userId);
        return true;
      }

      return false;
    } catch (error) {
      this.emit('biometric-auth-failed', { userId, error });
      return false;
    }
  }

  /**
   * Get enrolled biometrics for user
   */
  public getEnrolledBiometrics(userId: string): BiometricData[] {
    return this.biometricData.get(userId) || [];
  }

  /**
   * Remove biometric data
   */
  public removeBiometric(userId: string, biometricId: string): void {
    const userBiometrics = this.biometricData.get(userId);
    if (userBiometrics) {
      const index = userBiometrics.findIndex(b => b.type === biometricId);
      if (index !== -1) {
        userBiometrics.splice(index, 1);
        this.emit('biometric-removed', { userId, biometricId });
      }
    }
  }

  /**
   * Check biometric support
   */
  public isBiometricSupported(): boolean {
    return this.isSupported;
  }

  private getDeviceId(): string {
    // Generate a device-specific ID (simplified)
    return `device_${navigator.platform}_${navigator.language}`;
  }

  private arrayBuffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
    if (a.byteLength !== b.byteLength) return false;
    const aView = new Uint8Array(a);
    const bView = new Uint8Array(b);
    for (let i = 0; i < aView.length; i++) {
      if (aView[i] !== bView[i]) return false;
    }
    return true;
  }
}

/**
 * Secure Storage Manager
 */
export class SecureStorageManager extends EventEmitter {
  private storage: Map<string, SecureStorageEntry> = new Map();
  private encryptionEngine: EncryptionEngine;

  constructor(encryptionEngine: EncryptionEngine) {
    super();
    this.encryptionEngine = encryptionEngine;
  }

  /**
   * Store data securely
   */
  public async store(
    key: string,
    value: string,
    encrypt: boolean = true,
    tags: string[] = []
  ): Promise<SecureStorageEntry> {
    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let storedValue = value;
    let encrypted = false;

    if (encrypt) {
      // Generate key for this entry
      const encryptionKey = await this.encryptionEngine.generateKey();
      const encryptedData = await this.encryptionEngine.encrypt(value, encryptionKey.id);
      storedValue = JSON.stringify({
        encrypted: true,
        data: Array.from(new Uint8Array(encryptedData.encrypted)),
        iv: Array.from(encryptedData.iv),
        keyId: encryptionKey.id
      });
      encrypted = true;
    }

    const entry: SecureStorageEntry = {
      id: entryId,
      key,
      value: storedValue,
      encrypted,
      created: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      tags,
      metadata: {}
    };

    this.storage.set(key, entry);
    this.emit('data-stored', { key, encrypted });

    return entry;
  }

  /**
   * Retrieve data securely
   */
  public async retrieve(key: string): Promise<string | null> {
    const entry = this.storage.get(key);
    if (!entry) {
      return null;
    }

    entry.lastAccessed = new Date();
    entry.accessCount++;

    let value = entry.value;

    if (entry.encrypted) {
      const encryptedData = JSON.parse(value);
      const encrypted = new Uint8Array(encryptedData.data);
      const iv = new Uint8Array(encryptedData.iv);

      value = await this.encryptionEngine.decrypt(encrypted.buffer, encryptedData.keyId, iv) as string;
    }

    this.emit('data-retrieved', { key, encrypted: entry.encrypted });
    return value;
  }

  /**
   * Delete data
   */
  public delete(key: string): boolean {
    const deleted = this.storage.delete(key);
    if (deleted) {
      this.emit('data-deleted', key);
    }
    return deleted;
  }

  /**
   * List stored keys
   */
  public listKeys(tags?: string[]): string[] {
    let entries = Array.from(this.storage.values());

    if (tags && tags.length > 0) {
      entries = entries.filter(entry =>
        tags.some(tag => entry.tags.includes(tag))
      );
    }

    return entries.map(entry => entry.key);
  }

  /**
   * Get storage statistics
   */
  public getStorageStats(): {
    totalEntries: number;
    encryptedEntries: number;
    totalSize: number;
    lastAccessed: Date | null;
  } {
    const entries = Array.from(this.storage.values());

    return {
      totalEntries: entries.length,
      encryptedEntries: entries.filter(e => e.encrypted).length,
      totalSize: entries.reduce((sum, e) => sum + e.value.length, 0),
      lastAccessed: entries.length > 0 ?
        new Date(Math.max(...entries.map(e => e.lastAccessed.getTime()))) :
        null
    };
  }

  /**
   * Clear expired data
   */
  public clearExpired(maxAge: number): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.storage) {
      if ((now - entry.created.getTime()) > maxAge) {
        this.storage.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.emit('expired-data-cleared', cleared);
    }

    return cleared;
  }
}

/**
 * Security Audit Logger
 */
export class SecurityAuditLogger extends EventEmitter {
  private audits: SecurityAudit[] = [];
  private maxAudits: number = 10000;

  /**
   * Log security event
   */
  public logAudit(
    event: string,
    severity: SecurityAudit['severity'],
    details: Record<string, any> = {},
    userId?: string
  ): SecurityAudit {
    const audit: SecurityAudit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      event,
      userId,
      severity,
      details,
      resolved: false
    };

    // Add client information
    audit.ipAddress = this.getClientIP();
    audit.userAgent = navigator.userAgent;

    this.audits.push(audit);

    // Maintain max audits limit
    if (this.audits.length > this.maxAudits) {
      this.audits.shift();
    }

    this.emit('audit-logged', audit);

    // Alert on high severity events
    if (severity === 'high' || severity === 'critical') {
      this.emit('security-alert', audit);
    }

    return audit;
  }

  /**
   * Get audit logs
   */
  public getAuditLogs(
    userId?: string,
    severity?: SecurityAudit['severity'],
    limit: number = 100
  ): SecurityAudit[] {
    let logs = this.audits;

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    if (severity) {
      logs = logs.filter(log => log.severity === severity);
    }

    return logs.slice(-limit);
  }

  /**
   * Mark audit as resolved
   */
  public resolveAudit(auditId: string): boolean {
    const audit = this.audits.find(a => a.id === auditId);
    if (audit) {
      audit.resolved = true;
      this.emit('audit-resolved', audit);
      return true;
    }
    return false;
  }

  /**
   * Get security statistics
   */
  public getSecurityStats(): {
    totalAudits: number;
    unresolvedAudits: number;
    severityBreakdown: Record<string, number>;
    recentAlerts: SecurityAudit[];
  } {
    const unresolved = this.audits.filter(a => !a.resolved);
    const severityBreakdown: Record<string, number> = {};

    for (const audit of this.audits) {
      severityBreakdown[audit.severity] = (severityBreakdown[audit.severity] || 0) + 1;
    }

    const recentAlerts = this.audits
      .filter(a => (a.severity === 'high' || a.severity === 'critical') && !a.resolved)
      .slice(-10);

    return {
      totalAudits: this.audits.length,
      unresolvedAudits: unresolved.length,
      severityBreakdown,
      recentAlerts
    };
  }

  private getClientIP(): string {
    // In a real implementation, this would be obtained from the server
    return 'client_ip_not_available';
  }
}

// Export singleton instances
export const encryptionEngine = new EncryptionEngine();
export const privacyManager = new PrivacyManager();
export const biometricAuthManager = new BiometricAuthManager();
export const securityAuditLogger = new SecurityAuditLogger();

// Create secure storage with encryption engine
export const secureStorageManager = new SecureStorageManager(encryptionEngine);
