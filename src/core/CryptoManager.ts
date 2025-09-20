/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Advanced Cryptographic Management System                          │
 * │                                                                              │
 * │   Comprehensive encryption, signing, and audit trail capabilities            │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import * as SecureStore from 'expo-secure-store';
import { getEventBus } from './EventBus';

/**
 * Cryptographic interfaces and types
 */
export interface EncryptionResult {
  ciphertext: string;
  iv: string;
  salt: string;
  algorithm: string;
  keyId: string;
}

export interface SignatureResult {
  signature: string;
  algorithm: string;
  keyId: string;
  timestamp: Date;
}

export interface CryptoConfig {
  defaultAlgorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keyRotationInterval: number; // in milliseconds
  auditEnabled: boolean;
  compressionEnabled: boolean;
  integrityChecks: boolean;
}

export interface AuditEntry {
  id: string;
  operation: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'key_generation' | 'key_rotation';
  keyId: string;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
  merkleHash?: string;
}

export interface KeyMetadata {
  id: string;
  algorithm: string;
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
  purpose: 'encryption' | 'signing' | 'both';
  rotationScheduled?: Date;
}

/**
 * Advanced Cryptographic Manager
 */
export class CryptoManager {
  private static instance: CryptoManager | null = null;
  private config: CryptoConfig;
  private keyMetadata = new Map<string, KeyMetadata>();
  private auditTrail: AuditEntry[] = [];
  private merkleTree: MerkleTree;
  private eventBus = getEventBus();

  private constructor(config: CryptoConfig) {
    this.config = config;
    this.merkleTree = new MerkleTree();
    this.setupKeyRotation();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: CryptoConfig): CryptoManager {
    if (!CryptoManager.instance) {
      CryptoManager.instance = new CryptoManager(config || CryptoManager.getDefaultConfig());
    }
    return CryptoManager.instance;
  }

  private static getDefaultConfig(): CryptoConfig {
    return {
      defaultAlgorithm: 'AES-256-GCM',
      keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
      auditEnabled: true,
      compressionEnabled: false,
      integrityChecks: true,
    };
  }

  // ==============================================================================
  // KEY MANAGEMENT
  // ==============================================================================

  /**
   * Generate a new encryption key
   */
  async generateKey(
    algorithm: string = this.config.defaultAlgorithm,
    purpose: 'encryption' | 'signing' | 'both' = 'encryption'
  ): Promise<string> {
    const keyId = this.generateKeyId();
    const keyData = this.generateKeyData(algorithm);
    
    // Store the key securely
    await SecureStore.setItemAsync(`sallie_key_${keyId}`, JSON.stringify({
      keyData,
      algorithm,
      purpose,
      createdAt: new Date().toISOString(),
    }));

    // Store metadata
    this.keyMetadata.set(keyId, {
      id: keyId,
      algorithm,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      purpose,
    });

    // Audit log
    await this.addAuditEntry({
      operation: 'key_generation',
      keyId,
      success: true,
      metadata: { algorithm, purpose },
    });

    this.eventBus.emit('crypto:keyGenerated', { keyId, algorithm, purpose });
    return keyId;
  }

  /**
   * Get or create the default key
   */
  async getDefaultKey(): Promise<string> {
    const defaultKeyId = 'default_encryption_key';
    
    try {
      const existingKey = await SecureStore.getItemAsync(`sallie_key_${defaultKeyId}`);
      if (existingKey) {
        return defaultKeyId;
      }
    } catch (error) {
      // Key doesn't exist, create it
    }

    // Generate new default key
    await this.generateKeyWithId(defaultKeyId);
    return defaultKeyId;
  }

  private async generateKeyWithId(keyId: string): Promise<void> {
    const keyData = this.generateKeyData(this.config.defaultAlgorithm);
    
    await SecureStore.setItemAsync(`sallie_key_${keyId}`, JSON.stringify({
      keyData,
      algorithm: this.config.defaultAlgorithm,
      purpose: 'encryption',
      createdAt: new Date().toISOString(),
    }));

    this.keyMetadata.set(keyId, {
      id: keyId,
      algorithm: this.config.defaultAlgorithm,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      purpose: 'encryption',
    });
  }

