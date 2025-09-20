/*
 * Sallie AI Asset Cache Manager
 * Handles caching of media assets for offline access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface CachedAsset {
    id: string;
    uri: string;
    localUri: string;
    type: string;
    size: number;
    timestamp: number;
    expiresAt?: number;
}

export interface CacheConfig {
    maxSize: number; // in bytes
    defaultExpiration: number; // in milliseconds
    cacheDirectory: string;
}

export class AssetCacheManager {
    private static instance: AssetCacheManager;
    private cache: Map<string, CachedAsset> = new Map();
    private config: CacheConfig = {
        maxSize: 100 * 1024 * 1024, // 100MB
        defaultExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
        cacheDirectory: FileSystem.cacheDirectory + 'sallie_assets/',
    };

    private constructor() {
        this.initializeCache();
    }

    public static getInstance(): AssetCacheManager {
        if (!AssetCacheManager.instance) {
            AssetCacheManager.instance = new AssetCacheManager();
        }
        return AssetCacheManager.instance;
    }

    private async initializeCache(): Promise<void> {
        try {
            // Ensure cache directory exists
            const dirInfo = await FileSystem.getInfoAsync(this.config.cacheDirectory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.config.cacheDirectory, { intermediates: true });
            }

            // Load cached assets from storage
            const cachedData = await AsyncStorage.getItem('sallie_asset_cache');
            if (cachedData) {
                const cachedAssets: CachedAsset[] = JSON.parse(cachedData);
                cachedAssets.forEach(asset => {
                    this.cache.set(asset.id, asset);
                });
            }
        } catch (error) {
            console.error('Failed to initialize cache:', error);
        }
    }

    private async saveCacheToStorage(): Promise<void> {
        try {
            const cacheArray = Array.from(this.cache.values());
            await AsyncStorage.setItem('sallie_asset_cache', JSON.stringify(cacheArray));
        } catch (error) {
            console.error('Failed to save cache to storage:', error);
        }
    }

    public async cacheAsset(uri: string, id: string, type: string, size: number, expiration?: number): Promise<string> {
        try {
            // Check if already cached
            const existing = this.cache.get(id);
            if (existing) {
                const fileInfo = await FileSystem.getInfoAsync(existing.localUri);
                if (fileInfo.exists) {
                    return existing.localUri;
                }
            }

            // Download and cache the asset
            const filename = `${id}_${Date.now()}.${type.split('/')[1]}`;
            const localUri = this.config.cacheDirectory + filename;

            await FileSystem.downloadAsync(uri, localUri);

            const cachedAsset: CachedAsset = {
                id,
                uri,
                localUri,
                type,
                size,
                timestamp: Date.now(),
                expiresAt: expiration ? Date.now() + expiration : Date.now() + this.config.defaultExpiration,
            };

            this.cache.set(id, cachedAsset);
            await this.saveCacheToStorage();

            // Clean up old cache if needed
            await this.cleanupCache();

            return localUri;
        } catch (error) {
            console.error('Failed to cache asset:', error);
            throw error;
        }
    }

    public getCachedAsset(id: string): CachedAsset | null {
        return this.cache.get(id) || null;
    }

    public async isAssetCached(id: string): Promise<boolean> {
        const cached = this.cache.get(id);
        if (!cached) return false;

        try {
            const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
            return fileInfo.exists;
        } catch {
            return false;
        }
    }

    public async getAssetUri(id: string): Promise<string | null> {
        const cached = this.cache.get(id);
        if (!cached) return null;

        // Check if expired
        if (cached.expiresAt && Date.now() > cached.expiresAt) {
            await this.removeAsset(id);
            return null;
        }

        try {
            const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
            return fileInfo.exists ? cached.localUri : null;
        } catch {
            return null;
        }
    }

    public async removeAsset(id: string): Promise<void> {
        const cached = this.cache.get(id);
        if (cached) {
            try {
                await FileSystem.deleteAsync(cached.localUri, { idempotent: true });
            } catch (error) {
                console.error('Failed to delete cached file:', error);
            }
            this.cache.delete(id);
            await this.saveCacheToStorage();
        }
    }

    private async cleanupCache(): Promise<void> {
        try {
            const now = Date.now();
            const toRemove: string[] = [];

            // Find expired assets
            for (const [id, asset] of this.cache.entries()) {
                if (asset.expiresAt && now > asset.expiresAt) {
                    toRemove.push(id);
                }
            }

            // Remove expired assets
            for (const id of toRemove) {
                await this.removeAsset(id);
            }

            // Check total cache size and remove oldest if needed
            let totalSize = 0;
            const assets = Array.from(this.cache.values()).sort((a, b) => a.timestamp - b.timestamp);

            for (const asset of assets) {
                totalSize += asset.size;
            }

            if (totalSize > this.config.maxSize) {
                const toRemoveSize: string[] = [];
                let removedSize = 0;

                for (const asset of assets) {
                    if (totalSize - removedSize <= this.config.maxSize * 0.8) break;
                    toRemoveSize.push(asset.id);
                    removedSize += asset.size;
                }

                for (const id of toRemoveSize) {
                    await this.removeAsset(id);
                }
            }
        } catch (error) {
            console.error('Failed to cleanup cache:', error);
        }
    }

    public async clearCache(): Promise<void> {
        try {
            // Delete all cached files
            for (const asset of this.cache.values()) {
                try {
                    await FileSystem.deleteAsync(asset.localUri, { idempotent: true });
                } catch (error) {
                    console.error('Failed to delete cached file:', error);
                }
            }

            this.cache.clear();
            await AsyncStorage.removeItem('sallie_asset_cache');
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    public getCacheStats(): { count: number; totalSize: number } {
        let totalSize = 0;
        for (const asset of this.cache.values()) {
            totalSize += asset.size;
        }
        return {
            count: this.cache.size,
            totalSize,
        };
    }
}
