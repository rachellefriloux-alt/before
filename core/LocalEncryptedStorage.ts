/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Local-only encrypted storage using SQLCipher for localOnly flavor.
 * Got it, love.
 */

import SQLite from 'react-native-sqlite-storage';
import { encryptData, decryptData } from '../utils/securityUtils';

export interface LocalStorageConfig {
  databaseName: string;
  encryptionKey: string;
  tableName: string;
}

/**
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Local-only encrypted storage using SQLCipher for localOnly flavor.
 * Got it, love.
 */
class LocalEncryptedStorage {
  private db: SQLite.SQLiteDatabase | null = null;
  private config: LocalStorageConfig;
  private initialized: boolean = false;

  constructor(config: LocalStorageConfig) {
    this.config = config;
    SQLite.enablePromise(true);
  }

  /**
   * Initialize the encrypted database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = await SQLite.openDatabase({
        name: this.config.databaseName,
        location: 'default',
        key: this.config.encryptionKey
      });

      await this.createTable();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize LocalEncryptedStorage:', error);
      throw error;
    }
  }

  /**
   * Create the storage table if it doesn't exist
   */
  private async createTable(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;

    await this.db.executeSql(createTableSQL);
  }

  /**
   * Store encrypted data
   */
  async setItem(key: string, value: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      const encryptedValue = await encryptData(value);
      const timestamp = Date.now();

      await this.db.executeSql(
        `INSERT OR REPLACE INTO ${this.config.tableName} (key, value, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [key, encryptedValue, timestamp, timestamp]
      );
    } catch (error) {
      console.error('Failed to set item:', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async getItem(key: string): Promise<string | null> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.executeSql(
        `SELECT value FROM ${this.config.tableName} WHERE key = ?`,
        [key]
      );

      if (results[0].rows.length === 0) {
        return null;
      }

      const encryptedValue = results[0].rows.item(0).value;
      return await decryptData(encryptedValue);
    } catch (error) {
      console.error('Failed to get item:', error);
      throw error;
    }
  }

  /**
   * Remove data
   */
  async removeItem(key: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql(
        `DELETE FROM ${this.config.tableName} WHERE key = ?`,
        [key]
      );
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.executeSql(
        `SELECT key FROM ${this.config.tableName}`,
        []
      );

      const keys: string[] = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        keys.push(results[0].rows.item(i).key);
      }

      return keys;
    } catch (error) {
      console.error('Failed to get all keys:', error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql(
        `DELETE FROM ${this.config.tableName}`,
        []
      );
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    databaseSize: number;
    lastModified: number;
  }> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      const countResult = await this.db.executeSql(
        `SELECT COUNT(*) as count, MAX(updated_at) as lastModified FROM ${this.config.tableName}`,
        []
      );

      return {
        totalEntries: countResult[0].rows.item(0).count,
        databaseSize: 0, // Would need native module to get actual file size
        lastModified: countResult[0].rows.item(0).lastModified || 0
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Clear all data from the encrypted database
   */
  async clearAll(): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql(`DELETE FROM ${this.config.tableName}`, []);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export default LocalEncryptedStorage;
