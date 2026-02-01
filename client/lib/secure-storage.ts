/**
 * Secure Storage Wrapper
 *
 * Provides a unified interface for securely storing sensitive data
 * using platform-specific secure storage mechanisms:
 * - iOS: Keychain
 * - Android: Keystore (EncryptedSharedPreferences)
 * - Web: AsyncStorage with encryption warning
 *
 * Use this for:
 * - Authentication tokens
 * - Session data
 * - Push notification tokens
 * - Any sensitive user data
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage wrapper using Keychain (iOS) / Keystore (Android)
 * Falls back to AsyncStorage on web with encryption warning
 */
export const secureStorage = {
  /**
   * Store a value securely
   * @param key - Unique identifier for the value
   * @param value - String value to store
   * @throws Error if storage fails
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - AsyncStorage (less secure)
        console.warn('[SecureStorage] Web platform - using AsyncStorage fallback. Consider additional encryption for production.');
        await AsyncStorage.setItem(key, value);
      } else {
        // Native: Use secure storage (Keychain/Keystore)
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
          // Require authentication for highly sensitive data (optional)
          // requireAuthentication: true,
        });
      }
    } catch (error) {
      console.error(`[SecureStorage] Failed to set item for key "${key}":`, error);
      throw new Error(`Failed to securely store data: ${error}`);
    }
  },

  /**
   * Retrieve a value securely
   * @param key - Unique identifier for the value
   * @returns The stored value or null if not found
   * @throws Error if retrieval fails
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`[SecureStorage] Failed to get item for key "${key}":`, error);
      // Return null instead of throwing to handle missing keys gracefully
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   * @param key - Unique identifier for the value to remove
   * @throws Error if removal fails
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`[SecureStorage] Failed to remove item for key "${key}":`, error);
      throw new Error(`Failed to remove secure data: ${error}`);
    }
  },

  /**
   * Check if a key exists in secure storage
   * @param key - Unique identifier to check
   * @returns true if the key exists, false otherwise
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`[SecureStorage] Failed to check item for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all secure storage (use with caution)
   * Note: On native platforms, this only clears items stored by this app
   */
  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.clear();
      } else {
        // Note: SecureStore doesn't have a clear() method
        // You need to track keys and delete them individually
        console.warn('[SecureStorage] Clear operation not fully supported on native platforms. Delete keys individually.');
      }
    } catch (error) {
      console.error('[SecureStorage] Failed to clear storage:', error);
      throw new Error(`Failed to clear secure storage: ${error}`);
    }
  },
};

/**
 * Keys used throughout the app (centralized for consistency)
 */
export const SECURE_KEYS = {
  PUSH_TOKEN: 'secure_push_token',
  SESSIONS: 'secure_sessions',
  BILLING_PROFILE: 'secure_billing_profile',
  NOTIFICATION_SETTINGS: 'secure_notification_settings',
  USER_PREFERENCES: 'secure_user_preferences',
} as const;
