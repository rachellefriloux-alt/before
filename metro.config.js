const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Customize the config before returning it
config.server = {
  ...config.server,
  port: 5000,
  host: '0.0.0.0',
};

module.exports = config;