# Noor Backend Production Deployment Guide

**Last Updated:** 2026-02-01
**Recommended Platform:** Railway (easiest) or Vercel

---

## Quick Start: Railway Deployment

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Verify email

### Step 2: Deploy Backend

```bash
# From your backend directory
cd server/

# Initialize Railway project
railway init

# Link to new project
railway link

# Deploy
railway up
```

### Step 3: Add Postgres Database

1. In Railway dashboard, click **+ New**
2. Select **Database → PostgreSQL**
3. Railway will provision database and set `DATABASE_URL` automatically

### Step 4: Configure Environment Variables

In Railway dashboard → Variables tab, add:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
DATABASE_URL=[automatically set by Railway]
NODE_ENV=production

# Sentry (error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SENTRY_ORG=your-org
SENTRY_PROJECT=noor-backend

# RevenueCat (for webhook verification)
REVENUECAT_SECRET_KEY=sk_your_revenuecat_secret_key

# CORS (allow mobile app)
ALLOWED_ORIGINS=https://noor.app,exp://
```

### Step 5: Run Database Migrations

```bash
# Connect to Railway project
railway link

# Run migrations
railway run npm run db:migrate

# Or if using Prisma
railway run npx prisma migrate deploy
```

### Step 6: Verify Deployment

**Health Check:**
```bash
curl https://your-app.up.railway.app/health
# Should return: {"status": "ok", "timestamp": "..."}
```

**Test API:**
```bash
curl https://your-app.up.railway.app/api/v1/reflection/analyze \
  -H "Content-Type: application/json" \
  -d '{"thought": "Test thought"}'
```

### Step 7: Get Production URL

Your production URL will be:
```
https://noor-backend-production.up.railway.app
```

Copy this URL and add to mobile app:
- **File:** `client/.env.production`
- **Variable:** `EXPO_PUBLIC_API_URL=https://your-backend.up.railway.app`

---

## Alternative: Vercel Deployment

### Prerequisites

- Vercel account
- External Postgres database (Neon, Supabase, or Railway Postgres standalone)

### Deploy Steps

```bash
cd server/

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Vercel Dashboard)

Same as Railway, but add DATABASE_URL from external Postgres provider.

---

## Database Setup

### Postgres Schema

Your backend should have migrations that create:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reflections table
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  thought TEXT NOT NULL,
  ai_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table (RevenueCat webhooks)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  revenuecat_customer_id VARCHAR(255) UNIQUE,
  subscription_tier VARCHAR(50),
  status VARCHAR(50),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Run Migrations

```bash
# If using Prisma
railway run npx prisma migrate deploy

# If using custom SQL migrations
railway run node scripts/migrate.js
```

---

## API Endpoints Required

Your backend MUST implement:

### 1. Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "2026-02-01T12:00:00Z" }
```

### 2. Reflection Analysis
```
POST /api/v1/reflection/analyze
Headers: { "Content-Type": "application/json", "Authorization": "Bearer [token]" }
Body: { "thought": "User's thought text" }
Response: {
  "reflection": {
    "distortion": { ... },
    "reframe": { ... },
    "practice": { ... }
  }
}
```

### 3. User Subscription Status
```
GET /api/v1/user/subscription
Headers: { "Authorization": "Bearer [token]" }
Response: {
  "tier": "plus" | "pro" | "free",
  "status": "active" | "expired",
  "expiresAt": "2026-03-01T12:00:00Z"
}
```

### 4. RevenueCat Webhook
```
POST /api/webhooks/revenuecat
Headers: { "X-RevenueCat-Signature": "[signature]" }
Body: { RevenueCat webhook payload }
Response: { "received": true }
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Postgres connection string | `postgresql://user:pass@host:5432/noor` |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key | `sk-ant-...` |
| `NODE_ENV` | Yes | Environment name | `production` |
| `SENTRY_DSN` | Recommended | Sentry error tracking DSN | `https://...@sentry.io/...` |
| `REVENUECAT_SECRET_KEY` | For IAP | RevenueCat secret key (webhook verification) | `sk_...` |
| `ALLOWED_ORIGINS` | Recommended | CORS allowed origins | `https://noor.app,exp://` |
| `JWT_SECRET` | If using auth | Secret for JWT token signing | `random-string-256-bits` |

---

## Monitoring & Maintenance

### 1. Set Up Sentry

```bash
npm install @sentry/node

# In server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 2. Monitor Logs

**Railway:**
```bash
railway logs
```

**Vercel:**
```bash
vercel logs
```

### 3. Database Backups

**Railway:**
- Automatic daily backups (Pro plan)
- Manual backup: Dashboard → Database → Backups

**External Postgres:**
- Neon: Automatic point-in-time recovery
- Supabase: Automatic daily backups

---

## Troubleshooting

### Issue: Health check fails (502/504)

**Solution:**
1. Check Railway logs: `railway logs`
2. Verify environment variables are set
3. Ensure PORT is not hardcoded (Railway sets it dynamically)
4. Check build logs for errors

### Issue: Database connection fails

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check database is running (Railway dashboard)
3. Verify SSL mode if required: `?sslmode=require`
4. Check connection pool limits

### Issue: Anthropic API calls fail

**Solution:**
1. Verify `ANTHROPIC_API_KEY` is correct
2. Check API key has sufficient credits
3. Verify no rate limiting (429 errors)
4. Check Anthropic console for usage/issues

### Issue: CORS errors from mobile app

**Solution:**
1. Add `ALLOWED_ORIGINS=*` temporarily to test
2. For production: `ALLOWED_ORIGINS=exp://,https://noor.app`
3. Verify CORS middleware is configured correctly
4. Check mobile app is using correct API URL

---

## Security Checklist

Before going live:

- [ ] Environment variables secured (not in code)
- [ ] Database credentials rotated after testing
- [ ] HTTPS enforced (Railway/Vercel handle this)
- [ ] CORS properly configured (not `*` in production)
- [ ] Rate limiting enabled (prevent abuse)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Authentication tokens expire (JWT expiration)
- [ ] Sensitive data encrypted in database
- [ ] Sentry error tracking enabled
- [ ] Health check endpoint public (no auth required)

---

## Cost Estimates

### Railway (Recommended)

- **Hobby Plan:** $5/month (1 GB RAM, 1 vCPU)
- **Pro Plan:** $20/month (8 GB RAM, 8 vCPU, backups)
- **Postgres:** $5-10/month (1 GB storage)

**Expected Cost:** ~$15-30/month for moderate usage

### Vercel + Neon Postgres

- **Vercel:** Free tier (sufficient for early stage)
- **Neon Postgres:** Free tier (3 GB storage, 100 compute hours/month)

**Expected Cost:** $0-10/month for early stage

---

## Production Readiness Checklist

Before connecting mobile app:

- [ ] Backend deployed successfully
- [ ] Health check endpoint returns 200 OK
- [ ] Database migrations completed
- [ ] All environment variables configured
- [ ] Anthropic API key valid and funded
- [ ] Sentry error tracking configured
- [ ] CORS allows mobile app origins
- [ ] Rate limiting configured
- [ ] Production URL documented
- [ ] Mobile app configured with production API URL
- [ ] Test API call from mobile app successful
- [ ] RevenueCat webhook endpoint responding (if using IAP)

---

**Next Step:** Update `client/.env.production` with your production backend URL.
