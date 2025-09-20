module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-reanimated (SDK 54 compatible)
      ['react-native-reanimated/plugin'],
    ],
  };
};
