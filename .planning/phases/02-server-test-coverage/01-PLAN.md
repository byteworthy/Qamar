---
phase: 02-server-test-coverage
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - server/__tests__/routes.test.ts
  - server/routes.ts
autonomous: true

must_haves:
  truths:
    - "All API endpoints in routes.ts have unit tests"
    - "Tests cover happy paths and error cases for each endpoint"
    - "Authentication middleware is tested for protected routes"
    - "Test coverage for routes.ts reaches >80%"
  artifacts:
    - path: "server/__tests__/routes.test.ts"
      provides: "Comprehensive unit tests for API routes"
      contains: "describe.*routes"
    - path: "server/__tests__/routes.test.ts"
      provides: "Tests for authentication behavior"
      contains: "requireAuth"
    - path: "server/__tests__/routes.test.ts"
      provides: "Tests for error handling"
      contains: "expect.*status.*[45][0-9]{2}"
  key_links:
    - from: "server/__tests__/routes.test.ts"
      to: "server/routes.ts"
      via: "test suite covers all endpoints"
      pattern: "app\\.(get|post|put|delete)"
    - from: "test cases"
      to: "API endpoints"
      via: "request/response validation"
      pattern: "supertest.*request"
---

<objective>
Add comprehensive unit tests for server/routes.ts to achieve >80% coverage of all API endpoints.

Purpose: Establish test safety net for the primary API layer, covering authentication, input validation, error handling, and business logic for all endpoints.

Output: Complete test suite for routes.ts with tests for all 20+ API endpoints including /api/user, /api/reflections, /api/analyze, /api/reframe, /api/practice, and billing routes.
</objective>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@server/routes.ts
@server/__tests__/e2e-journey.test.ts
@server/__tests__/safety-system.test.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create routes test file with test infrastructure</name>
  <files>server/__tests__/routes.test.ts</files>
  <action>
Create `server/__tests__/routes.test.ts` with the following test infrastructure:

```typescript
import request from "supertest";
import express from "express";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { storage } from "../storage";
import { setupRoutes } from "../routes";

describe("API Routes", () => {
  let app: express.Express;
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    // Initialize test app
    app = express();
    app.use(express.json());
    await setupRoutes(app);

    // Create test user
    const user = await storage.users.create({
      email: "test@example.com",
      stripeCustomerId: "test_customer",
      subscriptionStatus: "trialing",
    });
    testUserId = user.id;

    // Get auth token (mock or real based on auth setup)
    authToken = "test_token_" + testUserId;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await storage.users.delete(testUserId);
    }
  });

  beforeEach(async () => {
    // Clear any test data between tests
  });

  describe("Health check endpoints", () => {
    it("should return 200 for GET /api/health", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
    });
  });

  describe("Authentication", () => {
    it("should reject requests without auth token", async () => {
      const res = await request(app)
        .get("/api/user")
        .expect(401);

      expect(res.body).toHaveProperty("error");
    });

    it("should accept requests with valid auth token", async () => {
      const res = await request(app)
        .get("/api/user")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("id");
    });
  });

  // Additional test groups will be added in subsequent tasks
});
```

This sets up the basic test infrastructure with proper setup/teardown and authentication handling.
  </action>
  <verify>
- File created: server/__tests__/routes.test.ts
- TypeScript compilation passes: `npx tsc --noEmit`
- Tests run successfully: `npm test routes.test.ts`
  </verify>
  <done>Test infrastructure created with health check and auth tests passing</done>
</task>

<task type="auto">
  <name>Task 2: Add tests for user management endpoints</name>
  <files>server/__tests__/routes.test.ts</files>
  <action>
Add test suite for user management endpoints to `server/__tests__/routes.test.ts`:

