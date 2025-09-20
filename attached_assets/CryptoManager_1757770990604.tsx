/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: CryptoManager for key generation, encryption, decryption, signing and verification.
 * Got it, love.
 */

import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

/**
 * CryptoManager handles symmetric key generation, AES encryption/decryption, and HMAC signing/verification.
 */
export class CryptoManager {
  private static readonly KEY_STORAGE = 'sallie_secret_key';

  /**
   * Generates a new AES key and stores it securely.
   */
  public static async generateKey(): Promise<void> {
    const key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
    await SecureStore.setItemAsync(CryptoManager.KEY_STORAGE, key);
  }

  /**
   * Retrieves the stored AES key, or throws if not found.
   */
  private static async getKey(): Promise<string> {
    const key = await SecureStore.getItemAsync(CryptoManager.KEY_STORAGE);
    if (!key) {
      throw new Error('Crypto key not found. Call generateKey() first.');
    }
    return key;
  }

  /**
   * Encrypts plaintext using stored AES key and returns a Base64 ciphertext.
   * @param plaintext UTF-8 string to encrypt.
   */
  public static async encrypt(plaintext: string): Promise<string> {
    const key = await CryptoManager.getKey();
    const cipher = CryptoJS.AES.encrypt(plaintext, key);
    return cipher.toString();
  }

  /**
   * Decrypts Base64 ciphertext using stored AES key and returns plaintext.
   * @param ciphertext Base64 string.
   */
  public static async decrypt(ciphertext: string): Promise<string> {
    const key = await CryptoManager.getKey();
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return text;
  }

  /**
   * Signs data using HMAC-SHA256 and returns hex signature.
   * @param data Input string to sign.
   */
  public static async sign(data: string): Promise<string> {
    const key = await CryptoManager.getKey();
    const hmac = CryptoJS.HmacSHA256(data, key);
    return hmac.toString(CryptoJS.enc.Hex);
  }

  /**
   * Verifies HMAC-SHA256 signature against data.
   * @param data Original data.
   * @param signature Hex signature to verify.
   */
  public static async verify(data: string, signature: string): Promise<boolean> {
    const expected = await CryptoManager.sign(data);
    return expected === signature;
  }
}
