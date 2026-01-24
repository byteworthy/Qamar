# Deployment Runbook

**Purpose**: Step-by-step deployment procedures for Noor  
**Last Updated**: 2026-01-19  
**Owner**: Engineering / DevOps

---

## Environments

### Local Development
- **Purpose**: Engineer workstations, debugging
- **API**: http://localhost:5000
- **Database**: Local PostgreSQL
- **Mobile**: Expo dev server
- **AI**: OpenAI sandbox/dev tier

### Staging/Preview (Optional)
- **Purpose**: Pre-production testing
- **API**: TBD (staging.yourdomain.com)
- **Database**: Staging PostgreSQL (isolated)
- **Mobile**: TestFlight Internal / Play Internal
- **AI**: OpenAI with test quota limits

### Production
- **Purpose**: Public users
- **API**: TBD (api.yourdomain.com)
- **Database**: Production PostgreSQL (backed up)
- **Mobile**: App Store / Play Store
- **AI**: OpenAI production tier

---

## Required Environment Variables

### Server (Backend)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# AI Integration
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Stripe (for web, not mobile IAP)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server Config
PORT=5000
NODE_ENV=production

# Replit (if deploying to Replit)
REPLIT_DOMAINS=your-app.repl.co
REPLIT_DEV_DOMAIN=your-app.repl.co
```

### Mobile Client (Expo)

```bash
# Public config only (prefixed with EXPO_PUBLIC_)
EXPO_PUBLIC_DOMAIN=api.yourdomain.com

# No secrets in client builds!
```

### CI/CD (GitHub Actions)

```bash
# EAS
EXPO_TOKEN=your-eas-token

# Testing
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
AI_INTEGRATIONS_OPENAI_API_KEY=sk-test-key (mock or test tier)
```

---

## Build Steps

### Server Build

```bash
# 1. Install dependencies
npm ci

# 2. Run type check
npm run check:types

# 3. Run tests
npm test

# 4. Build (if needed)
# Note: Node.js/TS runs directly, no build step currently

# 5. Database migrations (production)
npx drizzle-kit push:pg
```

### Mobile Build (iOS)

```bash
# 1. Set environment
export EXPO_PUBLIC_DOMAIN=api.yourdomain.com

# 2. Build for App Store
npx eas build --profile production --platform ios

# 3. Wait for EAS build completion
# Builds on EAS cloud infrastructure

# 4. Submit to App Store (when ready)
npx eas submit --platform ios --latest
```

### Mobile Build (Android)

```bash
# 1. Set environment
export EXPO_PUBLIC_DOMAIN=api.yourdomain.com

# 2. Build for Play Store
npx eas build --profile production --platform android

# 3. Wait for EAS build completion

# 4. Submit to Play Store (when ready)
npx eas submit --platform android --latest
```

---

## Deploy Steps (Platform-Specific Placeholders)

### Option A: Deploy to Replit

```bash
# 1. Push code to GitHub
git push origin main

# 2. Replit auto-deploys from main branch

# 3. Verify deployment
curl https://your-app.repl.co/health

# 4. Check logs in Replit console
```

### Option B: Deploy to Railway

```bash
# 1. Link Railway project
railway link

# 2. Set environment variables
railway variables set DATABASE_URL=...
railway variables set AI_INTEGRATIONS_OPENAI_API_KEY=...

# 3. Deploy
railway up

# 4. Verify
curl https://your-app.up.railway.app/health
```

### Option C: Deploy to Heroku

```bash
# 1. Login
heroku login

# 2. Create app (first time)
heroku create noor-cbt-api

# 3. Set config
heroku config:set DATABASE_URL=...
heroku config:set AI_INTEGRATIONS_OPENAI_API_KEY=...
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main

# 5. Verify
curl https://noor-cbt-api.herokuapp.com/health
```

### Option D: Deploy to AWS/GCP/Azure

```bash
# TBD: Requires containerization (Docker) and cloud-specific setup
# Steps:
# 1. Build Docker image
# 2. Push to container registry
# 3. Deploy to container service (ECS, Cloud Run, App Service)
# 4. Configure load balancer, SSL, domains
# 5. Set secrets via cloud secret manager
```

---

## Rollback Steps

### Server Rollback

**If using Git-based deployment (Replit, Railway, Heroku):**

```bash
# 1. Find last good commit
git log --oneline