```typescript
describe("User Management", () => {
  describe("GET /api/user", () => {
    it("should return user profile for authenticated user", async () => {
      const res = await request(app)
        .get("/api/user")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: testUserId,
        email: "test@example.com",
        subscriptionStatus: expect.any(String),
      });
    });
  });

  describe("POST /api/user/settings", () => {
    it("should update user settings", async () => {
      const settings = {
        notifications: { enabled: true },
        theme: "dark",
      };

      const res = await request(app)
        .post("/api/user/settings")
        .set("Authorization", `Bearer ${authToken}`)
        .send(settings)
        .expect(200);

      expect(res.body).toMatchObject({ success: true });
    });

    it("should reject invalid settings", async () => {
      const res = await request(app)
        .post("/api/user/settings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ invalid: "data" })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/user", () => {
    it("should delete user account", async () => {
      // Create temporary user for deletion test
      const tempUser = await storage.users.create({
        email: "delete@example.com",
        stripeCustomerId: "temp_customer",
      });
      const tempToken = "test_token_" + tempUser.id;

      const res = await request(app)
        .delete("/api/user")
        .set("Authorization", `Bearer ${tempToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ success: true });
    });
  });
});
```
  </action>
  <verify>
- Tests added for GET /api/user
- Tests added for POST /api/user/settings
- Tests added for DELETE /api/user
- All tests pass: `npm test routes.test.ts`
  </verify>
  <done>User management endpoints fully tested</done>
</task>

<task type="auto">
  <name>Task 3: Add tests for reflection endpoints</name>
  <files>server/__tests__/routes.test.ts</files>
  <action>
Add test suite for reflection CRUD endpoints:

```typescript
describe("Reflections", () => {
  let testReflectionId: string;

  describe("POST /api/reflections", () => {
    it("should create new reflection with encrypted data", async () => {
      const reflection = {
        thought: "Test distorted thought",
        reframe: "Test balanced perspective",
        intention: "Test action step",
        emotionalState: "anxious",
        distortions: ["catastrophizing"],
      };

      const res = await request(app)
        .post("/api/reflections")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reflection)
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        userId: testUserId,
        emotionalState: "anxious",
      });

      testReflectionId = res.body.id;
    });

    it("should reject reflection without required fields", async () => {
      const res = await request(app)
        .post("/api/reflections")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ thought: "Only thought" })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should handle encryption errors gracefully", async () => {
      // Test with extremely long input that might cause encryption issues
      const longText = "a".repeat(100000);

      const res = await request(app)
        .post("/api/reflections")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          thought: longText,
          reframe: "Normal text",
        });

      expect([400, 500]).toContain(res.status);
    });
  });

  describe("GET /api/reflections", () => {
    it("should return user reflections with decrypted data", async () => {
      const res = await request(app)
        .get("/api/reflections")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toMatchObject({
          id: expect.any(String),
          thought: expect.any(String),
          reframe: expect.any(String),
        });
      }
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/reflections?limit=5&offset=0")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /api/reflections/:id", () => {
    it("should return specific reflection", async () => {
      if (!testReflectionId) {
        // Skip if no test reflection exists
        return;
      }

      const res = await request(app)
        .get(`/api/reflections/${testReflectionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: testReflectionId,
        userId: testUserId,
      });
    });

    it("should return 404 for non-existent reflection", async () => {
      const res = await request(app)
        .get("/api/reflections/nonexistent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(res.body).toHaveProperty("error");
    });

    it("should prevent access to other user reflections", async () => {
      // Create another user and reflection
      const otherUser = await storage.users.create({
        email: "other@example.com",
        stripeCustomerId: "other_customer",
      });
      const otherReflection = await storage.reflections.create({
        userId: otherUser.id,
        thought: "encrypted",
        reframe: "encrypted",
      });

      const res = await request(app)
        .get(`/api/reflections/${otherReflection.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      expect(res.body).toHaveProperty("error");

      // Cleanup
      await storage.reflections.delete(otherReflection.id);
      await storage.users.delete(otherUser.id);
    });
  });

  describe("DELETE /api/reflections/:id", () => {
    it("should delete user reflection", async () => {
      if (!testReflectionId) {
        return;
      }

      const res = await request(app)
        .delete(`/api/reflections/${testReflectionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ success: true });
    });
  });
});
```
  </action>
  <verify>
- Tests cover POST /api/reflections (happy path, validation, encryption errors)
- Tests cover GET /api/reflections (list with pagination)
- Tests cover GET /api/reflections/:id (single, 404, authorization)
- Tests cover DELETE /api/reflections/:id
- All tests pass: `npm test routes.test.ts`
  </verify>
  <done>Reflection endpoints fully tested with encryption and authorization</done>
</task>

<task type="auto">
  <name>Task 4: Add tests for AI endpoints</name>
  <files>server/__tests__/routes.test.ts</files>
  <action>
Add test suite for AI-powered endpoints (/api/analyze, /api/reframe, /api/practice):

```typescript
describe("AI Endpoints", () => {
  describe("POST /api/analyze", () => {
    it("should analyze user thought and return insights", async () => {
      const res = await request(app)
        .post("/api/analyze")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          thought: "I always mess everything up",
          context: "Work presentation",
        })
        .expect(200);

      expect(res.body).toMatchObject({
        emotionalState: expect.any(String),
        distortions: expect.any(Array),
        toneAnalysis: expect.any(Object),
      });
    });

    it("should handle rate limiting", async () => {
      // Make multiple rapid requests to trigger rate limit
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post("/api/analyze")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ thought: "test thought" })
      );

      const results = await Promise.all(requests);
      const rateLimited = results.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });

    it("should reject empty or invalid input", async () => {
      const res = await request(app)
        .post("/api/analyze")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ thought: "" })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should detect crisis language", async () => {
      const res = await request(app)
        .post("/api/analyze")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          thought: "I want to hurt myself",
        })
        .expect(200);

      expect(res.body).toHaveProperty("crisisDetected", true);
      expect(res.body).toHaveProperty("resources");
    });
  });

  describe("POST /api/reframe", () => {
    it("should generate balanced perspective", async () => {
      const res = await request(app)
        .post("/api/reframe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          thought: "Everyone thinks I'm terrible",
          analysis: {
            emotionalState: "anxious",
            distortions: ["mind-reading"],
          },
        })
        .expect(200);

      expect(res.body).toMatchObject({
        reframe: expect.any(String),
        islamicPerspective: expect.any(Object),
      });
      expect(res.body.reframe.length).toBeGreaterThan(10);
    });

    it("should handle validation mode gracefully", async () => {
      // Test still passes even if VALIDATION_MODE is true
      const res = await request(app)
        .post("/api/reframe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          thought: "test",
          analysis: { emotionalState: "neutral" },
        });

      expect([200, 503]).toContain(res.status);
    });
  });

  describe("POST /api/practice", () => {
    it("should generate calming practice", async () => {
      const res = await request(app)
        .post("/api/practice")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          emotionalState: "anxious",
          intensity: "high",
        })
        .expect(200);

      expect(res.body).toMatchObject({
        practice: expect.any(Object),
        duration: expect.any(Number),
      });
    });
  });

  describe("POST /api/insights/summary", () => {
    it("should generate insight summary", async () => {
      const res = await request(app)
        .post("/api/insights/summary")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          reflectionIds: [testReflectionId],
        })
        .expect(200);

      expect(res.body).toMatchObject({
        summary: expect.any(String),
        patterns: expect.any(Array),
      });
    });
  });
});
```
  </action>
  <verify>
- Tests cover POST /api/analyze (analysis, rate limiting, validation, crisis detection)
- Tests cover POST /api/reframe (reframe generation, validation mode)
- Tests cover POST /api/practice (practice generation)
- Tests cover POST /api/insights/summary
- All tests pass: `npm test routes.test.ts`
  </verify>
  <done>AI endpoints tested for happy paths, error cases, and safety features</done>
</task>

<task type="auto">
  <name>Task 5: Run tests and verify coverage</name>
  <files>server/__tests__/routes.test.ts</files>
  <action>
1. Run the complete test suite:
   ```bash
   npm test routes.test.ts
   ```

2. Generate coverage report for routes.ts:
   ```bash
   npm test -- --coverage --collectCoverageFrom="server/routes.ts"
   ```

3. Verify coverage meets target:
   - Lines: >80%
   - Branches: >70%
   - Functions: >80%

4. Document any untested edge cases or areas that need additional coverage in the test file comments.

5. Ensure all tests pass and TypeScript compilation succeeds:
   ```bash
   npx tsc --noEmit
   npm test
   ```
  </action>
  <verify>
- Coverage report generated successfully
- routes.ts coverage >80% for lines and functions
- All tests pass (existing + new)
- No TypeScript errors
  </verify>
  <done>routes.ts test coverage exceeds 80% with all tests passing</done>
</task>

</tasks>

<verification>
1. Read `server/__tests__/routes.test.ts` and confirm all endpoint groups covered
2. Run `npm test routes.test.ts` - all tests pass
3. Run coverage report - verify >80% coverage for routes.ts
4. Confirm tests cover: authentication, input validation, encryption, error handling, rate limiting, crisis detection
5. No TypeScript compilation errors
</verification>

<success_criteria>
1. Complete test suite for server/routes.ts created
2. All major endpoint groups tested: health, user, reflections, AI (analyze/reframe/practice)
3. Tests cover happy paths, error cases, validation, authentication, and authorization
4. Test coverage for routes.ts >80% (lines and functions)
5. Rate limiting behavior tested
6. Crisis detection tested
7. Encryption error handling tested
8. All tests pass alongside existing test suite (79 tests → ~120+ tests)
9. TypeScript compilation passes
10. Code committed with clear commit message referencing TEST-01
</success_criteria>

<output>
After completion, create `.planning/phases/02-server-test-coverage/01-SUMMARY.md`
</output>