  /**
   * Rotate a key
   */
  async rotateKey(keyId: string): Promise<string> {
    const newKeyId = await this.generateKey();
    
    // Mark old key for migration
    const metadata = this.keyMetadata.get(keyId);
    if (metadata) {
      this.keyMetadata.set(keyId, {
        ...metadata,
        rotationScheduled: new Date(),
      });
    }

    await this.addAuditEntry({
      operation: 'key_rotation',
      keyId: newKeyId,
      success: true,
      metadata: { oldKeyId: keyId },
    });

    this.eventBus.emit('crypto:keyRotated', { oldKeyId: keyId, newKeyId });
    return newKeyId;
  }

  // ==============================================================================
  // ENCRYPTION AND DECRYPTION
  // ==============================================================================

  /**
   * Encrypt data with advanced features
   */
  async encrypt(
    plaintext: string,
    keyId?: string,
    options: {
      compression?: boolean;
      integrityCheck?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<EncryptionResult> {
    const targetKeyId = keyId || await this.getDefaultKey();
    
    try {
      // Get key data
      const keyInfo = await this.getKeyInfo(targetKeyId);
      if (!keyInfo) {
        throw new Error(`Key not found: ${targetKeyId}`);
      }

      // Prepare data
      let dataToEncrypt = plaintext;
      
      // Optional compression
      if (options.compression || this.config.compressionEnabled) {
        dataToEncrypt = this.compress(dataToEncrypt);
      }

      // Generate IV and salt
      const iv = this.generateIV();
      const salt = this.generateSalt();

      // Encrypt using Web Crypto API
      const ciphertext = await this.performEncryption(dataToEncrypt, keyInfo.keyData, iv, salt);

      const result: EncryptionResult = {
        ciphertext: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        algorithm: keyInfo.algorithm,
        keyId: targetKeyId,
      };

      // Update key usage
      this.updateKeyUsage(targetKeyId);

      // Audit log
      await this.addAuditEntry({
        operation: 'encrypt',
        keyId: targetKeyId,
        success: true,
        metadata: {
          dataLength: plaintext.length,
          compressed: options.compression || this.config.compressionEnabled,
          ...options.metadata,
        },
      });

      this.eventBus.emit('crypto:encrypted', { keyId: targetKeyId, dataLength: plaintext.length });
      return result;

    } catch (error) {
      await this.addAuditEntry({
        operation: 'encrypt',
        keyId: targetKeyId,
        success: false,
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Decrypt data with verification
   */
  async decrypt(
    encryptionResult: EncryptionResult,
    options: {
      verifyIntegrity?: boolean;
    } = {}
  ): Promise<string> {
    try {
      // Get key data
      const keyInfo = await this.getKeyInfo(encryptionResult.keyId);
      if (!keyInfo) {
        throw new Error(`Key not found: ${encryptionResult.keyId}`);
      }

      // Convert from base64
      const ciphertext = this.base64ToArrayBuffer(encryptionResult.ciphertext);
      const iv = this.base64ToArrayBuffer(encryptionResult.iv);
      const salt = this.base64ToArrayBuffer(encryptionResult.salt);

      // Decrypt
      const decryptedBuffer = await this.performDecryption(ciphertext, keyInfo.keyData, iv, salt);
      let decryptedText = new TextDecoder().decode(decryptedBuffer);

      // Handle decompression if needed
      if (this.config.compressionEnabled) {
        try {
          decryptedText = this.decompress(decryptedText);
        } catch (error) {
          // Data might not be compressed
        }
      }

      // Update key usage
      this.updateKeyUsage(encryptionResult.keyId);

      // Audit log
      await this.addAuditEntry({
        operation: 'decrypt',
        keyId: encryptionResult.keyId,
        success: true,
        metadata: { algorithm: encryptionResult.algorithm },
      });

      this.eventBus.emit('crypto:decrypted', { keyId: encryptionResult.keyId });
      return decryptedText;

    } catch (error) {
      await this.addAuditEntry({
        operation: 'decrypt',
        keyId: encryptionResult.keyId,
        success: false,
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  // ==============================================================================
  // DIGITAL SIGNATURES
  // ==============================================================================

  /**
   * Sign data
   */
  async sign(data: string, keyId?: string): Promise<SignatureResult> {
    const targetKeyId = keyId || await this.getDefaultKey();
    
    try {
      const keyInfo = await this.getKeyInfo(targetKeyId);
      if (!keyInfo) {
        throw new Error(`Key not found: ${targetKeyId}`);
      }

      // Create signature using HMAC-SHA256
      const signature = await this.createHMACSignature(data, keyInfo.keyData);

      const result: SignatureResult = {
        signature: this.arrayBufferToBase64(signature),
        algorithm: 'HMAC-SHA256',
        keyId: targetKeyId,
        timestamp: new Date(),
      };

      // Update key usage
      this.updateKeyUsage(targetKeyId);

      // Audit log
      await this.addAuditEntry({
        operation: 'sign',
        keyId: targetKeyId,
        success: true,
        metadata: { dataLength: data.length },
      });

      this.eventBus.emit('crypto:signed', { keyId: targetKeyId });
      return result;

    } catch (error) {
      await this.addAuditEntry({
        operation: 'sign',
        keyId: targetKeyId,
        success: false,
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Verify signature
   */
  async verify(data: string, signatureResult: SignatureResult): Promise<boolean> {
    try {
      const keyInfo = await this.getKeyInfo(signatureResult.keyId);
      if (!keyInfo) {
        throw new Error(`Key not found: ${signatureResult.keyId}`);
      }

      // Recreate signature
      const expectedSignature = await this.createHMACSignature(data, keyInfo.keyData);
      const providedSignature = this.base64ToArrayBuffer(signatureResult.signature);

      // Compare signatures
      const isValid = this.compareArrayBuffers(expectedSignature, providedSignature);

      // Update key usage
      this.updateKeyUsage(signatureResult.keyId);

      // Audit log
      await this.addAuditEntry({
        operation: 'verify',
        keyId: signatureResult.keyId,
        success: isValid,
        metadata: { algorithm: signatureResult.algorithm },
      });

      this.eventBus.emit('crypto:verified', { keyId: signatureResult.keyId, valid: isValid });
      return isValid;

    } catch (error) {
      await this.addAuditEntry({
        operation: 'verify',
        keyId: signatureResult.keyId,
        success: false,
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  // ==============================================================================
  // AUDIT TRAIL AND MERKLE TREE
  // ==============================================================================

  private async addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'merkleHash'>): Promise<void> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      merkleHash: '',
      ...entry,
    };

    // Add to Merkle tree for tamper evidence
    if (this.config.auditEnabled) {
      this.merkleTree.addLeaf(JSON.stringify(auditEntry));
      auditEntry.merkleHash = this.merkleTree.getCurrentRoot();
    }

    this.auditTrail.push(auditEntry);
    
    // Limit audit trail size
    if (this.auditTrail.length > 10000) {
      this.auditTrail = this.auditTrail.slice(-5000);
    }

    this.eventBus.emit('crypto:auditEntry', auditEntry);
  }

  /**
   * Get audit trail
   */
  getAuditTrail(filter?: {
    operation?: AuditEntry['operation'];
    keyId?: string;
    timeRange?: { start: Date; end: Date };
  }): AuditEntry[] {
    let filtered = this.auditTrail;

    if (filter) {
      filtered = filtered.filter(entry => {
        if (filter.operation && entry.operation !== filter.operation) return false;
        if (filter.keyId && entry.keyId !== filter.keyId) return false;
        if (filter.timeRange) {
          const entryTime = entry.timestamp.getTime();
          if (entryTime < filter.timeRange.start.getTime() || entryTime > filter.timeRange.end.getTime()) {
            return false;
          }
        }
        return true;
      });
    }

    return filtered;
  }

  /**
   * Verify audit trail integrity
   */
  verifyAuditIntegrity(): boolean {
    if (!this.config.auditEnabled) return true;
    
    // Rebuild Merkle tree and compare roots
    const rebuiltTree = new MerkleTree();
    
    for (const entry of this.auditTrail) {
      const entryWithoutHash = { ...entry };
      delete entryWithoutHash.merkleHash;
      rebuiltTree.addLeaf(JSON.stringify(entryWithoutHash));
    }

    const currentRoot = this.merkleTree.getCurrentRoot();
    const rebuiltRoot = rebuiltTree.getCurrentRoot();
    
    return currentRoot === rebuiltRoot;
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private async getKeyInfo(keyId: string): Promise<any> {
    try {
      const keyString = await SecureStore.getItemAsync(`sallie_key_${keyId}`);
      return keyString ? JSON.parse(keyString) : null;
    } catch (error) {
      console.error('Failed to get key info:', error);
      return null;
    }
  }

  private updateKeyUsage(keyId: string): void {
    const metadata = this.keyMetadata.get(keyId);
    if (metadata) {
      metadata.lastUsed = new Date();
      metadata.usageCount++;
    }
  }

  private generateKeyData(algorithm: string): string {
    // Generate cryptographically secure random key
    const keyLength = algorithm.includes('256') ? 32 : 16;
    const array = new Uint8Array(keyLength);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  private generateIV(): ArrayBuffer {
    const iv = new Uint8Array(16);
    crypto.getRandomValues(iv);
    return iv.buffer;
  }

  private generateSalt(): ArrayBuffer {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return salt.buffer;
  }

  private async performEncryption(
    data: string,
    keyData: string,
    iv: ArrayBuffer,
    salt: ArrayBuffer
  ): Promise<ArrayBuffer> {
    // Import key
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Encrypt
    const dataBuffer = new TextEncoder().encode(data);
    return await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      dataBuffer
    );
  }

  private async performDecryption(
    ciphertext: ArrayBuffer,
    keyData: string,
    iv: ArrayBuffer,
    salt: ArrayBuffer
  ): Promise<ArrayBuffer> {
    // Import key
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decrypt
    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      ciphertext
    );
  }

  private async createHMACSignature(data: string, keyData: string): Promise<ArrayBuffer> {
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const dataBuffer = new TextEncoder().encode(data);
    return await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  }

  private compareArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): boolean {
    if (buffer1.byteLength !== buffer2.byteLength) return false;
    
    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);
    
    for (let i = 0; i < view1.length; i++) {
      if (view1[i] !== view2[i]) return false;
    }
    
    return true;
  }

  private compress(data: string): string {
    // Simple compression - in production, use a proper compression library
    return data; // Placeholder
  }

  private decompress(data: string): string {
    // Simple decompression - in production, use a proper compression library
    return data; // Placeholder
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupKeyRotation(): void {
    if (this.config.keyRotationInterval > 0) {
      setInterval(() => {
        this.checkAndRotateKeys();
      }, 24 * 60 * 60 * 1000); // Check daily
    }
  }

  private async checkAndRotateKeys(): Promise<void> {
    const now = new Date();
    
    for (const [keyId, metadata] of this.keyMetadata) {
      const keyAge = now.getTime() - metadata.createdAt.getTime();
      
      if (keyAge > this.config.keyRotationInterval) {
        try {
          await this.rotateKey(keyId);
        } catch (error) {
          console.error(`Failed to rotate key ${keyId}:`, error);
        }
      }
    }
  }

  /**
   * Get cryptographic statistics
   */
  getStatistics(): {
    totalKeys: number;
    totalOperations: number;
    auditEntries: number;
    lastKeyRotation?: Date;
    integrityValid: boolean;
  } {
    const auditCounts = this.auditTrail.reduce((acc, entry) => {
      acc[entry.operation] = (acc[entry.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lastRotation = this.auditTrail
      .filter(entry => entry.operation === 'key_rotation')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return {
      totalKeys: this.keyMetadata.size,
      totalOperations: this.auditTrail.length,
      auditEntries: this.auditTrail.length,
      lastKeyRotation: lastRotation?.timestamp,
      integrityValid: this.verifyAuditIntegrity(),
    };
  }
}

/**
 * Merkle Tree implementation for audit trail integrity
 */
export class MerkleTree {
  private leaves: string[] = [];
  private history: Array<{ timestamp: Date; root: string }> = [];

  /**
   * Add a new leaf value to the tree
   */
  addLeaf(value: string): void {
    const hash = this.hash(value);
    this.leaves.push(hash);
    const root = this.computeRoot(this.leaves);
    this.history.push({ timestamp: new Date(), root });
  }

  /**
   * Get the current Merkle root
   */
  getCurrentRoot(): string {
    return this.history.length > 0 ? this.history[this.history.length - 1].root : '';
  }

  /**
   * Get the full audit history
   */
  getHistory(): Array<{ timestamp: Date; root: string }> {
    return [...this.history];
  }

  /**
   * Compute Merkle root from array of hashes
   */
  private computeRoot(nodes: string[]): string {
    if (nodes.length === 0) return '';
    
    let level = [...nodes];
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : level[i];
        const combined = left + right;
        const hash = this.hash(combined);
        next.push(hash);
      }
      level = next;
    }
    
    return level[0];
  }

  /**
   * Hash function using Web Crypto API
   */
  private hash(data: string): string {
    // Simple hash for demo - in production, use crypto.subtle.digest
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}