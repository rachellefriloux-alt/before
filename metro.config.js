const { getDefaultConfig } = require('expo/metro-config');

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
};

module.exports = config;