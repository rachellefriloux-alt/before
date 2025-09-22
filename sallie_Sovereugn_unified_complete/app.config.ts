import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Sallie Sovereign',
  slug: 'sallie-sovereign',
  scheme: 'sallie',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sallie.sovereign'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a1a2e'
    },
    package: 'com.sallie.sovereign',
    permissions: [
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
      'android.permission.READ_CONTACTS',
      'android.permission.WRITE_CONTACTS',
      'android.permission.CALL_PHONE',
      'android.permission.READ_SMS',
      'android.permission.SEND_SMS',
      'android.permission.READ_CALENDAR',
      'android.permission.WRITE_CALENDAR',
      'android.permission.RECORD_AUDIO',
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE'
    ],
    intentFilters: [
      {
        action: 'android.intent.action.MAIN',
        category: [
          'android.intent.category.HOME',
          'android.intent.category.DEFAULT',
          'android.intent.category.LAUNCHER'
        ],
        priority: 1
      }
    ]
  },
  plugins: [
    'expo-notifications',
    'expo-contacts',
    'expo-intent-launcher',
    'expo-device',
    'expo-linking',
    'expo-camera',
    'expo-speech',
    'expo-av',
    'expo-secure-store',
    'react-native-permissions',
    'react-native-bootsplash'
  ],
  extra: {
    eas: {
      projectId: 'sallie-sovereign'
    }
  }
};

export default config;
