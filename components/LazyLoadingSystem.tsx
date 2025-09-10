/*
 * Sallie AI Lazy Loading System
 * Performance optimization through component lazy loading
 */

import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from './ThemeSystem';

interface LazyWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    style?: any;
}

/**
 * LazyWrapper component for consistent loading states
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
    children,
    fallback,
    style,
}) => {
    const { theme } = useTheme();

    const defaultFallback = (
        <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text.secondary, marginTop: 10 }}>
                Loading...
            </Text>
        </View>
    );

    return (
        <Suspense fallback={fallback || defaultFallback}>
            {children}
        </Suspense>
    );
};

/**
 * Higher-order component for lazy loading
 */
export function withLazyLoading<P extends object>(
    importFunc: () => Promise<any>,
    fallback?: React.ReactNode
) {
    const LazyComponent = React.lazy(importFunc);

    return React.forwardRef<ComponentType<P>, P>((props, ref) => (
        <LazyWrapper fallback={fallback}>
            <LazyComponent {...props} ref={ref} />
        </LazyWrapper>
    ));
}

/**
 * Preload function for critical components
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
    // For React Native, we'll use a simple preload mechanism
    // Preload by importing in the background
    setTimeout(() => {
        importFunc().catch(() => {
            // Silently handle preload failures
        });
    }, 100);
};

/**
 * Lazy loaded versions of heavy components
 */

// Lazy load UserProfileManager
export const LazyUserProfileManager = withLazyLoading(
    () => import('./UserProfileManager'),
    undefined
);

// Lazy load AppSettingsManager
export const LazyAppSettingsManager = withLazyLoading(
    () => import('./AppSettingsManager'),
    undefined
);

// Lazy load DataExportImportManager
export const LazyDataExportImportManager = withLazyLoading(
    () => import('./DataExportImportManager'),
    undefined
);

// Lazy load screens
export const LazyProfileScreen = withLazyLoading(
    () => import('../app/screens/ProfileScreen'),
    undefined
);

export const LazyDataManagementScreen = withLazyLoading(
    () => import('../app/screens/DataManagementScreen'),
    undefined
);

/**
 * Bundle splitting configuration
 */
export const LAZY_LOAD_CONFIG = {
    // Critical components loaded immediately
    critical: [
    () => import('./ThemeSystem'),
    () => import('./FontManager'),
    ],

    // Heavy components loaded on demand
    heavy: [
    () => import('./UserProfileManager'),
    () => import('./AppSettingsManager'),
    () => import('./DataExportImportManager'),
    ],

    // Screens loaded on navigation
    screens: [
    () => import('../app/screens/ProfileScreen'),
    () => import('../app/screens/DataManagementScreen'),
    ],
};

/**
 * Preload critical components on app start
 */
export const preloadCriticalComponents = () => {
    LAZY_LOAD_CONFIG.critical.forEach(preloadComponent);
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
    const [metrics, setMetrics] = React.useState({
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
    });

    const startTimer = React.useCallback(() => {
        const start = performance.now();
        return () => {
            const end = performance.now();
            setMetrics(prev => ({ ...prev, loadTime: end - start }));
        };
    }, []);

    return { metrics, startTimer };
};

export default LazyWrapper;
