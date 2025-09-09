const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced caching configuration - use standard Metro cache
config.cacheVersion = '1';
config.resetCache = false;

// Optimize transformer for better performance
config.transformer = {
    ...config.transformer,
    // Enable experimental import support for better tree-shaking
    experimentalImportSupport: false,
    // Enable inline requires for better performance
    inlineRequires: true,
    // Optimize asset loading
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    // Enable minification in production
    minifierConfig: {
        compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production',
        },
    },
};

// Enhanced resolver configuration
config.resolver = {
    ...config.resolver,
    // Support additional file extensions
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs'],
    assetExts: [
        'png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'woff', 'woff2',
        'mp3', 'mp4', 'wav', 'aac', 'flac', 'ogg'
    ],
    // Block list for better performance - ignore unnecessary files
    blockList: [
        /node_modules\/.*\/__tests__\/.*/,
        /node_modules\/.*\/\.git\/.*/,
        /node_modules\/.*\/docs\/.*/,
        /.*\.log$/,
        /.*\.lock$/,
        /\.DS_Store$/,
        /coverage\/.*/,
        /\.nyc_output\/.*/,
        /__tests__\/.*/,
        /.*\.test\.js$/,
        /.*\.test\.ts$/,
        /.*\.test\.tsx$/,
        /.*\.spec\.js$/,
        /.*\.spec\.ts$/,
        /.*\.spec\.tsx$/,
    ],
    // Alias configuration for better imports
    alias: {
        '@': path.resolve(__dirname),
        '@components': path.resolve(__dirname, 'components'),
        '@screens': path.resolve(__dirname, 'app/screens'),
        '@assets': path.resolve(__dirname, 'assets'),
        '@utils': path.resolve(__dirname, 'utils'),
        '@types': path.resolve(__dirname, 'types'),
        '@ai': path.resolve(__dirname, 'ai'),
    },
    // Custom resolver for handling .js to .tsx resolution
    resolveRequest: (context, moduleName, platform) => {
        // Handle dynamic imports of .js files that should resolve to .tsx
        if (moduleName.endsWith('.js') && !moduleName.includes('/node_modules/')) {
            const tsxPath = moduleName.replace('.js', '.tsx');
            try {
                // Check if .tsx file exists
                const fs = require('fs');
                const fullTsxPath = path.resolve(context.originModulePath, '..', tsxPath);
                if (fs.existsSync(fullTsxPath)) {
                    return {
                        filePath: fullTsxPath,
                        type: 'sourceFile'
                    };
                }
            } catch (e) {
                // Fall back to default resolution
            }
        }
        // Default resolution
        return context.resolveRequest(context, moduleName, platform);
    }
};

// Watch folders for better hot reloading
config.watchFolders = [
    path.resolve(__dirname, 'components'),
    path.resolve(__dirname, 'app'),
    path.resolve(__dirname, 'assets'),
    path.resolve(__dirname, 'utils'),
    path.resolve(__dirname, 'types'),
    path.resolve(__dirname, 'ai'),
];

// Server configuration for better performance
config.server = {
    ...config.server,
    // Enable enhanced middleware for better caching
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            // Add cache headers for better performance
            if (req.url.includes('.bundle')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
            return middleware(req, res, next);
        };
    },
};

module.exports = config;