# 2. Revert to last good commit
git revert HEAD --no-edit
git push origin main

# OR force push to specific commit (use caution)
git reset --hard <commit-hash>
git push --force origin main

# 3. Verify rollback
curl https://your-api-domain.com/health
```

**If using container deployment:**

```bash
# 1. List previous images
docker images noor-cbt-api

# 2. Tag previous image as latest
docker tag noor-cbt-api:v1.2.3 noor-cbt-api:latest

# 3. Push to registry
docker push noor-cbt-api:latest

# 4. Restart service (triggers redeploy)
kubectl rollout restart deployment/noor-cbt-api
```

### Mobile Rollback

**iOS:**
- App Store does not support rollback
- Option 1: Release emergency hotfix (expedited review)
- Option 2: Remove app temporarily (extreme measure)
- Prevention: Always test thoroughly via TestFlight first

**Android:**
- Google Play does not support automatic rollback
- Option 1: Release emergency hotfix
- Option 2: Halt rollout at partial percentage
- Prevention: Use staged rollout (10% → 50% → 100%)

---

## Smoke Test Checklist

### After Server Deployment

```bash
# Health check
curl https://your-api-domain.com/health
# Expected: 200 OK

# Analyze endpoint
curl -X POST https://your-api-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"thought": "I am worried about the future"}'
# Expected: JSON with distortions array

# Crisis detection
curl -X POST https://your-api-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"thought": "I want to hurt myself"}'
# Expected: JSON with crisis:true and resources

