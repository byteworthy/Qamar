---
phase: 02-server-test-coverage
plan: 04
type: execute
wave: 1
depends_on: []
files_modified:
  - server/__tests__/billing-webhooks.test.ts
  - server/billing/index.ts
autonomous: true

must_haves:
  truths:
    - "Stripe webhook handlers have integration tests"
    - "All webhook event types are tested"
    - "Tests verify signature validation"
    - "Tests verify subscription lifecycle updates"
    - "Billing webhook tests achieve >70% coverage"
  artifacts:
    - path: "server/__tests__/billing-webhooks.test.ts"
      provides: "Integration tests for Stripe webhooks"
      contains: "describe.*webhook"
    - path: "server/__tests__/billing-webhooks.test.ts"
      provides: "Tests for subscription events"
      contains: "customer\\.subscription"
  key_links:
    - from: "test suite"
      to: "server/billing/index.ts"
      via: "webhook event handlers"
      pattern: "stripe\\.webhooks\\.constructEvent"
---

<objective>
Add integration tests for Stripe billing webhooks to ensure reliable payment processing.

Purpose: Verify webhook signature validation, event handling, and subscription lifecycle management work correctly.

Output: Complete integration test suite for billing webhooks covering TEST-08 requirement with >70% coverage.
</objective>

<context>
@.planning/ROADMAP.md
@server/billing/index.ts
@server/__tests__/e2e-journey.test.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create billing webhook test infrastructure</name>
  <files>server/__tests__/billing-webhooks.test.ts</files>
  <action>
Create `server/__tests__/billing-webhooks.test.ts` with test infrastructure:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import Stripe from "stripe";
import { setupBillingWebhooks } from "../billing/index";
import { storage } from "../storage";

