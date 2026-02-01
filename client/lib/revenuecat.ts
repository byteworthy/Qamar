/**
 * RevenueCat SDK Initialization
 *
 * Manages subscription setup and entitlement checking.
 * See: https://docs.revenuecat.com/docs/reactnative
 */

import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { REVENUECAT_CONFIG, VALIDATION_MODE } from './config';

/**
 * Initialize RevenueCat SDK
 *
 * Call this once at app startup (in App.tsx or root component).
 * Must be called before any purchase operations.
 *
 * @throws {Error} If API key is missing or initialization fails
 */
export async function initializeRevenueCat(): Promise<void> {
  try {
    // Skip initialization in validation mode
    if (VALIDATION_MODE) {
      console.log('[RevenueCat] Skipping initialization (VALIDATION_MODE=true)');
      return;
    }

    // Verify API key exists
    if (!REVENUECAT_CONFIG.apiKey) {
      console.error('[RevenueCat] Missing API key. Set EXPO_PUBLIC_REVENUECAT_API_KEY in environment variables.');
      throw new Error('RevenueCat API key not configured');
    }

    // iOS only for now (Android support can be added later)
    if (Platform.OS !== 'ios') {
      console.log('[RevenueCat] Skipping initialization (not iOS)');
      return;
    }

    // Configure SDK
    Purchases.setLogLevel(LOG_LEVEL.INFO);

    // Initialize Purchases
    await Purchases.configure({
      apiKey: REVENUECAT_CONFIG.apiKey,
      appUserID: undefined, // Let RevenueCat generate anonymous ID
    });

    console.log('[RevenueCat] Initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
    // Don't throw - allow app to continue with IAP disabled
    // User will see "Coming Soon" in paywall
  }
}

/**
 * Get current user's subscription entitlements
 *
 * @returns Entitlement status for Plus and Pro tiers
 */
export async function getSubscriptionStatus(): Promise<{
  isPlusSubscriber: boolean;
  isProSubscriber: boolean;
  isLoading: boolean;
}> {
  try {
    if (VALIDATION_MODE) {
      return { isPlusSubscriber: false, isProSubscriber: false, isLoading: false };
    }

    const customerInfo = await Purchases.getCustomerInfo();

    return {
      isPlusSubscriber: customerInfo.entitlements.active['noor_plus_access'] !== undefined,
      isProSubscriber: customerInfo.entitlements.active['noor_pro_access'] !== undefined,
      isLoading: false,
    };
  } catch (error) {
    console.error('[RevenueCat] Failed to get subscription status:', error);
    return { isPlusSubscriber: false, isProSubscriber: false, isLoading: false };
  }
}

/**
 * Force sync subscription status with RevenueCat servers
 *
 * Call this after a purchase to ensure entitlements are up to date.
 */
export async function syncSubscriptions(): Promise<void> {
  try {
    if (VALIDATION_MODE) return;

    await Purchases.syncPurchases();
    console.log('[RevenueCat] Subscriptions synced successfully');
  } catch (error) {
    console.error('[RevenueCat] Failed to sync subscriptions:', error);
  }
}