# Database connection
# Check logs for database connection success message
```

### After Mobile Release

**Manual Testing Checklist:**
- [ ] App launches successfully
- [ ] Onboarding shows on first launch
- [ ] Can complete one full reflection (thought → reframe → intention)
- [ ] Crisis resources display correctly
- [ ] Subscription upgrade flow works (test in sandbox)
- [ ] History screen loads reflections
- [ ] Offline mode works (no crashes)
- [ ] App version displays correctly in Profile

**Automated (if available):**
- [ ] Run E2E test suite via Detox or Maestro
- [ ] Check crash reports (< 0.1% crash rate)
- [ ] Verify API calls hitting correct environment

---

## Incident Response Checklist

### Severity Levels

**P0 - Critical (Complete Outage)**
- Examples: App crashes on launch, API completely down
- Response: Immediate (within 15 minutes)
- Action: Rollback immediately

**P1 - High (Major Feature Down)**
- Examples: AI endpoints timing out, subscriptions not working
- Response: Within 1 hour
- Action: Hotfix or rollback

**P2 - Medium (Minor Feature Degraded)**
- Examples: Slow performance, UI glitch
- Response: Within 4 hours
- Action: Schedule fix for next release

**P3 - Low (Cosmetic Issues)**
- Examples: Typos, minor visual issues
- Response: Within 1 week
- Action: Include in regular release

### Incident Response Steps

**1. Detect**
- Monitoring alerts trigger
- User reports via support email
- App store reviews mention issues

**2. Triage**
- Confirm issue is reproducible
- Assess severity (P0-P3)
- Identify affected users (all, subset, specific OS)

**3. Mitigate**
- P0/P1: Rollback immediately
- P2/P3: Apply temporary workaround if possible

**4. Communicate**
- Internal: Post to team Slack/chat
- External (if P0/P1): Post to status page or social media
- App stores: Respond to reviews acknowledging issue

**5. Resolve**
- Fix root cause
- Test thoroughly
- Deploy fix via standard process
- Verify resolution

**6. Post-Mortem**
- Document what happened
- Identify root cause
- List action items to prevent recurrence
- Update runbook with lessons learned

### Common Incident Scenarios

**Scenario: API is down**
```bash
# Quick checks
1. Verify hosting platform is up (check status page)
2. Check database connection (logs or direct query)
3. Check OpenAI API status (status.openai.com)
4. Review recent deployments (was there a deploy in last hour?)
5. Check error logs for stack traces
6. If unclear cause: Rollback immediately
```

**Scenario: Mobile app crashes on launch**
```bash
# Quick checks
1. Check crash reports in App Store Connect / Play Console
2. Identify affected OS version and device types
3. Review code changes in last release
4. Check if API is returning unexpected data
5. If widespread: Halt rollout, release hotfix
6. If isolated: May be device-specific, monitor
```

**Scenario: AI responses are inappropriate**
```bash
# Quick checks
1. Check safety telemetry logs for validation failures
2. Review specific user input and AI output
3. Verify canonical orchestrator is active
4. Check if OpenAI had model updates
5. Temporarily disable affected feature if severe
6. Update safety rules and redeploy
```

**Scenario: Subscriptions not working**
```bash
# Quick checks
1. Verify Apple/Google IAP services are up
2. Check StoreKit/Play Billing integration
3. Review subscription webhook logs
4. Test in sandbox environment
5. Contact Apple/Google support if platform issue
6. If our bug: Deploy fix ASAP (revenue impacting)
```

---

## Deployment Gotchas

### Mobile-Specific

1. **App Store Review Time**: 1-3 days (sometimes longer)
   - Plan ahead for critical fixes
   - Use expedited review only for emergencies

2. **Binary Mismatch**: Ensure app bundle matches what's submitted
   - Always build with `--profile production`
   - Never submit dev builds

3. **Permissions Changed**: Requires new app review
   - Adding permissions mid-release delays approval
   - Only add permissions in planned releases

4. **API Endpoint Changes**: Mobile apps cache old API URL
   - Maintain backward compatibility for at least 2 releases
   - Add new endpoints, don't remove old ones immediately

### Server-Specific

1. **Database Migrations**: Can cause downtime
   - Run migrations during low-traffic hours
   - Test migrations on staging first
   - Have rollback SQL ready

2. **Environment Variables**: Missing env var causes crashes
   - Always verify all required vars are set before deploy
   - Use `.env.example` as checklist

3. **OpenAI Rate Limits**: Sudden traffic spike can hit limits
   - Monitor quota usage
   - Implement rate limiting on our side
   - Have backoff/retry logic

4. **Cold Starts**: First request after deploy may be slow
   - Warm up by hitting endpoints after deploy
   - Expect 5-10 second first response

---

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Type check passing (`npm run check:types`)
- [ ] Code reviewed and approved
- [ ] Database migration plan documented (if applicable)
- [ ] Environment variables verified in target environment
- [ ] Rollback plan documented
- [ ] Monitoring and alerts configured
- [ ] Stakeholders notified of deployment window
- [ ] Smoke test plan prepared

---

## Post-Deployment Checklist

- [ ] Smoke tests completed successfully
- [ ] No error spikes in logs
- [ ] API response times normal
- [ ] Mobile app version showing correctly in store
- [ ] Crash rate below 0.1%
- [ ] User-facing features tested manually
- [ ] Support team notified of changes
- [ ] Deployment documented in changelog

---

## Useful Commands Reference

```bash
# Check server status
curl https://your-api.com/health

# View logs (platform-specific)
heroku logs --tail
railway logs
replit logs

# Database query (Drizzle)
npx drizzle-kit studio

# Run migrations
npx drizzle-kit push:pg

# Test AI endpoint locally
npm run server:dev
# Then in another terminal:
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"thought": "test"}'

# EAS build status
npx eas build:list

# EAS submit to stores
npx eas submit --platform ios --latest
```

---

## Emergency Contacts

- **On-Call Engineer**: [TBD]
- **Product Owner**: [TBD]
- **OpenAI Support**: https://help.openai.com
- **Apple Developer Support**: https://developer.apple.com/contact/
- **Google Play Support**: https://support.google.com/googleplay/android-developer

---

**Last Updated**: 2026-01-19  
**Next Review**: Before first production deployment
