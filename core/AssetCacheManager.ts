/*
 * Sallie AI Asset Caching System
 * Advanced caching for media assets with offline support
 */

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface CachedAsset {
    id: string;
    originalUri: string;
    localUri: string;
    type: 'image' | 'video' | 'audio' | 'document';
    size: number;
    lastAccessed: number;
    expiresAt?: number;
    metadata?: Record<string, any>;
}

export interface CacheConfig {
    maxSize: number; // Maximum cache size in bytes
    maxAge: number; // Maximum age in milliseconds
    cacheDirectory: string;
    compressionEnabled: boolean;
}

export class AssetCacheManager {
    private static instance: AssetCacheManager;
    private config: CacheConfig;
    private cache: Map<string, CachedAsset> = new Map();
    private isInitialized = false;

    private constructor(config?: Partial<CacheConfig>) {
        this.config = {
            maxSize: 500 * 1024 * 1024, // 500MB default
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days default
            cacheDirectory: `${FileSystem.documentDirectory}asset_cache/`,
            compressionEnabled: true,
            ...config,
        };
    }

    static getInstance(config?: Partial<CacheConfig>): AssetCacheManager {
        if (!AssetCacheManager.instance) {
            AssetCacheManager.instance = new AssetCacheManager(config);
        }
        return AssetCacheManager.instance;
    }

