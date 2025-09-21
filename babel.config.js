module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-reanimated (using worklets plugin)
      ['react-native-worklets/plugin', {
        globals: ['__scanCodes'],
        processNestedWorklets: true
      }],
    ],
  };
};