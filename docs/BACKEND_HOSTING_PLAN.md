# Backend Hosting Plan

**Purpose**: Backend hosting strategy for Noor CBT mobile app  
**Last Updated**: 2026-01-19  
**Owner**: Platform Architecture

---

## Overview

Noor CBT is a **mobile-first app** that requires a backend API server for AI processing and safety validation. The mobile apps (iOS/Android) connect to this backend via HTTPS API calls.

**Architecture**: Mobile client → Backend API → OpenAI + PostgreSQL

---

## Backend Responsibilities (Already in Repo)

### Core API Endpoints

Located in `server/routes.ts`:

**1. Thought Analysis** (`POST /api/analyze`)
- Accepts user thought text
- Runs through canonical orchestrator
- Detects cognitive distortions
- Checks for crisis/scrupulosity
- Returns analysis + safety flags

**2. Reframe Generation** (`POST /api/reframe`)
- Generates Islamic-grounded alternative perspectives
- Uses safety-validated AI responses
- Returns reframe suggestions

**3. Practice Guidance** (`POST /api/practice`)
- Generates grounding practices (dua, dhikr)
- Context-aware Islamic content
- Safety-validated responses

**4. Reflection Completion** (`POST /api/complete`)
- Summarizes CBT journey
- Generates insights
- Returns completion summary

**5. General Chat** (`POST /api/chat/general`)
- Conversational AI for user questions
- Safety-gated responses
- Charter-compliant output

**6. History Retrieval** (`GET /api/reflection/history`)
- Returns user's past reflections
- Server-side storage of session metadata
- Privacy-compliant queries

**7. Billing Webhooks** (`POST /api/billing/webhook`)
- Stripe webhooks for web (not mobile IAP)
- Subscription status updates
- Server-side validation

### Services and Middleware

Located in `server/`:

- **Canonical Orchestrator** (`canonical-orchestrator.ts`): Multi-layer AI safety
- **AI Safety Charter** (`ai-safety.ts`): 8-part safety framework
- **Safety Telemetry** (`safety-telemetry.ts`): Monitoring and logging
- **Encryption Service** (`encryption.ts`): AES-256-GCM for PII
- **Data Retention** (`data-retention.ts`): 30-day retention policy
- **Islamic Content Mapper** (`islamic-content-mapper.ts`): Context-aware Quran/hadith
- **Auth Middleware** (`middleware/auth.ts`): Optional auth (currently not used)

### Database Schema

Located in `shared/schema.ts`:

- **users**: Hashed IDs, metadata (no PII)
- **reflections**: Encrypted thought data
- **sessions**: Session tracking
- **conversations**: AI chat history
- **assumptionLibrary**: User's identified patterns

**Database**: PostgreSQL (via Drizzle ORM)

---

## Required Environment Variables

### Production Backend

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# AI Service
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Server
PORT=5000
NODE_ENV=production

# Stripe (web only, not mobile)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### Mobile Client

```bash
# Only public config (no secrets!)
EXPO_PUBLIC_DOMAIN=api.yourdomain.com
```

---

## Hosting Options and Rationale

### Option A: Replit (Easiest)

**Pros:**
- Zero config, auto-deploy from GitHub
- Built-in PostgreSQL database
- HTTPS/SSL included
- Free tier available (slow but functional)
- Perfect for MVP/alpha testing

**Cons:**
- Slower performance (cold starts)
- Limited scaling
- Shared infrastructure
- Not ideal for production scale

**Cost:** Free tier or $7/month (Hacker plan)

**Recommendation:** Best for alpha/internal testing

---

### Option B: Railway (Modern PaaS)

**Pros:**
- Git-based deployment
- Managed PostgreSQL included
- Automatic HTTPS/SSL
- Fair pricing ($5/month + usage)
- Good performance
- Easy scaling

**Cons:**
- Costs scale with usage
- Newer platform (less mature than Heroku)

**Cost:** ~$15-50/month (server + database)

**Recommendation:** **Best for production MVP** (100-10K users)

---

### Option C: Heroku (Established PaaS)

**Pros:**
- Well-documented, mature platform
- Managed PostgreSQL (add-on)
- Auto SSL certificates
- Easy deployment (git push)
- Good ecosystem

**Cons:**
- More expensive than Railway
- Slower cold starts (free tier)
- No free tier for production

**Cost:** ~$25-100/month (Eco dyno + Postgres)

**Recommendation:** Good for production, higher cost

---

### Option D: Render (Modern Alternative)

**Pros:**
- Similar to Railway/Heroku
- Competitive pricing
- Managed PostgreSQL
- Free tier for testing
- Good documentation

**Cons:**
- Cold starts on free tier
- Less ecosystem than Heroku

**Cost:** ~$20-60/month

**Recommendation:** Solid alternative to Railway

---

### Option E: Cloud Providers (AWS/GCP/Azure)

**Pros:**
- Maximum scalability
- Fine-grained control
- Best performance
- Enterprise features

**Cons:**
- Complex setup (Docker, ECS/Cloud Run, load balancers)
- Requires DevOps expertise
- Higher base cost
- More maintenance

