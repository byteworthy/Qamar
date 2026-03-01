/**
 * Billing Integration Tests for Qamar
 *
 * Tests billing stub functionality since Stripe has been archived
 * in favor of Apple IAP / Google Play Billing (client-side).
 *
 * Tests:
 * - Billing service stub functions
 * - Billing API routes
 * - Webhook route registration (no-op)
 * - Stripe sync stub
 *
 * Reference: TEST-08
 */

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import type { Express, Request, Response } from "express";
import {
  billingService,
  registerBillingWebhookRoute,
  registerBillingRoutes,
  getStripeSync,
  type BillingStatus,
  type BillingStatusResult,
} from "../billing";

// =============================================================================
// BILLING SERVICE TESTS
// =============================================================================

describe("Billing Service", () => {
  describe("getBillingStatus", () => {
    test("always returns free tier status", async () => {
      const result = await billingService.getBillingStatus("test-user-123");

      expect(result).toEqual({
        status: "free",
        planName: "Free",
      });
    });

    test("returns free tier for different user IDs", async () => {
      const userIds = ["user-1", "user-2", "user-3"];

      for (const userId of userIds) {
        const result = await billingService.getBillingStatus(userId);

        expect(result.status).toBe("free");
        expect(result.planName).toBe("Free");
      }
    });

    test("result has correct TypeScript types", async () => {
      const result: BillingStatusResult =
        await billingService.getBillingStatus("test-user");

      expect(typeof result.status).toBe("string");
      expect(typeof result.planName).toBe("string");
    });
  });

  describe("isPaidUser", () => {
    test("returns true for active status", () => {
      expect(billingService.isPaidUser("active")).toBe(true);
    });

    test("returns true for past_due status", () => {
      expect(billingService.isPaidUser("past_due")).toBe(true);
    });

    test("returns false for free status", () => {
      expect(billingService.isPaidUser("free")).toBe(false);
    });

    test("returns false for canceled status", () => {
      expect(billingService.isPaidUser("canceled")).toBe(false);
    });

    test("handles all BillingStatus types", () => {
      const statuses: BillingStatus[] = [
        "free",
        "active",
        "past_due",
        "canceled",
      ];

      for (const status of statuses) {
        const result = billingService.isPaidUser(status);
        expect(typeof result).toBe("boolean");
      }
    });
  });
});

// =============================================================================
// BILLING ROUTES TESTS
// =============================================================================

describe("Billing Routes", () => {
  let mockApp: Express;
  let mockRoutes: Map<string, { method: string; handler: Function }>;

  beforeEach(() => {
    // Reset mock routes
    mockRoutes = new Map();

    // Create mock Express app
    mockApp = {
      get: jest.fn((path: string, handler: Function) => {
        mockRoutes.set(path, { method: "GET", handler });
      }),
      post: jest.fn((path: string, handler: Function) => {
        mockRoutes.set(path, { method: "POST", handler });
      }),
    } as unknown as Express;
  });

  test("registers all required routes", () => {
    registerBillingRoutes(mockApp);

    expect(mockRoutes.has("/api/billing/status")).toBe(true);
    expect(mockRoutes.has("/api/billing/config")).toBe(true);
    expect(mockRoutes.has("/api/billing/create-checkout-session")).toBe(true);
    expect(mockRoutes.has("/api/billing/create-portal-session")).toBe(true);
    expect(mockRoutes.has("/api/billing/sync")).toBe(true);
  });

  describe("GET /api/billing/status", () => {
    test("returns free tier status", () => {
      registerBillingRoutes(mockApp);

      const route = mockRoutes.get("/api/billing/status");
      expect(route).toBeDefined();

      const mockReq = {} as Request;
      const mockRes = {
        json: jest.fn(),
      } as unknown as Response;

      route!.handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: "free",
        planName: "Free",
        message: "Subscription managed via App Store / Play Store",
      });
    });
  });

  describe("GET /api/billing/config", () => {
    test("returns IAP provider config", () => {
      registerBillingRoutes(mockApp);

      const route = mockRoutes.get("/api/billing/config");
      expect(route).toBeDefined();

      const mockReq = {} as Request;
      const mockRes = {
        json: jest.fn(),
      } as unknown as Response;

      route!.handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        provider: "iap",
        message: "Use in-app purchases via App Store / Play Store",
      });
    });
  });

  describe("POST /api/billing/create-checkout-session", () => {
    test("returns error indicating Stripe is disabled", () => {
      registerBillingRoutes(mockApp);

      const route = mockRoutes.get("/api/billing/create-checkout-session");
      expect(route).toBeDefined();

      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      route!.handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Stripe checkout disabled",
        message: "Please use in-app purchase in the mobile app",
      });
    });
  });

  describe("POST /api/billing/create-portal-session", () => {
    test("returns error indicating Stripe portal is disabled", () => {
      registerBillingRoutes(mockApp);

      const route = mockRoutes.get("/api/billing/create-portal-session");
      expect(route).toBeDefined();

      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      route!.handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Stripe portal disabled",
        message: "Manage subscriptions in App Store / Play Store settings",
      });
    });
  });

  describe("POST /api/billing/sync", () => {
    test("returns free tier status with IAP message", () => {
      registerBillingRoutes(mockApp);

      const route = mockRoutes.get("/api/billing/sync");
      expect(route).toBeDefined();

      const mockReq = {} as Request;
      const mockRes = {
        json: jest.fn(),
      } as unknown as Response;

      route!.handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: "free",
        planName: "Free",
        message: "IAP sync happens client-side",
      });
    });
  });
});

