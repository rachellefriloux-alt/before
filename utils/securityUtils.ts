/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core security utilities for encryption, authentication, and data protection.
 * Got it, love.
 */

import * as crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Generates a cryptographically secure unique ID
 * @param length Optional length of the ID (default: 32)
 * @returns A unique string ID
 */
export async function generateSecureId(length: number = 32): Promise<string> {
  try {
    const randomBytes = await crypto.getRandomBytesAsync(length);
    return Array.from(new Uint8Array(randomBytes))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Failed to generate secure ID:', error);
    // Fallback to less secure but functional UUID-like string
    return generateUniqueId();
  }
}

/**
 * Generates a unique ID without requiring cryptographic APIs
 * @returns A unique string ID
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

/**
 * Securely store a value using the appropriate storage mechanism for the platform
 * @param key The key to store the value under
 * @param value The value to store
 */
export async function secureStore(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Web doesn't support SecureStore, use localStorage with a prefix
      localStorage.setItem(`secure_${key}`, value);
      return;
    }
    
    // Use SecureStore on native platforms when available
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED
    });
  } catch (error) {
    console.error(`Failed to securely store value for key ${key}:`, error);
    // Fallback to AsyncStorage with encrypted value
    const encryptedValue = await encryptData(value);
    await AsyncStorage.setItem(`secure_${key}`, encryptedValue);
  }
}

/**
 * Retrieve a securely stored value
 * @param key The key to retrieve
 * @returns The stored value, or null if not found
 */
export async function secureRetrieve(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      // Web doesn't support SecureStore, use localStorage with a prefix
      return localStorage.getItem(`secure_${key}`);
    }
    
    // Use SecureStore on native platforms
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to retrieve secure value for key ${key}:`, error);
    
    // Try fallback from AsyncStorage
    try {
      const encryptedValue = await AsyncStorage.getItem(`secure_${key}`);
      if (encryptedValue) {
        return await decryptData(encryptedValue);
      }
    } catch (fallbackError) {
      console.error(`Fallback retrieval also failed for key ${key}:`, fallbackError);
    }
    
    return null;
  }
}

/**
 * Delete a securely stored value
 * @param key The key to delete
 */
export async function secureDelete(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Web doesn't support SecureStore, use localStorage with a prefix
      localStorage.removeItem(`secure_${key}`);
      return;
    }
    
    // Use SecureStore on native platforms
    await SecureStore.deleteItemAsync(key);
    
    // Also try to remove from AsyncStorage fallback
    await AsyncStorage.removeItem(`secure_${key}`);
  } catch (error) {
    console.error(`Failed to delete secure value for key ${key}:`, error);
  }
}

/**
 * Generate a hash of a string value using SHA-256
 * @param value The value to hash
 * @returns The hash as a hex string
 */
export async function generateHash(value: string): Promise<string> {
  try {
    const digest = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      value
    );
    return digest;
  } catch (error) {
    console.error('Failed to generate hash:', error);
    throw error;
  }
}

/**
 * Simple encryption for data (NOTE: This is a placeholder implementation)
 * In a real app, you would use a proper encryption library
 * @param data The data to encrypt
 * @returns The encrypted data
 */
export async function encryptData(data: string): Promise<string> {
  // This is a placeholder - in a real app, use a proper encryption library
  // For demo purposes, we're just doing a simple encoding
  try {
    // In a real implementation, you would use a proper key and IV
    const encoded = Buffer.from(data).toString('base64');
    return encoded;
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Fallback to unencrypted data
  }
}

/**
 * Simple decryption for data (NOTE: This is a placeholder implementation)
 * In a real app, you would use a proper encryption library
 * @param encryptedData The data to decrypt
 * @returns The decrypted data
 */
export async function decryptData(encryptedData: string): Promise<string> {
  // This is a placeholder - in a real app, use a proper decryption library
  // For demo purposes, we're just doing a simple decoding
  try {
    // In a real implementation, you would use the same key and IV used for encryption
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf-8');
    return decoded;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Return the encrypted data as fallback
  }
}

/**
 * Validate a password against security requirements
 * @param password The password to validate
 * @returns An object with isValid flag and any validation messages
 */
export function validatePassword(password: string): { 
  isValid: boolean; 
  messages: string[] 
} {
  const messages = [];
  
  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    messages.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    messages.push('Password must contain at least one special character');
  }
  
  return {
    isValid: messages.length === 0,
    messages
  };
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input The user input to sanitize
 * @returns The sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Obfuscate sensitive data for display (e.g., credit card numbers, emails)
 * @param value The value to obfuscate
 * @param visibleStart Number of characters to show at the start
 * @param visibleEnd Number of characters to show at the end
 * @returns The obfuscated value
 */
export function obfuscateSensitiveData(
  value: string,
  visibleStart: number = 2,
  visibleEnd: number = 2
): string {
  if (!value || value.length <= visibleStart + visibleEnd) {
    return value;
  }
  
  const start = value.substring(0, visibleStart);
  const end = value.substring(value.length - visibleEnd);
  const middle = '*'.repeat(Math.min(value.length - visibleStart - visibleEnd, 8));
  
  return `${start}${middle}${end}`;
}