    // Initialize cache manager
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Ensure cache directory exists
            const dirInfo = await FileSystem.getInfoAsync(this.config.cacheDirectory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.config.cacheDirectory, {
                    intermediates: true,
                });
            }

            // Load cache metadata
            await this.loadCacheMetadata();

            // Clean expired and oversized cache
            await this.cleanCache();

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize asset cache:', error);
            throw error;
        }
    }

    // Load cache metadata from storage
    private async loadCacheMetadata(): Promise<void> {
        try {
            const metadata = await AsyncStorage.getItem('asset_cache_metadata');
            if (metadata) {
                const cacheData: Record<string, CachedAsset> = JSON.parse(metadata);
                this.cache = new Map(Object.entries(cacheData));
            }
        } catch (error) {
            console.error('Failed to load cache metadata:', error);
        }
    }

    // Save cache metadata to storage
    private async saveCacheMetadata(): Promise<void> {
        try {
            const cacheData = Object.fromEntries(this.cache);
            await AsyncStorage.setItem('asset_cache_metadata', JSON.stringify(cacheData));
        } catch (error) {
            console.error('Failed to save cache metadata:', error);
        }
    }

    // Generate cache key from URI
    private generateCacheKey(uri: string): string {
        return btoa(uri).replace(/[^a-zA-Z0-9]/g, '_');
    }

    // Get local cache path for URI
    private getCachePath(uri: string): string {
        const key = this.generateCacheKey(uri);
        return `${this.config.cacheDirectory}${key}`;
    }

    // Check if asset is cached
    async isCached(uri: string): Promise<boolean> {
        const key = this.generateCacheKey(uri);
        return this.cache.has(key);
    }

    // Get cached asset
    async getCachedAsset(uri: string): Promise<CachedAsset | null> {
        const key = this.generateCacheKey(uri);
        const asset = this.cache.get(key);

        if (!asset) return null;

        // Check if asset still exists on disk
        const fileInfo = await FileSystem.getInfoAsync(asset.localUri);
        if (!fileInfo.exists) {
            this.cache.delete(key);
            await this.saveCacheMetadata();
            return null;
        }

        // Update last accessed time
        asset.lastAccessed = Date.now();
        await this.saveCacheMetadata();

        return asset;
    }

    // Cache asset from URI
    async cacheAsset(
        uri: string,
        type: CachedAsset['type'],
        metadata?: Record<string, any>
    ): Promise<CachedAsset> {
        await this.initialize();

        const key = this.generateCacheKey(uri);
        const cachePath = this.getCachePath(uri);

        // Check if already cached
        const existingAsset = await this.getCachedAsset(uri);
        if (existingAsset) {
            return existingAsset;
        }

        try {
            // Download asset
            const downloadResult = await FileSystem.downloadAsync(uri, cachePath);

            if (downloadResult.status !== 200) {
                throw new Error(`Download failed with status ${downloadResult.status}`);
            }

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(cachePath);

            // Create cache entry
            const asset: CachedAsset = {
                id: key,
                originalUri: uri,
                localUri: cachePath,
                type,
                size: fileInfo.exists ? (fileInfo as any).size || downloadResult.headers?.['content-length'] || 0 : 0,
                lastAccessed: Date.now(),
                metadata,
            };

            // Add to cache
            this.cache.set(key, asset);
            await this.saveCacheMetadata();

            // Clean cache if needed
            await this.cleanCache();

            return asset;
        } catch (error) {
            console.error('Failed to cache asset:', error);
            throw error;
        }
    }

    // Remove asset from cache
    async removeAsset(uri: string): Promise<void> {
        const key = this.generateCacheKey(uri);
        const asset = this.cache.get(key);

        if (asset) {
            try {
                // Delete file
                await FileSystem.deleteAsync(asset.localUri, { idempotent: true });

                // Remove from cache
                this.cache.delete(key);
                await this.saveCacheMetadata();
            } catch (error) {
                console.error('Failed to remove cached asset:', error);
            }
        }
    }

    // Clean expired and oversized cache
    async cleanCache(): Promise<void> {
        const now = Date.now();
        const toRemove: string[] = [];

        // Find expired assets
        for (const [key, asset] of this.cache) {
            if (
                (asset.expiresAt && now > asset.expiresAt) ||
                (now - asset.lastAccessed > this.config.maxAge)
            ) {
                toRemove.push(key);
            }
        }

        // Calculate total cache size
        let totalSize = 0;
        for (const asset of this.cache.values()) {
            totalSize += asset.size;
        }

        // Remove oldest assets if over size limit
        if (totalSize > this.config.maxSize) {
            const sortedAssets = Array.from(this.cache.values())
                .sort((a, b) => a.lastAccessed - b.lastAccessed);

            for (const asset of sortedAssets) {
                if (totalSize <= this.config.maxSize) break;
                toRemove.push(asset.id);
                totalSize -= asset.size;
            }
        }

        // Remove assets
        for (const key of toRemove) {
            const asset = this.cache.get(key);
            if (asset) {
                try {
                    await FileSystem.deleteAsync(asset.localUri, { idempotent: true });
                } catch (error) {
                    console.error('Failed to delete cached file:', error);
                }
                this.cache.delete(key);
            }
        }

        if (toRemove.length > 0) {
            await this.saveCacheMetadata();
        }
    }

    // Get cache statistics
    async getCacheStats(): Promise<{
        totalSize: number;
        assetCount: number;
        oldestAsset?: number;
        newestAsset?: number;
    }> {
        let totalSize = 0;
        let oldestAsset: number | undefined;
        let newestAsset: number | undefined;

        for (const asset of this.cache.values()) {
            totalSize += asset.size;
            if (!oldestAsset || asset.lastAccessed < oldestAsset) {
                oldestAsset = asset.lastAccessed;
            }
            if (!newestAsset || asset.lastAccessed > newestAsset) {
                newestAsset = asset.lastAccessed;
            }
        }

        return {
            totalSize,
            assetCount: this.cache.size,
            oldestAsset,
            newestAsset,
        };
    }

    // Clear all cache
    async clearCache(): Promise<void> {
        try {
            // Delete all cached files
            for (const asset of this.cache.values()) {
                await FileSystem.deleteAsync(asset.localUri, { idempotent: true });
            }

            // Clear cache metadata
            this.cache.clear();
            await AsyncStorage.removeItem('asset_cache_metadata');

            // Delete cache directory
            await FileSystem.deleteAsync(this.config.cacheDirectory, { idempotent: true });
        } catch (error) {
            console.error('Failed to clear cache:', error);
            throw error;
        }
    }

    // Preload assets
    async preloadAssets(uris: string[], type: CachedAsset['type']): Promise<void> {
        const promises = uris.map(uri => this.cacheAsset(uri, type));
        await Promise.allSettled(promises);
    }

    // Get cached URI for asset (returns local URI if cached, original URI otherwise)
    async getAssetUri(uri: string): Promise<string> {
        const cachedAsset = await this.getCachedAsset(uri);
        return cachedAsset ? cachedAsset.localUri : uri;
    }

    // Update cache configuration
    updateConfig(config: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // Get cache configuration
    getConfig(): CacheConfig {
        return { ...this.config };
    }
}

// React hook for using asset cache
export const useAssetCache = () => {
    const [cacheManager] = React.useState(() => AssetCacheManager.getInstance());

    React.useEffect(() => {
        cacheManager.initialize().catch(console.error);
    }, [cacheManager]);

    return {
        cacheAsset: cacheManager.cacheAsset.bind(cacheManager),
        getCachedAsset: cacheManager.getCachedAsset.bind(cacheManager),
        isCached: cacheManager.isCached.bind(cacheManager),
        removeAsset: cacheManager.removeAsset.bind(cacheManager),
        getAssetUri: cacheManager.getAssetUri.bind(cacheManager),
        getCacheStats: cacheManager.getCacheStats.bind(cacheManager),
        clearCache: cacheManager.clearCache.bind(cacheManager),
        preloadAssets: cacheManager.preloadAssets.bind(cacheManager),
        cleanCache: cacheManager.cleanCache.bind(cacheManager),
    };
};

// Utility functions
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
};

export default AssetCacheManager;
