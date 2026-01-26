# Sentry Configuration Instructions

## ✅ What's Already Done

Sentry SDKs are installed and configured:
- ✅ Backend: `@sentry/node` with PII scrubbing
- ✅ Mobile: `@sentry/react-native` with PII scrubbing
- ✅ Error handlers integrated
- ✅ App wrapped in Sentry error boundary

## 🔧 What You Need To Do

### Step 1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up (free tier is sufficient for launch)
3. Create a new project:
   - **Name:** Noor Backend
   - **Platform:** Node.js
   - **Alert frequency:** Default

4. Create another project:
   - **Name:** Noor Mobile
   - **Platform:** React Native
   - **Alert frequency:** Default

### Step 2: Get Your DSN Keys

For each project, go to: **Settings → Projects → [Project Name] → Client Keys (DSN)**

You'll see something like:
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

Copy both DSNs.

### Step 3: Configure Backend (Railway)

1. Go to: https://railway.app/
2. Navigate to: **Noor project → Backend service → Variables tab**
3. Click **+ New Variable**
4. Add:
   ```
   SENTRY_DSN=https://[your-backend-key]@[your-org].ingest.sentry.io/[backend-project-id]
   ```
5. Click **Deploy** to restart with new variable

### Step 4: Configure Mobile App

#### For Development/Testing:

Edit `client/.env`:
```bash
# Uncomment and add your DSN
EXPO_PUBLIC_SENTRY_DSN=https://[your-mobile-key]@[your-org].ingest.sentry.io/[mobile-project-id]
```

#### For Production Builds:

Edit `eas.json` production profile:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_VALIDATION_MODE": "false",
        "EXPO_PUBLIC_SENTRY_DSN": "https://[your-mobile-key]@[your-org].ingest.sentry.io/[mobile-project-id]"
      }
    }
  }
}
```

### Step 5: Test Sentry Integration

#### Test Backend:
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
```

Check Railway logs for: `[Sentry] Initialized successfully`

#### Test Mobile:
1. Run app: `npx expo start`
2. Open app on device
3. Check console for: `[Sentry] Mobile initialized`

### Step 6: Configure Alerts

Go to Sentry → **Alerts → Create Alert Rule**

**Recommended Alerts:**

1. **Critical Errors**
   - Condition: Event level = error or fatal
   - Action: Email notification
   - Frequency: Immediately

2. **High Error Rate**
   - Condition: More than 10 events in 1 minute
   - Action: Email notification
   - Frequency: Every 5 minutes

3. **New Issues**
   - Condition: A new issue is created
   - Action: Email notification
   - Frequency: Immediately

## ✅ Verification

After configuration:

1. **Backend errors appear in Sentry dashboard**
2. **Mobile crashes appear in Sentry dashboard**
3. **PII is scrubbed** (thought, reframe fields show [REDACTED])
4. **Email alerts working**

## 📚 Related Documentation

- [SENTRY_SETUP.md](./docs/SENTRY_SETUP.md) - Detailed setup guide
- [PRODUCTION_ENV_CONFIG.md](./docs/PRODUCTION_ENV_CONFIG.md) - All environment variables

## 🆘 Troubleshooting

**Backend not sending errors:**
- Check Railway logs for Sentry initialization
- Verify SENTRY_DSN is set in Railway variables
- Restart Railway service

**Mobile not sending errors:**
- Check EXPO_PUBLIC_SENTRY_DSN in .env
- Rebuild app after adding DSN
- Check app console for Sentry logs

**Not receiving alerts:**
- Check alert rules in Sentry dashboard
- Verify email address in Sentry settings
- Check spam folder
