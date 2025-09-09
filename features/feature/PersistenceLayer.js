// PersistenceLayer.js
// Sallie: Persistence Layer module
// Handles cross-device sync, secure storage, and data migration

const fs = require('fs');
const path = require('path');

class PersistenceLayer {
  constructor() {
    this.dataStore = {};
    this.backupPath = path.join(__dirname, 'backup.json');
  }

  /**
   * Save data securely
   */
  saveData(key, value) {
    this.dataStore[key] = value;
    this._persist();
    return true;
  }

  /**
   * Load data by key
   */
  loadData(key) {
    return this.dataStore[key] || null;
  }

  /**
   * Sync data across devices (mocked)
   */
  syncData(devices) {
    // Simulate sync
    return `Data synced across ${devices.length} devices.`;
  }

  /**
   * Backup all data to disk
   */
  backupData() {
    fs.writeFileSync(this.backupPath, JSON.stringify(this.dataStore, null, 2));
    return 'Data backup completed.';
  }

  /**
   * Restore data from backup
   */
  restoreData() {
    if (fs.existsSync(this.backupPath)) {
      const raw = fs.readFileSync(this.backupPath);
      this.dataStore = JSON.parse(raw);
      return 'Data restored from backup.';
    }
    return 'No backup found.';
  }

  /**
   * Delete data by key
   */
  deleteData(key) {
    if (key in this.dataStore) {
      delete this.dataStore[key];
      this._persist();
      return true;
    }
    return false;
  }

  /**
   * List all stored keys
   */
  listKeys() {
    return Object.keys(this.dataStore);
  }

  /**
   * Migrate data to a new format (mocked)
   */
  migrateData(migrationFn) {
    Object.keys(this.dataStore).forEach(key => {
      this.dataStore[key] = migrationFn(this.dataStore[key]);
    });
    this._persist();
    return 'Data migration completed.';
  }

  /**
   * Internal persist to disk
   */
  _persist() {
    fs.writeFileSync(this.backupPath, JSON.stringify(this.dataStore, null, 2));
  }
}

module.exports = new PersistenceLayer();
