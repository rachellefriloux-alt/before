/*
 * Sallie AI Cloud Backup System
 * Handles data backup to cloud storage with encryption and versioning
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { EventEmitter } from 'events';

export interface BackupData {
    id: string;
    timestamp: number;
    version: string;
    data: any;
    metadata: BackupMetadata;
}

export interface BackupMetadata {
    type: string;
    size: number;
    checksum: string;
    encrypted?: boolean;
}

export interface BackupSettings {
    enabled: boolean;
    frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
    retention: number; // days to keep backups
    encrypt: boolean;
    autoBackup: boolean;
    wifiOnly: boolean;
}

export interface CloudProvider {
    name: string;
    upload: (data: BackupData, encrypted: boolean) => Promise<string>;
    download: (backupId: string) => Promise<BackupData>;
    list: () => Promise<BackupData[]>;
    delete: (backupId: string) => Promise<void>;
    authenticate: () => Promise<boolean>;
}

export class CloudBackupManager extends EventEmitter {
    private static instance: CloudBackupManager;
    private settings: BackupSettings;
    private providers: Map<string, CloudProvider> = new Map();
    private currentProvider?: CloudProvider;
    private backupQueue: BackupData[] = [];
    private isBackingUp: boolean = false;

    private readonly STORAGE_KEYS = {
        SETTINGS: 'sallie_backup_settings',
        BACKUP_QUEUE: 'sallie_backup_queue',
        LAST_BACKUP: 'sallie_last_backup'
    };

    static getInstance(): CloudBackupManager {
        if (!CloudBackupManager.instance) {
            CloudBackupManager.instance = new CloudBackupManager();
        }
        return CloudBackupManager.instance;
    }

    constructor() {
        super();
        this.settings = this.getDefaultSettings();
        this.initialize();
    }

    private getDefaultSettings(): BackupSettings {
        return {
            enabled: false,
            frequency: 'weekly',
            retention: 30, // 30 days
            encrypt: true,
            autoBackup: false,
            wifiOnly: false
        };
    }

    private async initialize(): Promise<void> {
        await this.loadSettings();
        await this.loadBackupQueue();

        // Set up automatic backup scheduling
        this.setupAutoBackup();

        // Initialize default providers
        this.registerProvider('local', new LocalFileProvider());
        // You can add more providers like Google Drive, Dropbox, etc.
    }

    private async loadSettings(): Promise<void> {
        try {
            const settingsData = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.warn('Failed to load backup settings:', error);
        }
    }

    private async saveSettings(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save backup settings:', error);
        }
    }

    private async loadBackupQueue(): Promise<void> {
        try {
            const queueData = await AsyncStorage.getItem(this.STORAGE_KEYS.BACKUP_QUEUE);
            if (queueData) {
                this.backupQueue = JSON.parse(queueData);
            }
        } catch (error) {
            console.warn('Failed to load backup queue:', error);
        }
    }

    private async saveBackupQueue(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.BACKUP_QUEUE, JSON.stringify(this.backupQueue));
        } catch (error) {
            console.warn('Failed to save backup queue:', error);
        }
    }

    registerProvider(name: string, provider: CloudProvider): void {
        this.providers.set(name, provider);
    }

    async setProvider(providerName: string): Promise<boolean> {
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }

        const authenticated = await provider.authenticate();
        if (authenticated) {
            this.currentProvider = provider;
            return true;
        }

        return false;
    }

    getAvailableProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    getCurrentProvider(): string | null {
        if (!this.currentProvider) return null;
        return Array.from(this.providers.entries())
            .find(([_, provider]) => provider === this.currentProvider)?.[0] || null;
    }

    async updateSettings(newSettings: Partial<BackupSettings>): Promise<void> {
        this.settings = { ...this.settings, ...newSettings };
        await this.saveSettings();

        if (newSettings.frequency || newSettings.autoBackup) {
            this.setupAutoBackup();
        }
    }

    getSettings(): BackupSettings {
        return { ...this.settings };
    }

    async createBackup(data: any, type: string = 'user_data'): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No cloud provider configured');
        }

        const backupData: BackupData = {
            id: this.generateBackupId(),
            timestamp: Date.now(),
            version: '1.0',
            data,
            metadata: {
                type,
                size: JSON.stringify(data).length,
                checksum: this.generateChecksum(data)
            }
        };

        try {
            this.emit('backupStarted', backupData);

            // Add to queue for processing
            this.backupQueue.push(backupData);
            await this.saveBackupQueue();

            // Process backup
            const backupId = await this.processBackup(backupData);

            // Update last backup time
            await AsyncStorage.setItem(this.STORAGE_KEYS.LAST_BACKUP, Date.now().toString());

            this.emit('backupCompleted', backupData);
            return backupId;

        } catch (error) {
            console.error('Backup failed:', error);
            this.emit('backupFailed', { backup: backupData, error });
            throw error;
        }
    }

    private async processBackup(backupData: BackupData): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No provider configured');
        }

        let dataToUpload = backupData;

        // Encrypt if enabled
        if (this.settings.encrypt) {
            dataToUpload = await this.encryptBackup(backupData);
        }

        // Upload to cloud
        const cloudId = await this.currentProvider.upload(dataToUpload, this.settings.encrypt);

        // Remove from queue
        this.backupQueue = this.backupQueue.filter(item => item.id !== backupData.id);
        await this.saveBackupQueue();

        return cloudId;
    }

    async restoreBackup(backupId: string): Promise<any> {
        if (!this.currentProvider) {
            throw new Error('No cloud provider configured');
        }

        try {
            this.emit('restoreStarted', backupId);

            const backupData = await this.currentProvider.download(backupId);

            let restoredData = backupData;

            // Decrypt if encrypted
            if (this.settings.encrypt) {
                restoredData = await this.decryptBackup(backupData);
            }

            this.emit('restoreCompleted', restoredData);
            return restoredData.data;

        } catch (error) {
            console.error('Restore failed:', error);
            this.emit('restoreFailed', { backupId, error });
            throw error;
        }
    }

    async listBackups(): Promise<BackupData[]> {
        if (!this.currentProvider) {
            return [];
        }

        try {
            const backups = await this.currentProvider.list();

            // Filter by retention policy
            const cutoffDate = Date.now() - (this.settings.retention * 24 * 60 * 60 * 1000);
            return backups.filter(backup => backup.timestamp > cutoffDate);

        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }

    async deleteBackup(backupId: string): Promise<void> {
        if (!this.currentProvider) {
            throw new Error('No cloud provider configured');
        }

        try {
            await this.currentProvider.delete(backupId);
            this.emit('backupDeleted', backupId);
        } catch (error) {
            console.error('Failed to delete backup:', error);
            throw error;
        }
    }

    async processBackupQueue(): Promise<void> {
        if (this.isBackingUp || this.backupQueue.length === 0) {
            return;
        }

        this.isBackingUp = true;

        try {
            for (const backup of [...this.backupQueue]) {
                await this.processBackup(backup);
            }
        } finally {
            this.isBackingUp = false;
        }
    }

    private setupAutoBackup(): void {
        // Clear existing timers
        if ((this as any).autoBackupTimer) {
            clearInterval((this as any).autoBackupTimer);
        }

        if (!this.settings.autoBackup || !this.settings.enabled) {
            return;
        }

        const interval = this.getBackupInterval();
        (this as any).autoBackupTimer = setInterval(() => {
            this.performAutoBackup();
        }, interval);
    }

    private getBackupInterval(): number {
        switch (this.settings.frequency) {
            case 'daily':
                return 24 * 60 * 60 * 1000; // 24 hours
            case 'weekly':
                return 7 * 24 * 60 * 60 * 1000; // 7 days
            case 'monthly':
                return 30 * 24 * 60 * 60 * 1000; // 30 days
            default:
                return 7 * 24 * 60 * 60 * 1000; // Default to weekly
        }
    }

    private async performAutoBackup(): Promise<void> {
        try {
            // This would collect data from various stores and create a backup
            // For now, just emit an event
            this.emit('autoBackupTriggered');
        } catch (error) {
            console.error('Auto backup failed:', error);
        }
    }

    private generateBackupId(): string {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateChecksum(data: any): string {
        // Simple checksum - in production, use a proper hashing algorithm
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    private async encryptBackup(backup: BackupData): Promise<BackupData> {
        // Simple encryption - in production, use proper encryption
        const encryptedData = btoa(JSON.stringify(backup.data));
        return {
            ...backup,
            data: encryptedData,
            metadata: {
                ...backup.metadata,
                encrypted: true
            }
        };
    }

    private async decryptBackup(backup: BackupData): Promise<BackupData> {
        // Simple decryption - in production, use proper decryption
        const decryptedData = JSON.parse(atob(backup.data));
        return {
            ...backup,
            data: decryptedData
        };
    }

    getBackupStatus(): {
        enabled: boolean;
        currentProvider: string | null;
        queueLength: number;
        isBackingUp: boolean;
        lastBackup?: number;
    } {
        return {
            enabled: this.settings.enabled,
            currentProvider: this.getCurrentProvider(),
            queueLength: this.backupQueue.length,
            isBackingUp: this.isBackingUp
            // lastBackup would need async access
        };
    }
}

// Local file provider for testing/development
class LocalFileProvider implements CloudProvider {
    name = 'local';

    async authenticate(): Promise<boolean> {
        return true; // Local storage doesn't need authentication
    }

    async upload(data: BackupData, encrypted: boolean): Promise<string> {
        const fileName = `${data.id}.json`;
        const filePath = FileSystem.documentDirectory + 'backups/' + fileName;

        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'backups/', { intermediates: true });

        // Write backup file
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));

        return fileName;
    }

    async download(backupId: string): Promise<BackupData> {
        const filePath = FileSystem.documentDirectory + 'backups/' + backupId;
        const content = await FileSystem.readAsStringAsync(filePath);
        return JSON.parse(content);
    }

    async list(): Promise<BackupData[]> {
        const backupsDir = FileSystem.documentDirectory + 'backups/';

        try {
            const files = await FileSystem.readDirectoryAsync(backupsDir);
            const backups: BackupData[] = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await FileSystem.readAsStringAsync(backupsDir + file);
                    backups.push(JSON.parse(content));
                }
            }

            return backups;
        } catch (error) {
            return [];
        }
    }

    async delete(backupId: string): Promise<void> {
        const filePath = FileSystem.documentDirectory + 'backups/' + backupId;
        await FileSystem.deleteAsync(filePath);
    }
}

// Export singleton instance
export const cloudBackupManager = CloudBackupManager.getInstance();