**Cost:** ~$50-200/month (container service + RDS/Cloud SQL)

**Recommendation:** Only if you have DevOps team or expecting 50K+ users

---

### Option F: Fly.io (Developer-Friendly)

**Pros:**
- Global edge deployment
- Fast cold starts
- PostgreSQL included
- Good pricing
- Developer-focused

**Cons:**
- Smaller community
- Less mature than Heroku

**Cost:** ~$15-40/month

**Recommendation:** Great Railway alternative

---

## Suggested Baseline Architecture

### For MVP Launch (1K-10K users)

**Single App Server + Managed Database**

```
┌─────────────┐
│  iOS App    │──┐
└─────────────┘  │
                 │ HTTPS
┌─────────────┐  │    ┌──────────────────┐
│ Android App │──┼────▶│   App Server    │
└─────────────┘  │    │   (Node.js)      │
                 │    │  - Express API   │
┌─────────────┐  │    │  - Safety Layer  │
│  TestFlight │──┘    │  - Orchestrator  │
│  / Internal │       └──────────────────┘
└─────────────┘              │
                             │
                    ┌────────┴────────┐
                    │                 │
             ┌──────▼─────┐   ┌──────▼──────┐
             │ PostgreSQL │   │   OpenAI    │
             │  Database  │   │     API     │
             └────────────┘   └─────────────┘
```

**Specifications:**
- **App Server**: 1 instance, 512MB RAM minimum
- **Database**: Managed PostgreSQL, 1GB storage minimum
- **SSL/TLS**: Automatic via platform
- **Scaling**: Vertical (increase instance size) as needed

**This handles:**
- 1,000-10,000 users
- ~10-100 requests/minute
- 99%+ uptime with managed platforms

---

## Rate Limiting and Abuse Protection

### API Rate Limits

**Implement in `server/index.ts`:**

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min per IP
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// AI endpoint rate limit (more strict)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI calls per minute per IP
  message: 'AI rate limit exceeded',
});

app.use('/api/analyze', aiLimiter);
app.use('/api/reframe', aiLimiter);
app.use('/api/practice', aiLimiter);
```

### Abuse Protection Strategies

**1. IP-Based Rate Limiting** (above)
- Prevents single user from overwhelming API
- 100 requests per 15 minutes for general API
- 10 AI calls per minute (expensive)

**2. User-Based Rate Limiting** (future)
- Track by hashed user ID
- Free tier: 1 reflection/day
- Plus: Unlimited reflections
- Prevents abuse across IPs

**3. Input Validation**
```typescript
// Limit thought length
const MAX_THOUGHT_LENGTH = 2000; // characters

if (thought.length > MAX_THOUGHT_LENGTH) {
  return res.status(400).json({ 
    error: 'Thought too long (max 2000 characters)' 
  });
}
```

**4. OpenAI Token Limits**
- Monitor token usage
- Set max_tokens per request
- Alert on unusual spikes

**5. Database Query Limits**
```typescript
// Limit history queries
app.get('/api/reflection/history', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  // Never return more than 100 reflections
});
```

---

## Privacy Constraints

### Data Storage Requirements

**What Must Stay Local (Mobile Device Only):**
- User reflection content (stored via AsyncStorage)
- Personal thought entries
- Emotional ratings
- Reflection history (unless Premium export)

**What Can Be on Server:**
- Session metadata (duration, count, anonymized)
- Safety events (crisis detections, no content)
- Subscription status
- Hashed user IDs (no PII)
- Audit logs (orchestration decisions, no content)

### Compliance Checklist

- [ ] No plaintext reflection storage on server
- [ ] Encrypt PII at rest (AES-256-GCM)
- [ ] Encrypt data in transit (HTTPS/TLS)
- [ ] Hash user identifiers
- [ ] 30-day data retention enforced
- [ ] No cross-user data sharing
- [ ] No behavioral tracking/profiling
- [ ] No data sale to third parties

### OpenAI Data Processing

**Privacy Notes:**
- Reflection text sent to OpenAI for AI processing
- Not stored long-term by us or OpenAI
- Not used to train AI models (per DPA)
- Disclosed in Privacy Policy
- User consent via onboarding

---

## Environment URL Placeholders

### Development
```
API_URL=http://localhost:5000
DATABASE_URL=postgresql://localhost:5432/noor_dev
```

### Staging (Optional)
```
API_URL=https://noor-cbt-staging.railway.app
DATABASE_URL=postgresql://staging-db...
```

### Production
```
API_URL=https://api.noorcbt.com
DATABASE_URL=postgresql://prod-db...
```

**Mobile Client Config:**
```bash
# Development
EXPO_PUBLIC_DOMAIN=localhost:5000

# Staging
EXPO_PUBLIC_DOMAIN=noor-cbt-staging.railway.app

