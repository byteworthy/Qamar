/**
 * Billing Stub Module
 *
 * Stripe billing has been archived in favor of Apple IAP / Google Play Billing.
 * This stub provides no-op implementations to keep the server running.
 *
 * IAP is handled entirely client-side via react-native-iap.
 * See: client/lib/billingProvider.ts
 *
 * Archived Stripe code: archive/stripe-billing/
 */

import type { Express, Request, Response } from "express";
import { defaultLogger } from "../utils/logger";

// =============================================================================
// BILLING SERVICE STUB
// =============================================================================

export type BillingStatus = "free" | "active" | "past_due" | "canceled";

export interface BillingStatusResult {
  status: BillingStatus;
  planName: string;
}

/**
 * Billing service stub - always returns free tier
 * Actual billing is handled client-side via IAP
 */
export const billingService = {
  /**
   * Get billing status for a user (always free - IAP managed client-side)
   */
  async getBillingStatus(_userId: string): Promise<BillingStatusResult> {
    return {
      status: "free",
      planName: "Free",
    };
  },

  /**
   * Check if user has paid status
   * For IAP, this is managed client-side. Server defaults to free.
   */
  isPaidUser(status: BillingStatus): boolean {
    return status === "active" || status === "past_due";
  },
};

/**
 * No-op webhook route (Stripe webhooks disabled)
 */
export function registerBillingWebhookRoute(_app: Express): void {
  // Stripe webhooks archived - IAP uses client-side validation
  defaultLogger.info("Billing: Stripe webhooks disabled - using IAP", {
    operation: "billing_init",
  });
}

/**
 * Stub billing routes that return appropriate responses
 */
export function registerBillingRoutes(app: Express): void {
  // Billing status - always return free (tier managed client-side via IAP)
  app.get("/api/billing/status", (_req: Request, res: Response) => {
    res.json({
      status: "free",
      planName: "Free",
      message: "Subscription managed via App Store / Play Store",
    });
  });

  // Config endpoint - not needed for IAP
  app.get("/api/billing/config", (_req: Request, res: Response) => {
    res.json({
      provider: "iap",
      message: "Use in-app purchases via App Store / Play Store",
    });
  });

  // Checkout redirect - point to app stores
  app.post(
    "/api/billing/create-checkout-session",
    (_req: Request, res: Response) => {
      res.status(400).json({
        error: "Stripe checkout disabled",
        message: "Please use in-app purchase in the mobile app",
      });
    },
  );

  // Portal redirect - point to app store subscriptions
  app.post(
    "/api/billing/create-portal-session",
    (_req: Request, res: Response) => {
      res.status(400).json({
        error: "Stripe portal disabled",
        message: "Manage subscriptions in App Store / Play Store settings",
      });
    },
  );

  // Sync endpoint - no-op
  app.post("/api/billing/sync", (_req: Request, res: Response) => {
    res.json({
      status: "free",
      planName: "Free",
      message: "IAP sync happens client-side",
    });
  });

  defaultLogger.info("Billing: Stub routes registered (IAP mode)", {
    operation: "billing_init",
  });
}

/**
 * Stub Stripe sync object
 */
export async function getStripeSync(): Promise<{
  findOrCreateManagedWebhook: (
    url: string,
  ) => Promise<{ webhook?: { url?: string } } | null>;
  syncBackfill: () => Promise<void>;
}> {
  return {
    findOrCreateManagedWebhook: async (_url: string) => null,
    syncBackfill: async () => {
      defaultLogger.info("Billing: Stripe sync skipped - using IAP", {
        operation: "billing_sync",
      });
    },
  };
}
