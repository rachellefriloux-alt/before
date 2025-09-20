const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Customize the config before returning it
config.server = {
  ...config.server,
  port: 5000,
};

// Memory optimization settings
config.maxWorkers = 2;
config.resolver = {
  ...config.resolver,
  // Limit the number of files processed to reduce memory usage  
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Add alias support for @ paths
  alias: {
    '@': path.resolve(__dirname, './'),
    '@src': path.resolve(__dirname, './src'),
    '@core': path.resolve(__dirname, './core'),
    '@ui': path.resolve(__dirname, './ui'),
    '@store': path.resolve(__dirname, './store'),
    '@components': path.resolve(__dirname, './src/components'),
    '@screens': path.resolve(__dirname, './src/screens'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@types': path.resolve(__dirname, './types'),
    '@ai': path.resolve(__dirname, './ai'),
    '@assets': path.resolve(__dirname, './assets'),
  },
  // Exclude server files from mobile bundle
  blockList: [
    /.*\/assets\/server\/.*/,
    /.*\/scripts\/.*/,
    /.*\.mjs$/,
  ],
};

module.exports = config;