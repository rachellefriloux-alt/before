module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Use Worklets plugin (replaces reanimated/plugin)
      ['react-native-worklets/plugin', {
        globals: ['__scanCodes'],
        processNestedWorklets: true
      }],
    ],
  };
};
