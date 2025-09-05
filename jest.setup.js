/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Jest setup for Sallie AI testing.
 * Got it, love.
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([]))
}));

// Mock expo modules
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => Promise.resolve({
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true,
  })),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
  NetworkStateType: {
    WIFI: 'wifi',
    CELLULAR: 'cellular',
    NONE: 'none',
  },
}));

jest.mock('expo-device', () => ({
  deviceName: 'Test Device',
  osVersion: '13',
  modelId: 'test-model-id',
}));

// Mock react-native modules
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android || obj.default),
  },
  NativeModules: {},
  DeviceEventEmitter: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
  },
}));

// Silence specific console methods during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