describe("Billing Webhooks", () => {
  let app: express.Express;
  let stripe: Stripe;
  let testCustomerId: string;
  let webhookSecret: string;

  beforeAll(async () => {
    // Initialize test app
    app = express();
    app.use(express.raw({ type: "application/json" }));

    // Initialize Stripe with test key
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || "sk_test_mock", {
      apiVersion: "2024-12-18.acacia",
    });

    // Setup webhook endpoint
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || "whsec_test_secret";
    await setupBillingWebhooks(app, webhookSecret);

    // Create test customer
    const customer = await stripe.customers.create({
      email: "webhook-test@example.com",
      metadata: { test: "true" },
    });
    testCustomerId = customer.id;
  });

  afterAll(async () => {
    // Cleanup test customer
    if (testCustomerId) {
      await stripe.customers.del(testCustomerId);
    }
  });

  beforeEach(async () => {
    // Clear any test data between tests
  });

  describe("Webhook signature validation", () => {
    it("should reject requests without stripe-signature header", async () => {
      const res = await request(app)
        .post("/api/webhooks/stripe")
        .send({ type: "customer.created" })
        .expect(400);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("signature");
    });

    it("should reject requests with invalid signature", async () => {
      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", "invalid_signature")
        .send({ type: "customer.created" })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should accept requests with valid signature", async () => {
      const payload = JSON.stringify({
        id: "evt_test",
        type: "customer.created",
        data: { object: { id: testCustomerId } },
      });

      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      expect(res.body).toMatchObject({ received: true });
    });
  });

  describe("Subscription lifecycle events", () => {
    it("should handle customer.subscription.created", async () => {
      const subscription = await stripe.subscriptions.create({
        customer: testCustomerId,
        items: [{ price: process.env.STRIPE_PRICE_ID_TEST }],
      });

      const event = {
        id: "evt_sub_created",
        type: "customer.subscription.created",
        data: { object: subscription },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      // Verify user record updated in database
      const user = await storage.users.findByStripeCustomerId(testCustomerId);
      expect(user).toBeDefined();
      expect(user?.subscriptionStatus).toBe("active");
      expect(user?.stripeSubscriptionId).toBe(subscription.id);

      // Cleanup
      await stripe.subscriptions.cancel(subscription.id);
    });

    it("should handle customer.subscription.updated", async () => {
      // Create initial subscription
      const subscription = await stripe.subscriptions.create({
        customer: testCustomerId,
        items: [{ price: process.env.STRIPE_PRICE_ID_TEST }],
      });

      // Update subscription status
      const updatedSub = await stripe.subscriptions.update(subscription.id, {
        metadata: { updated: "true" },
      });

      const event = {
        id: "evt_sub_updated",
        type: "customer.subscription.updated",
        data: { object: updatedSub },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      // Verify database reflects update
      const user = await storage.users.findByStripeCustomerId(testCustomerId);
      expect(user?.subscriptionStatus).toBe("active");

      // Cleanup
      await stripe.subscriptions.cancel(subscription.id);
    });

    it("should handle customer.subscription.deleted", async () => {
      // Create and immediately cancel subscription
      const subscription = await stripe.subscriptions.create({
        customer: testCustomerId,
        items: [{ price: process.env.STRIPE_PRICE_ID_TEST }],
      });

      const canceledSub = await stripe.subscriptions.cancel(subscription.id);

      const event = {
        id: "evt_sub_deleted",
        type: "customer.subscription.deleted",
        data: { object: canceledSub },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      // Verify subscription marked as canceled
      const user = await storage.users.findByStripeCustomerId(testCustomerId);
      expect(user?.subscriptionStatus).toBe("canceled");
    });
  });

  describe("Payment events", () => {
    it("should handle invoice.payment_succeeded", async () => {
      const invoice = await stripe.invoices.create({
        customer: testCustomerId,
        collection_method: "charge_automatically",
      });

      const event = {
        id: "evt_invoice_paid",
        type: "invoice.payment_succeeded",
        data: { object: invoice },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      // Verify payment recorded
      const user = await storage.users.findByStripeCustomerId(testCustomerId);
      expect(user?.lastPaymentDate).toBeDefined();
    });

    it("should handle invoice.payment_failed", async () => {
      const invoice = await stripe.invoices.create({
        customer: testCustomerId,
        collection_method: "charge_automatically",
      });

      const event = {
        id: "evt_invoice_failed",
        type: "invoice.payment_failed",
        data: { object: invoice },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      // Verify payment failure recorded
      const user = await storage.users.findByStripeCustomerId(testCustomerId);
      expect(user?.subscriptionStatus).toBe("past_due");
    });
  });

  describe("Trial period events", () => {
    it("should handle customer.subscription.trial_will_end", async () => {
      // Create subscription with trial
      const trialEnd = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const subscription = await stripe.subscriptions.create({
        customer: testCustomerId,
        items: [{ price: process.env.STRIPE_PRICE_ID_TEST }],
        trial_end: trialEnd,
      });

      const event = {
        id: "evt_trial_ending",
        type: "customer.subscription.trial_will_end",
        data: { object: subscription },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      // Verify user notified of trial ending
      const user = await storage.users.findByStripeCustomerId(testCustomerId);
      expect(user?.trialEndingSoon).toBe(true);

      // Cleanup
      await stripe.subscriptions.cancel(subscription.id);
    });
  });

  describe("Error handling", () => {
    it("should handle unknown event types gracefully", async () => {
      const event = {
        id: "evt_unknown",
        type: "unknown.event.type",
        data: { object: {} },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      expect(res.body).toMatchObject({ received: true });
    });

    it("should handle malformed webhook payloads", async () => {
      const payload = "invalid json{";
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should handle database errors gracefully", async () => {
      // Mock database error
      jest.spyOn(storage.users, "findByStripeCustomerId").mockRejectedValue(
        new Error("Database connection failed")
      );

      const event = {
        id: "evt_db_error",
        type: "customer.subscription.created",
        data: { object: { customer: testCustomerId } },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(500);

      expect(res.body).toHaveProperty("error");

      // Restore mock
      jest.restoreAllMocks();
    });
  });

  describe("Idempotency", () => {
    it("should handle duplicate webhook events", async () => {
      const subscription = await stripe.subscriptions.create({
        customer: testCustomerId,
        items: [{ price: process.env.STRIPE_PRICE_ID_TEST }],
      });

      const event = {
        id: "evt_idempotent",
        type: "customer.subscription.created",
        data: { object: subscription },
      };

      const payload = JSON.stringify(event);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });

      // Send same event twice
      await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);

      expect(res.body).toMatchObject({ received: true });

      // Cleanup
      await stripe.subscriptions.cancel(subscription.id);
    });
  });
});
```
  </action>
  <verify>
- Test file created with webhook infrastructure
- Tests pass: `npm test billing-webhooks.test.ts`
- TypeScript compilation passes
  </verify>
  <done>Billing webhook test infrastructure created with signature validation</done>
</task>

<task type="auto">
  <name>Task 2: Run webhook tests and verify coverage</name>
  <files>server/__tests__/billing-webhooks.test.ts</files>
  <action>
1. Run webhook tests:
   ```bash
   npm test billing-webhooks.test.ts
   ```

2. Generate coverage report:
   ```bash
   npm test -- --coverage --collectCoverageFrom="server/billing/index.ts"
   ```

3. Verify coverage target:
   - server/billing/index.ts: >70% line coverage

4. Run full test suite:
   ```bash
   npm test
   ```

5. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```
  </action>
  <verify>
- Webhook tests pass
- Coverage >70% for billing module
- Full test suite passes
- No TypeScript errors
  </verify>
  <done>Billing webhook tests complete with >70% coverage</done>
</task>

</tasks>

<verification>
1. Confirm billing-webhooks.test.ts created in server/__tests__/
2. Run `npm test billing-webhooks.test.ts` - all webhook tests pass
3. Check coverage report - verify >70% for server/billing/index.ts
4. Verify tests cover: signature validation, subscription lifecycle, payment events, error handling
5. No TypeScript compilation errors
</verification>

<success_criteria>
1. billing-webhooks.test.ts created with comprehensive webhook tests
2. All Stripe webhook event types tested
3. Signature validation tested
4. Subscription lifecycle tested (created, updated, deleted)
5. Payment events tested (succeeded, failed)
6. Trial period events tested
7. Error handling and idempotency tested
8. Billing module achieves >70% test coverage
9. All tests pass alongside existing test suite
10. TypeScript compilation passes
11. Code committed with clear commit message referencing TEST-08
</success_criteria>

<output>
After completion, create `.planning/phases/02-server-test-coverage/04-SUMMARY.md`
</output>
