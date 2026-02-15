/**
 * RevenueCat SDK Initialization (re-export facade)
 *
 * This module re-exports from the canonical service at @/services/revenuecat
 * so existing imports continue to work.
 */

export {
  initializeRevenueCat,
  getCustomerInfo as getSubscriptionStatus,
  restorePurchases as syncSubscriptions,
} from "@/services/revenuecat";

// Re-export the full init for backward compat
export { initializeRevenueCat as default } from "@/services/revenuecat";