// =============================================================================
// WEBHOOK TESTS
// =============================================================================

describe("Billing Webhooks", () => {
  test("webhook registration registers RevenueCat endpoint", () => {
    const mockApp = {
      post: jest.fn(),
    } as unknown as Express;

    expect(() => registerBillingWebhookRoute(mockApp)).not.toThrow();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/api/billing/webhook/revenuecat",
      expect.any(Function),
    );
  });

  test("webhook handler acknowledges events when no secret configured", () => {
    const mockApp = {
      post: jest.fn(),
    } as unknown as Express;

    registerBillingWebhookRoute(mockApp);

    // Get the registered handler
    const handler = (mockApp.post as jest.Mock).mock.calls[0][1] as Function;
    const mockReq = {
      body: { event: { type: "INITIAL_PURCHASE" } },
      headers: {},
    } as unknown as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  test("webhook handler processes valid event types", () => {
    const mockApp = {
      post: jest.fn(),
    } as unknown as Express;

    registerBillingWebhookRoute(mockApp);

    const handler = (mockApp.post as jest.Mock).mock.calls[0][1] as Function;
    const eventTypes = [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "CANCELLATION",
      "EXPIRATION",
    ];

    for (const eventType of eventTypes) {
      const mockReq = {
        body: { event: { type: eventType } },
        headers: {},
      } as unknown as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      handler(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    }
  });
});

// =============================================================================
// STRIPE SYNC TESTS
// =============================================================================

describe("Stripe Sync", () => {
  test("returns stub sync object", async () => {
    const sync = await getStripeSync();

    expect(sync).toBeDefined();
    expect(typeof sync.findOrCreateManagedWebhook).toBe("function");
    expect(typeof sync.syncBackfill).toBe("function");
  });

  test("findOrCreateManagedWebhook returns null", async () => {
    const sync = await getStripeSync();
    const result = await sync.findOrCreateManagedWebhook(
      "https://example.com/webhook",
    );

    expect(result).toBeNull();
  });

  test("syncBackfill is a no-op", async () => {
    const sync = await getStripeSync();

    // Should complete without errors (logs via defaultLogger now)
    await expect(sync.syncBackfill()).resolves.toBeUndefined();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("Billing Integration", () => {
  test("complete billing flow returns consistent results", async () => {
    // Get billing status
    const status = await billingService.getBillingStatus("test-user");
    expect(status.status).toBe("free");

    // Check if paid user
    const isPaid = billingService.isPaidUser(status.status);
    expect(isPaid).toBe(false);

    // Verify consistency
    expect(status.planName).toBe("Free");
  });

  test("billing system handles multiple concurrent requests", async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      billingService.getBillingStatus(`user-${i}`),
    );

    const results = await Promise.all(requests);

    expect(results).toHaveLength(10);
    results.forEach((result) => {
      expect(result.status).toBe("free");
      expect(result.planName).toBe("Free");
    });
  });

  test("all routes and services are available", () => {
    const mockApp = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as Express;

    // Should not throw
    expect(() => {
      registerBillingRoutes(mockApp);
      registerBillingWebhookRoute(mockApp);
    }).not.toThrow();

    // Verify routes were registered
    expect(mockApp.get).toHaveBeenCalledTimes(2); // status, config
    expect(mockApp.post).toHaveBeenCalledTimes(4); // checkout, portal, sync + revenuecat webhook
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

describe("Billing Regression Tests", () => {
  test("billing service never returns undefined", async () => {
    const result = await billingService.getBillingStatus("any-user");

    expect(result).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.planName).toBeDefined();
  });

  test("billing routes never throw errors", () => {
    const mockApp = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as Express;

    expect(() => registerBillingRoutes(mockApp)).not.toThrow();
    expect(() => registerBillingWebhookRoute(mockApp)).not.toThrow();
  });

  test("isPaidUser handles all valid status values", () => {
    const validStatuses: BillingStatus[] = [
      "free",
      "active",
      "past_due",
      "canceled",
    ];

    for (const status of validStatuses) {
      expect(() => billingService.isPaidUser(status)).not.toThrow();
    }
  });

  test("Stripe sync stubs never throw", async () => {
    await expect(getStripeSync()).resolves.toBeDefined();

    const sync = await getStripeSync();
    await expect(
      sync.findOrCreateManagedWebhook("https://test.com"),
    ).resolves.toBeDefined();
    await expect(sync.syncBackfill()).resolves.toBeUndefined();
  });
});
