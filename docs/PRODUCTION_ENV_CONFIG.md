# Production Environment Configuration

## Overview

This document defines all environment variables required for production deployment on Railway.

## Current Status

✅ Database configured with Railway internal reference
✅ Health check endpoint operational
⚠️ Production environment variables need configuration

---

## Environment Variables

### Required for Production

#### Application Mode
```bash
VALIDATION_MODE=false
```
**Why:** Disables mock/validation mode, enables real Claude API calls

#### Server Configuration
```bash
PORT=3000
NODE_ENV=production
```
**Why:** Railway auto-assigns PORT, NODE_ENV enables production optimizations

#### Database
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
**Status:** ✅ Already configured
**Why:** Uses Railway's internal PostgreSQL connection

#### Anthropic AI
```bash
ANTHROPIC_API_KEY=<production_key>
```
**Status:** ⚠️ Needs production key
**Why:** Required for CBT reflection analysis

#### Stripe (Payment Processing)
```bash
STRIPE_SECRET_KEY=<production_secret_key>
STRIPE_WEBHOOK_SECRET=<production_webhook_secret>
```
**Status:** ⚠️ Needs production keys
**Why:** Required for subscription management

#### Security
```bash
ENCRYPTION_KEY=<32_byte_hex_string>
SESSION_SECRET=<random_secure_string>
```
**Status:** ⚠️ Needs generation
**Why:** Encrypts sensitive data and signs session tokens

#### CORS/Domain
```bash
EXPO_PUBLIC_DOMAIN=noor-production-9ac5.up.railway.app
```
**Status:** ✅ Correct domain
**Why:** Mobile app connects to this domain

---

## Production Rate Limits

Current configuration (from `server/middleware/ai-rate-limiter.ts`):

```typescript
// General AI endpoints: 10 requests per minute
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

// Insight generation: 3 requests per 5 minutes
export const insightRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
});
```

**Status:** ✅ Production-ready
**Note:** These limits protect against API cost abuse

---

## Setup Instructions

### Step 1: Generate Security Keys

```bash
# Generate ENCRYPTION_KEY (32 bytes = 64 hex chars)
openssl rand -hex 32

# Generate SESSION_SECRET
openssl rand -base64 48
```

### Step 2: Configure Railway Environment Variables

1. Go to: https://railway.app/
2. Navigate to: Noor project → Backend service → Variables tab
3. Add/update these variables:

```
VALIDATION_MODE=false
NODE_ENV=production
ANTHROPIC_API_KEY=<your_production_key>
STRIPE_SECRET_KEY=<your_production_key>
STRIPE_WEBHOOK_SECRET=<your_production_webhook_secret>
ENCRYPTION_KEY=<generated_32_byte_hex>
SESSION_SECRET=<generated_random_string>
```

### Step 3: Verify Configuration

After updating, check health endpoint:
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "ai": true
  },
  "timestamp": "2026-01-26T...",
  "version": "1.0.0",
  "mode": "production"
}
```

---

## Security Checklist

- [ ] VALIDATION_MODE set to `false`
- [ ] Production Anthropic API key configured (not test key)
- [ ] Production Stripe keys configured (not test keys)
- [ ] ENCRYPTION_KEY is 64 hex characters (32 bytes)
- [ ] SESSION_SECRET is long and random
- [ ] All secrets stored in Railway (not in code)
- [ ] `.env` files excluded from git (already in `.gitignore`)
- [ ] Health check returns `"mode": "production"`

---

## Monitoring Integration

After configuring environment variables, set up Sentry for error tracking (see SENTRY_SETUP.md).

---

## Rollback Procedure

If production environment causes issues:

1. Set `VALIDATION_MODE=true` to use mock responses
2. Check Railway logs for errors
3. Verify all required keys are present
4. Ensure keys are production keys (not test/development)
5. Restart service after fixing variables

---

## Related Documentation

- [SENTRY_SETUP.md](./SENTRY_SETUP.md) - Error monitoring configuration
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- [RAILWAY_FIX_GUIDE.md](./RAILWAY_FIX_GUIDE.md) - Railway troubleshooting
