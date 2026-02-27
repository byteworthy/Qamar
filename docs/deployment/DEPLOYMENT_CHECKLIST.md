# Deployment Checklist

## Overview

This checklist ensures safe and successful deployments for both backend and mobile app releases.

---

## Pre-Deployment (Backend)

### Code Quality
- [ ] All tests passing locally (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Linter passing (`npm run lint`)
- [ ] Code reviewed and approved

### Database
- [ ] Migrations tested locally
- [ ] Database backup created (if schema changes)
- [ ] Rollback plan documented

### Environment
- [ ] Production environment variables verified
- [ ] `VALIDATION_MODE=false` for production
- [ ] All API keys are production keys (not test)
- [ ] ENCRYPTION_KEY and SESSION_SECRET are secure

### Security
- [ ] No secrets in code
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Health check endpoint working

### Monitoring
- [ ] Sentry configured and tested
- [ ] Alert rules active
- [ ] Railway health checks enabled
- [ ] Log retention configured

---

## Deployment Steps (Backend)

### 1. Final Verification
```bash
# Run full test suite
npm test

# Check for type errors
npx tsc --noEmit

# Verify environment variables
railway run env | grep -E "VALIDATION_MODE|NODE_ENV|DATABASE_URL"
```

### 2. Create Git Tag
```bash
# Get current version
VERSION=$(node -p "require('./package.json').version")

# Create and push tag
git tag -a "v${VERSION}" -m "Release v${VERSION}"
git push origin "v${VERSION}"
```

### 3. Deploy to Railway
```bash
# Deploy backend
railway up --detach

# Monitor deployment
railway logs --service Qamar
```

### 4. Verify Deployment
```bash
# Check health endpoint
curl https://noor-production-9ac5.up.railway.app/api/health

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": true,
#     "ai": true
#   },
#   "mode": "production"
# }
```

### 5. Create Sentry Release
```bash
# Create release in Sentry
npm run sentry:release
```

### 6. Smoke Test
```bash
# Test critical endpoints
curl -X POST https://noor-production-9ac5.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify response is expected
```

---

## Post-Deployment (Backend)

### Immediate (First 5 minutes)
- [ ] Health check returning 200 OK
- [ ] No error spikes in Sentry
- [ ] Railway logs show successful startup
- [ ] Database queries working

### Short-term (First hour)
- [ ] Monitor error rates in Sentry
- [ ] Check Railway metrics (CPU, memory)
- [ ] Verify API response times
- [ ] Test user-facing features

### Communication
- [ ] Notify team of deployment
- [ ] Update status page (if applicable)
- [ ] Monitor support channels

---

## Pre-Deployment (Mobile App)

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors
- [ ] React Native warnings resolved
- [ ] Code reviewed and approved

### Configuration
- [ ] Version number bumped in `app.json`
- [ ] Build number incremented
- [ ] `EXPO_PUBLIC_DOMAIN` points to production
- [ ] `EXPO_PUBLIC_VALIDATION_MODE=false`

### Assets
- [ ] App icon finalized (1024x1024)
- [ ] Splash screen configured
- [ ] Store screenshots prepared (6 per platform)

### Testing
- [ ] Tested on physical iOS device
- [ ] Tested on physical Android device
- [ ] Tested all critical user flows
- [ ] Tested offline behavior

---

## Deployment Steps (Mobile App)

### iOS Deployment

#### 1. Build for TestFlight
```bash
# Build iOS development build
eas build --profile production --platform ios

# Wait for build to complete (~15-20 min)
# Download IPA when ready
```

#### 2. Submit to TestFlight
```bash
# Submit to App Store Connect
eas submit --platform ios --latest

# Or manually upload via Transporter app
```

#### 3. TestFlight Release
- Go to App Store Connect → TestFlight
- Select build
- Add to internal testing group
- Add external testers (optional)
- Provide what's new in this build

#### 4. Production Release (After TestFlight approval)
- Go to App Store Connect → App Store
- Create new version
- Select build from TestFlight
- Fill out release notes
- Submit for review
- Release manually or automatically after approval

### Android Deployment

#### 1. Build for Production
```bash
# Build Android production bundle
eas build --profile production --platform android

# Wait for build to complete (~15-20 min)
# Download AAB when ready
```

#### 2. Upload to Google Play Console
```bash
# Submit to Google Play
eas submit --platform android --latest

# Or manually upload via Play Console
```

#### 3. Internal Testing
- Go to Google Play Console → Internal Testing
- Create new release
- Upload AAB
- Add release notes
- Review and roll out to internal testers

#### 4. Production Release
- Go to Google Play Console → Production
- Promote from Internal Testing
- Add release notes
- Roll out to percentage or full launch
- Monitor crash reports

---

## Rollback Procedures

### Backend Rollback

#### Option 1: Redeploy Previous Version
```bash
# List recent deployments
railway logs --deployment

# Rollback to specific deployment
railway up --service Qamar --environment production --deployment <deployment-id>
```

#### Option 2: Emergency Validation Mode
```bash
# Set VALIDATION_MODE=true to use mock responses
railway variables --set VALIDATION_MODE=true

# Restart service
railway restart
```

### Database Rollback
```bash
# Restore from backup (if schema changed)
railway run psql < backup-YYYY-MM-DD.sql

# Or use Railway UI: Data → Backups → Restore
```

### Mobile App Rollback

#### iOS
- Can't roll back once released
- Submit hotfix build with critical fixes
- Expedited review available for critical bugs

#### Android
- Go to Google Play Console → Production
- Select previous release
- Click "Release to production"
- Roll out immediately

---

## Emergency Contacts

**Railway Issues:**
- Support: https://railway.app/help
- Status: https://status.railway.app/

**Sentry Issues:**
- Support: support@sentry.io
- Status: https://status.sentry.io/

**Expo/EAS Issues:**
- Support: https://expo.dev/support
- Status: https://status.expo.dev/

---

## Post-Incident Review

After any production incident:

1. Document what happened
2. Document timeline of events
3. Identify root cause
4. Create action items to prevent recurrence
5. Update runbooks and procedures
6. Share learnings with team

---

## Deployment Frequency

**Recommended Schedule:**

- **Backend:** Deploy during low-traffic hours (midnight-4am local time)
- **Mobile:** iOS reviews take 24-48 hours, Android 2-4 hours
- **Hotfixes:** Deploy immediately for critical issues
- **Features:** Bundle into weekly/bi-weekly releases

---

## Related Documentation

- [PRODUCTION_ENV_CONFIG.md](./PRODUCTION_ENV_CONFIG.md) - Environment variables
- [SENTRY_SETUP.md](./SENTRY_SETUP.md) - Error monitoring
- [RAILWAY_FIX_GUIDE.md](./RAILWAY_FIX_GUIDE.md) - Railway troubleshooting
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
