/*
 * Sallie AI Image Optimization System
 * Advanced image loading and caching for optimal performance
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTheme } from './ThemeSystem';

interface OptimizedImageProps {
    source: { uri: string } | number;
    style?: any;
    placeholder?: React.ReactNode;
    onLoad?: () => void;
    onError?: (error: any) => void;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    quality?: 'low' | 'medium' | 'high';
    maxWidth?: number;
    maxHeight?: number;
    cacheKey?: string;
}

interface ImageCache {
    [key: string]: {
        uri: string;
        timestamp: number;
        size: number;
    };
}

class ImageOptimizer {
    private static instance: ImageOptimizer;
    private cache: ImageCache = {};
    private readonly CACHE_DIR = FileSystem.cacheDirectory + 'optimized_images/';
    private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
    private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

    static getInstance(): ImageOptimizer {
        if (!ImageOptimizer.instance) {
            ImageOptimizer.instance = new ImageOptimizer();
        }
        return ImageOptimizer.instance;
    }

    async initialize(): Promise<void> {
        try {
            const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
            }
            await this.loadCacheIndex();
            await this.cleanupExpiredCache();
        } catch (error) {
            console.warn('Failed to initialize image cache:', error);
        }
    }

    private async loadCacheIndex(): Promise<void> {
        try {
            const cacheIndexPath = this.CACHE_DIR + 'cache_index.json';
            const indexInfo = await FileSystem.getInfoAsync(cacheIndexPath);

            if (indexInfo.exists) {
                const indexContent = await FileSystem.readAsStringAsync(cacheIndexPath);
                this.cache = JSON.parse(indexContent);
            }
        } catch (error) {
            console.warn('Failed to load cache index:', error);
            this.cache = {};
        }
    }

    private async saveCacheIndex(): Promise<void> {
        try {
            const cacheIndexPath = this.CACHE_DIR + 'cache_index.json';
            await FileSystem.writeAsStringAsync(cacheIndexPath, JSON.stringify(this.cache));
        } catch (error) {
            console.warn('Failed to save cache index:', error);
        }
    }

    async optimizeImage(
        uri: string,
        options: {
            quality?: 'low' | 'medium' | 'high';
            maxWidth?: number;
            maxHeight?: number;
        } = {}
    ): Promise<string> {
        const cacheKey = this.generateCacheKey(uri, options);

        // Check if optimized image exists in cache
        if (this.cache[cacheKey] && await this.isCacheValid(cacheKey)) {
            return this.cache[cacheKey].uri;
        }

        try {
            // For now, return original URI (in a real implementation, you'd use a library like react-native-image-resizer)
            // This is a placeholder for actual image optimization
            const optimizedUri = uri;

            // Cache the result
            this.cache[cacheKey] = {
                uri: optimizedUri,
                timestamp: Date.now(),
                size: 0, // Would calculate actual file size
            };

            await this.saveCacheIndex();
            await this.enforceCacheSizeLimit();

            return optimizedUri;
        } catch (error) {
            console.warn('Failed to optimize image:', error);
            return uri; // Return original on error
        }
    }

    private generateCacheKey(uri: string, options: any): string {
        const optionsStr = JSON.stringify(options);
        return `${uri}_${optionsStr}`.replace(/[^a-zA-Z0-9]/g, '_');
    }

    private async isCacheValid(cacheKey: string): Promise<boolean> {
        if (!this.cache[cacheKey]) return false;

        const cacheEntry = this.cache[cacheKey];
        const isExpired = Date.now() - cacheEntry.timestamp > this.CACHE_EXPIRY;

        if (isExpired) {
            await this.removeFromCache(cacheKey);
            return false;
        }

        // Check if file still exists
        try {
            const fileInfo = await FileSystem.getInfoAsync(cacheEntry.uri);
            return fileInfo.exists;
        } catch {
            await this.removeFromCache(cacheKey);
            return false;
        }
    }

    private async removeFromCache(cacheKey: string): Promise<void> {
        if (this.cache[cacheKey]) {
            try {
                await FileSystem.deleteAsync(this.cache[cacheKey].uri, { idempotent: true });
            } catch (error) {
                console.warn('Failed to delete cached file:', error);
            }
            delete this.cache[cacheKey];
            await this.saveCacheIndex();
        }
    }

    private async cleanupExpiredCache(): Promise<void> {
        const expiredKeys: string[] = [];

        for (const [key, entry] of Object.entries(this.cache)) {
            if (Date.now() - entry.timestamp > this.CACHE_EXPIRY) {
                expiredKeys.push(key);
            }
        }

        for (const key of expiredKeys) {
            await this.removeFromCache(key);
        }
    }

    private async enforceCacheSizeLimit(): Promise<void> {
        let totalSize = Object.values(this.cache).reduce((sum, entry) => sum + entry.size, 0);

        if (totalSize > this.MAX_CACHE_SIZE) {
            // Sort by timestamp (oldest first) and remove oldest entries
            const sortedEntries = Object.entries(this.cache)
                .sort(([, a], [, b]) => a.timestamp - b.timestamp);

            for (const [key] of sortedEntries) {
                if (totalSize <= this.MAX_CACHE_SIZE * 0.8) break; // Keep 80% of max size
                await this.removeFromCache(key);
                totalSize = Object.values(this.cache).reduce((sum, entry) => sum + entry.size, 0);
            }
        }
    }

    async clearCache(): Promise<void> {
        try {
            await FileSystem.deleteAsync(this.CACHE_DIR, { idempotent: true });
            await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
            this.cache = {};
            await this.saveCacheIndex();
        } catch (error) {
            console.warn('Failed to clear image cache:', error);
        }
    }

    getCacheSize(): number {
        return Object.values(this.cache).reduce((sum, entry) => sum + entry.size, 0);
    }
}

export const imageOptimizer = ImageOptimizer.getInstance();

/**
 * OptimizedImage component with caching and performance features
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    source,
    style,
    placeholder,
    onLoad,
    onError,
    resizeMode = 'cover',
    quality = 'medium',
    maxWidth,
    maxHeight,
    cacheKey,
}) => {
    const { theme } = useTheme();
    const [optimizedUri, setOptimizedUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const isLocalAsset = typeof source === 'number';
    const originalUri = isLocalAsset ? '' : source.uri;

    useEffect(() => {
        if (isLocalAsset) {
            setOptimizedUri(null);
            setLoading(false);
            return;
        }

        const optimizeImage = async () => {
            try {
                setLoading(true);
                setError(null);

                const optimized = await imageOptimizer.optimizeImage(originalUri, {
                    quality,
                    maxWidth,
                    maxHeight,
                });

                setOptimizedUri(optimized);
                setLoading(false);
                onLoad?.();
            } catch (err) {
                setError(err);
                setLoading(false);
                onError?.(err);
            }
        };

        optimizeImage();
    }, [originalUri, quality, maxWidth, maxHeight]);

    if (loading) {
        return placeholder || (
            <View style={[styles.placeholder, style]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    if (error && !isLocalAsset) {
        return placeholder || (
            <View style={[styles.placeholder, style]}>
                <ActivityIndicator size="small" color={theme.colors.error} />
            </View>
        );
    }

    return (
        <Image
            source={isLocalAsset ? source : { uri: optimizedUri || originalUri }}
            style={style}
            resizeMode={resizeMode}
            onLoad={onLoad}
            onError={onError}
        />
    );
};

/**
 * Avatar component with optimization
 */
interface OptimizedAvatarProps {
    uri?: string;
    size?: number;
    placeholder?: string;
    style?: any;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
    uri,
    size = 80,
    placeholder,
    style,
}) => {
    const { theme } = useTheme();

    const avatarStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        ...style,
    };

    if (!uri) {
        return (
            <View style={[avatarStyle, { backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                <Image
                    source={placeholder ? { uri: placeholder } : require('../assets/images/default-avatar.png')}
                    style={avatarStyle}
                    resizeMode="cover"
                />
            </View>
        );
    }

    return (
        <OptimizedImage
            source={{ uri }}
            style={avatarStyle}
            quality="high"
            maxWidth={size * 2}
            maxHeight={size * 2}
            placeholder={
                <View style={[avatarStyle, { backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
});

export default OptimizedImage;
