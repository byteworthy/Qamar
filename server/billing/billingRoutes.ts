import type { Express, Request, Response } from "express";
import express from "express";
import { billingService } from "./billingService";
import { WebhookHandlers } from "./webhookHandlers";
import { getStripePublishableKey, getStripeSecretKey } from "./stripeClient";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { updateSessionEmail, requireAuth } from "../middleware/auth";

// CRITICAL: This route MUST be registered BEFORE any body parsing middleware.
// Stripe webhook signature verification requires the raw Buffer body.
// If express.json() runs first, it converts the body to an object and breaks verification.
export function registerBillingWebhookRoute(app: Express) {
  app.post(
    "/api/billing/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"];

      if (!signature) {
        return res.status(400).json({ error: "Missing stripe-signature" });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        // Verify body is Buffer - if not, body parsing middleware ran first (wrong order)
        if (!Buffer.isBuffer(req.body)) {
          console.error(
            "[WEBHOOK] CRITICAL: Body is not a Buffer. Middleware order is wrong.",
          );
          return res.status(500).json({ error: "Webhook processing error" });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error("[WEBHOOK] Error:", error.message);
        res.status(400).json({ error: "Webhook processing error" });
      }
    },
  );
}

export function registerBillingRoutes(app: Express) {
  // POST /api/billing/create-checkout-session
  // SECURITY: userId and email are derived from server-side session, NOT from request body.
  // Client only provides the email for new users (stored in session).
  app.post(
    "/api/billing/create-checkout-session",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const userId = req.auth!.userId;
        const { email } = req.body;

        if (!email || typeof email !== "string" || !email.includes("@")) {
          return res.status(400).json({ error: "Valid email is required" });
        }

        // Store email in session for future requests
        if (req.auth!.sessionToken) {
          await updateSessionEmail(req.auth!.sessionToken, email);
        }

        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
          return res.status(500).json({ error: "Billing not configured" });
        }

        console.log("[CHECKOUT] Creating session:", {
          userId,
          email: email.substring(0, 3) + "***",
        });

        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.headers["x-forwarded-host"] || req.get("host");
        const baseUrl = `${protocol}://${host}`;

        const result = await billingService.createCheckoutSession(
          userId,
          email,
          priceId,
          `${baseUrl}/billing/success`,
          `${baseUrl}/billing/cancel`,
        );

        console.log("[CHECKOUT] Session created for user:", userId);

        res.json(result);
      } catch (error: any) {
        console.error("[CHECKOUT] Error:", error.message);
        res.status(500).json({ error: "Failed to create checkout session" });
      }
    },
  );

  // POST /api/billing/create-portal-session
  // SECURITY: userId is derived from server-side session only.
  app.post(
    "/api/billing/create-portal-session",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const userId = req.auth!.userId;

        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.headers["x-forwarded-host"] || req.get("host");
        const returnUrl = `${protocol}://${host}/`;

        const result = await billingService.createPortalSession(
          userId,
          returnUrl,
        );
        res.json(result);
      } catch (error: any) {
        console.error("[PORTAL] Error:", error.message);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // GET /api/billing/status
  // SECURITY: userId is derived from server-side session only.
  // SECURITY: sync=true removed from this endpoint - use POST /api/billing/sync instead
  app.get("/api/billing/status", async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.json({ status: "free", planName: "Free" });
      }

      const result = await billingService.getBillingStatus(userId);
      res.json(result);
    } catch (error: any) {
      console.error("[BILLING] Status error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/billing/sync
  // Sync subscription status from Stripe
  // SECURITY: requireAuth ensures userId is derived from session, not client input
  app.post(
    "/api/billing/sync",
    requireAuth,
    async (req: Request, res: Response) => {
      console.log("[SYNC] Sync request from user:", req.auth!.userId);
      try {
        const userId = req.auth!.userId;
        const result = await billingService.syncSubscriptionFromStripe(userId);
        res.json(result);
      } catch (error: any) {
        console.error("[BILLING] Sync error:", error.message);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // GET /api/billing/config
  // Public endpoint - returns non-sensitive configuration
  app.get("/api/billing/config", async (req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      const priceId = process.env.STRIPE_PRICE_ID || "";

      res.json({ publishableKey, priceId });
    } catch (error: any) {
      console.error("[BILLING] Config error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/billing/debug
  // SECURITY: Only available in development environment
  const isProduction =
    process.env.REPLIT_DEPLOYMENT === "1" ||
    process.env.NODE_ENV === "production";

  if (!isProduction) {
    app.get("/api/billing/debug", async (req: Request, res: Response) => {
      try {
        const userId = req.auth?.userId;

        let hasStripeKey = false;
        let hasWebhookSecret = false;

        try {
          const secretKey = await getStripeSecretKey();
          hasStripeKey = !!secretKey && secretKey.startsWith("sk_");
        } catch (e) {
          hasStripeKey = false;
        }

        hasWebhookSecret = true;

        const hasPriceId = !!process.env.STRIPE_PRICE_ID;

        let subscriptionStatus = null;
        if (userId) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));
          subscriptionStatus = user?.subscriptionStatus || "not_found";
        }

        res.json({
          hasStripeKey,
          hasWebhookSecret,
          hasPriceId,
          environmentMode: "development",
          currentUserId: userId || null,
          subscriptionStatus,
        });
      } catch (error: any) {
        console.error("[DEBUG] Error:", error.message);
        res.status(500).json({ error: error.message });
      }
    });
  }
}