# Production
EXPO_PUBLIC_DOMAIN=api.noorcbt.com
```

---

## Migration Plan: Local → Hosted

### Phase 1: Pre-Deployment Preparation

**Week 1: Platform Selection**
- [ ] Choose hosting platform (Railway recommended)
- [ ] Create account
- [ ] Set up billing

**Week 2: Database Setup**
- [ ] Provision PostgreSQL database
- [ ] Run migrations: `npx drizzle-kit push:pg`
- [ ] Verify schema creation
- [ ] Test database connectivity

**Week 3: Environment Configuration**
- [ ] Set all environment variables
- [ ] Configure OpenAI API key (production tier)
- [ ] Set up Stripe keys (if web billing needed)
- [ ] Configure monitoring (Sentry DSN)

**Week 4: SSL/Domain Setup**
- [ ] Purchase domain (noorcbt.com)
- [ ] Configure DNS records
- [ ] Enable SSL certificate
- [ ] Verify HTTPS works

---

### Phase 2: Initial Deployment

**Deploy Backend:**
```bash
# 1. Link repository to platform
railway link
# or
git remote add heroku https://git.heroku.com/noor-cbt-api.git

# 2. Deploy
git push railway main
# or
git push heroku main

# 3. Verify health check
curl https://your-app.railway.app/health
```

**Run Database Migrations:**
```bash
# Railway
railway run npx drizzle-kit push:pg

# Heroku
heroku run npx drizzle-kit push:pg
```

**Smoke Test:**
```bash
# Test analyze endpoint
curl -X POST https://your-api-url.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"thought": "I am worried about the future"}'

# Expected: JSON with distortions array
```

---

### Phase 3: Mobile App Configuration

**Update Mobile App:**

**1. Update API domain in eas.json:**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_DOMAIN": "api.noorcbt.com"
      }
    }
  }
}
```

**2. Rebuild mobile apps:**
```bash
# iOS
npx eas build --profile production --platform ios

# Android
npx eas build --profile production --platform android
```

**3. Internal Testing:**
- Deploy to TestFlight (iOS) / Play Internal (Android)
- Test with real hosted backend
- Verify API calls work
- Check HTTPS certificate

---

### Phase 4: Monitoring Setup

**Install Error Tracking:**
```bash
npm install @sentry/node
```

**Configure in `server/index.ts`:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Set Up Uptime Monitoring:**
- Add API URL to UptimeRobot
- Configure alerts to email/Slack
- Set check interval: 1 minute

---

### Phase 5: Go-Live Checklist

- [ ] Backend deployed and stable for 1 week
- [ ] All smoke tests passing
- [ ] Error rate < 1%
- [ ] Uptime > 99% for staging period
- [ ] Database backups configured
- [ ] Monitoring dashboards set up
- [ ] Legal documents finalized
- [ ] App Store metadata submitted
- [ ] Screenshots captured
- [ ] Pricing tiers configured (Apple IAP / Google Play)

---

## Rollback Plan

**If deployment fails:**

```bash
# 1. Revert to last known good commit
git revert HEAD
git push railway main

# 2. Or rollback via platform UI
# Railway: Deployments → Select previous deployment → Redeploy
# Heroku: heroku rollback v123
```

**If database migration fails:**
- Restore from backup
- Fix migration script
- Test on staging first
- Redeploy

---

## Performance Targets

**API Response Times:**
- Health check: < 100ms
- Analyze endpoint: < 5s (P95)
- Reframe endpoint: < 5s (P95)
- History retrieval: < 500ms (P95)

**Uptime Target:**
- 99.9% uptime (8.76 hours downtime/year)
- Monthly target: < 45 minutes downtime

**Scalability:**
- Start: 1K users, 1 server
- Scale: 10K users, still 1 server (vertical scaling)
- Scale: 50K+ users, add horizontal scaling (load balancer + multiple servers)

---

## Cost Estimates

### MVP Phase (1K users)
- **Railway/Render**: $15-25/month
- **OpenAI**: $50-200/month (depends on usage)
- **Monitoring**: $0-50/month (free tiers available)
- **Domain**: $15/year
- **Total**: ~$100-300/month

### Growth Phase (10K users)
- **Hosting**: $50-100/month
- **OpenAI**: $500-1K/month
- **Monitoring**: $100-200/month
- **Database**: Included in hosting
- **Total**: ~$650-1,300/month

### Scale Phase (50K+ users)
- **Hosting**: $200-500/month (multiple servers)
- **OpenAI**: $2K-5K/month
- **Monitoring**: $300-500/month
- **CDN**: $50-100/month
- **Total**: ~$2,500-6,000/month

---

## Recommended: Start with Railway

**Why Railway for MVP:**
1. ✅ Simple Git-based deployment
2. ✅ Managed PostgreSQL included
3. ✅ Automatic HTTPS/SSL
4. ✅ Fair pricing ($15-30/month to start)
5. ✅ Easy to migrate away later if needed
6. ✅ Good documentation and support
7. ✅ Environment variable management built-in

**Next Steps:**
1. Create Railway account
2. Connect GitHub repo
3. Add PostgreSQL service
4. Set environment variables
5. Deploy and test

---

**Last Updated**: 2026-01-19  
**Next Review**: Before production deployment
