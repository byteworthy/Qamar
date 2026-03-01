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
import crypto from "crypto";
import { defaultLogger } from "../utils/logger";

// =============================================================================
// REVENUECAT WEBHOOK SIGNATURE VERIFICATION
// =============================================================================

let _webhookSecretWarningLogged = false;

function getRevenueCatWebhookSecret(): string | undefined {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret && !_webhookSecretWarningLogged) {
    _webhookSecretWarningLogged = true;
    defaultLogger.warn(
      "[billing] REVENUECAT_WEBHOOK_SECRET not set — webhook signature verification disabled (dev mode)",
      { operation: "billing_init" },
    );
  }
  return secret;
}

/**
 * Verify RevenueCat webhook signature using HMAC-SHA256.
 * RevenueCat sends the signature in the X-RevenueCat-Signature header.
 * Returns true if valid or if secret is not configured (dev mode).
 */
function verifyRevenueCatSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
): boolean {
  const secret = getRevenueCatWebhookSecret();
  if (!secret) {
    return true; // Dev mode — no verification
  }

  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signatureHeader, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

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
 * RevenueCat webhook receiver for IAP validation
 */
export function registerBillingWebhookRoute(app: Express): void {
  app.post("/api/billing/webhook/revenuecat", (req: Request, res: Response) => {
    // Verify webhook signature if secret is configured
    const signature = req.headers["x-revenuecat-signature"] as
      | string
      | undefined;
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

    if (
      !verifyRevenueCatSignature(rawBody || JSON.stringify(req.body), signature)
    ) {
      defaultLogger.warn("[billing] RevenueCat webhook signature invalid", {
        operation: "webhook_verify",
        securityEvent: "webhook_signature_invalid",
      });
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    const event = req.body?.event;
    defaultLogger.info("[billing] RevenueCat webhook", {
      eventType: event?.type ?? "unknown",
    });
    res.status(200).json({ received: true });
  });

  defaultLogger.info("Billing: RevenueCat webhooks registered (IAP mode)", {
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
