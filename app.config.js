const { getDefaultConfig } = require('expo/metro-config');

// Try to load dotenv, but don't fail if it's missing
try {
  require('dotenv').config();
} catch (error) {
  console.warn('dotenv not found, using environment variables as-is');
}

const config = getDefaultConfig(__dirname);

// Enable support for .env files
config.resolver.sourceExts.push('env');

module.exports = {
  expo: {
    name: "Sallie Sovereign",
    slug: "sallie-sovereign",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.sallie.app",
      versionCode: 1
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    scheme: "sallie"
  }
};