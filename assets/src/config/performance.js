/*
 * Persona: Tough love meets soul care.
 * Module: performance
 * Intent: Handle functionality for performance
 * Provenance-ID: b1d18588-8cad-4c09-8323-459b56b537cf
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Performance optimization configuration
// This file contains optimizations for better app performance

// Enable lazy loading for heavy components
export const lazyLoadComponents = {
  PersonaVisualization: () => import('./components/PersonaVisualization.vue'),
  EmotionOverlay: () => import('./components/EmotionOverlay.vue'),
  StoryCohesionPanel: () => import('./components/StoryCohesionPanel.vue'),
  AmbientAwarenessSystem: () => import('./components/AmbientAwarenessSystem.vue'),
  FirstContactSequence: () => import('./components/FirstContactSequence.vue'),
  AssetManager: () => import('./components/AssetManager.vue')
};

// Image optimization settings
export const imageOptimization = {
  formats: ['webp', 'avif', 'png'],
  sizes: [320, 640, 1024, 1920],
  quality: 85
};

// Bundle optimization settings
export const bundleOptimization = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      },
      firebase: {
        test: /[\\/]node_modules[\\/]firebase[\\/]/,
        name: 'firebase',
        chunks: 'all'
      }
    }
  }
};

// Memory optimization settings
export const memoryOptimization = {
  // Debounce expensive operations
  debounceDelay: 300,
  // Throttle scroll events
  throttleDelay: 16,
  // Cache expensive computations
  cacheSize: 100
};

// Network optimization settings
export const networkOptimization = {
  // API request caching
  cacheTimeout: 300000, // 5 minutes
  // Retry failed requests
  retryAttempts: 3,
  // Request timeout
  timeout: 10000
};
