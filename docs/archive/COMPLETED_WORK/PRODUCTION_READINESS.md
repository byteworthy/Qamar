# Production Readiness Guide

## Required Environment Variables

```bash
# Required for server operation
DATABASE_URL=postgresql://user:password@host:5432/database
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Required for Stripe (if using billing)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Required for Replit deployment (if applicable)
REPLIT_DOMAINS=your-app.repl.co
REPLIT_DEV_DOMAIN=your-app.repl.co

# Optional - defaults to 5000
PORT=5000

# Optional - defaults to development
NODE_ENV=development or production
```

## Run Server Locally

```bash
npm run server:dev
```

**Expected output:**
- Server starts on port 5000
- Data retention service initializes (deletion not implemented)
- Stripe initialization (if DATABASE_URL is set)
- No errors in console

**Common issues:**
- Missing DATABASE_URL: Server will skip Stripe initialization (safe failure)
- Missing AI keys: Server starts but AI endpoints will fail
- Port already in use: Change PORT environment variable

## Run Client Locally

```bash
npm run expo:dev
```

**Expected output:**
- Expo dev server starts
- QR code displayed for mobile scanning
- Web interface available (if applicable)

**Note:** Client expects server running on localhost:5000

## Run TypeScript Type Check

```bash
npm run check:types
```

**Expected output:**
- No type errors
- Clean exit (exit code 0)

**This command must pass before deployment.**

## Run Tests

```bash
npm test
```

**Expected output:**
- All safety system tests pass
- All E2E journey tests pass
- No test failures

**Test coverage:**
- Crisis detection
- Scrupulosity handling
- Charter compliance
- Tone compliance
- Canonical orchestration
- Complete user journeys

## Run Data Retention Job Manually

```bash
curl -X POST http://localhost:5000/api/admin/cleanup
```

**Expected response:**
```json
{"success": true, "message": "Data retention cleanup completed"}
```

**Automatic schedule:** Runs every 24 hours automatically when server starts (deletion implementation pending).

## Verify Orchestrator Enforcement

**Check 1: All AI endpoints use canonical orchestrator**
- `/api/analyze` ✓ (confirmed in routes.ts)
- `/api/reframe` ✓ (confirmed in routes.ts)
- `/api/practice` ✓ (confirmed in routes.ts)
- `/api/insights/summary` ✓ (confirmed in routes.ts)

**Check 2: No direct OpenAI calls in routes**
- Verified: All AI calls wrapped in `CanonicalOrchestrator.orchestrate()`

**Check 3: IslamicContentMapper has no bypasses**
- Verified: No direct content selection in routes

## Preflight Checklist for Internal Testing

### Before Starting Server
- [ ] Environment variables set (at minimum: DATABASE_URL, AI keys)
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript check passes (`npm run check:types`)
- [ ] Tests pass (`npm test`)

### Server Startup Verification
- [ ] Server starts without errors
- [ ] Data retention service initializes
- [ ] No console errors or warnings

### Safety System Verification
- [ ] Crisis detection working (test with crisis-level input)
- [ ] Scrupulosity detection working (test with OCD-pattern input)
- [ ] Charter compliance enforced (tests confirm this)
- [ ] Tone compliance enforced (tests confirm this)

### API Endpoint Verification
- [ ] POST /api/analyze returns structured response
- [ ] POST /api/reframe returns structured response
- [ ] POST /api/practice returns structured response
- [ ] POST /api/reflection/save works (requires auth)
- [ ] GET /api/reflection/history works (requires auth)

### Production Deployment
- [ ] Set NODE_ENV=production
- [ ] Use production API keys
- [ ] Configure production DATABASE_URL
- [ ] Set up Stripe webhook endpoint
- [ ] Verify HTTPS enabled
- [ ] Test crisis flow returns resources (no CBT)
- [ ] Test scrupulosity flow suggests professional help
- [ ] Monitor telemetry for violations

### Known Limitations
- Data retention cleanup runs every 24 hours (manual trigger available)
- Free users: 1 reflection/day, 3 history items
- Paid users: Unlimited reflections, full history
- Tests require Jest (now installed)
