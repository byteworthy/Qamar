# Sentry Error Monitoring Setup

## Overview

Sentry provides real-time error tracking and performance monitoring for production. This guide covers setup for both the Node.js backend and React Native mobile app.

---

## Prerequisites

- Sentry account (free tier available at https://sentry.io/signup/)
- Sentry CLI installed: `npm install -g @sentry/cli`
- `SENTRY_AUTH_TOKEN` for automated releases

---

## Backend Setup (Node.js/Express)

### Step 1: Install Sentry SDK

```bash
npm install @sentry/node @sentry/profiling-node
```

### Step 2: Initialize Sentry

Create `server/sentry.ts`:

```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      integrations: [
        new ProfilingIntegration(),
      ],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      // Set profilesSampleRate to profile 10% of transactions
      profilesSampleRate: 0.1,
    });

    console.log("[Sentry] Initialized for environment:", process.env.NODE_ENV);
  } else {
    console.log("[Sentry] Skipped - SENTRY_DSN not configured");
  }
}

export { Sentry };
```

### Step 3: Add to Server

Update `server/index.ts`:

```typescript
import { initSentry, Sentry } from "./sentry";

// Initialize Sentry FIRST (before other imports)
initSentry();

// ... rest of imports

const app = express();

// RequestHandler creates a separate execution context using domains
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// ... your routes

// ErrorHandler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallback error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[Server Error]", err);
  res.status(500).json({ error: "Internal server error" });
});
```

### Step 4: Add Environment Variable to Railway

```bash
SENTRY_DSN=https://<key>@<organization>.ingest.sentry.io/<project>
```

Get this from: Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys (DSN)

---

## Mobile App Setup (React Native)

### Step 1: Install Sentry SDK

```bash
npx expo install @sentry/react-native
```

### Step 2: Initialize in App

Update `client/index.tsx`:

```typescript
import * as Sentry from "@sentry/react-native";

// Initialize Sentry before App component
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_VALIDATION_MODE === "true" ? "development" : "production",
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,
    tracesSampleRate: 0.2,
  });
}

// Wrap App in Sentry
export default Sentry.wrap(App);
```

### Step 3: Add to Environment

Update `client/.env`:

```bash
EXPO_PUBLIC_SENTRY_DSN=https://<key>@<organization>.ingest.sentry.io/<project>
```

Update `eas.json` for production builds:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_VALIDATION_MODE": "false",
        "EXPO_PUBLIC_SENTRY_DSN": "https://<key>@<organization>.ingest.sentry.io/<project>"
      }
    }
  }
}
```

---

## Release Management

### Automated Release Tracking

Create `.sentryclirc` in project root:

```ini
[defaults]
url=https://sentry.io/
org=<your-org>
project=noor

[auth]
token=<your-auth-token>
```

Get token from: Sentry → Settings → Auth Tokens → Create New Token
Scopes needed: `project:releases`, `org:read`

### Release Script

Create `scripts/sentry-release.sh`:

```bash
#!/bin/bash
set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
RELEASE="noor@${VERSION}"

echo "Creating Sentry release: ${RELEASE}"

# Create release
sentry-cli releases new "${RELEASE}"

# Associate commits
sentry-cli releases set-commits "${RELEASE}" --auto

# Finalize release
sentry-cli releases finalize "${RELEASE}"

echo "✅ Sentry release ${RELEASE} created and finalized"
```

Make executable:
```bash
chmod +x scripts/sentry-release.sh
```

### Add to Deployment

Update `package.json`:

```json
{
  "scripts": {
    "deploy:backend": "railway up && npm run sentry:release",
    "sentry:release": "bash scripts/sentry-release.sh"
  }
}
```

---

## Alert Configuration

### Critical Error Alerts

1. Go to: Sentry → Alerts → Create Alert Rule
2. Configure:

**Alert Name:** Critical Backend Errors

**Conditions:**
- When an event is seen
- AND The event's level is equal to `error` or `fatal`
- AND The event's environment is equal to `production`

**Actions:**
- Send a notification via Email to: [your-email]
- Frequency: Send at most one notification every 5 minutes

### High Error Rate Alerts

**Alert Name:** High Error Rate

**Conditions:**
- When number of events in an issue is more than 10
- in 1 minute

**Actions:**
- Send a notification via Email

### Performance Degradation

**Alert Name:** Slow Response Times

**Conditions:**
- When transaction duration (p95) is above 3000ms
- in 10 minutes

**Actions:**
- Send notification via Email

---

## Manual Error Capture

### Backend

```typescript
import { Sentry } from "./sentry";

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: "reflection-processor",
    },
    extra: {
      userId: req.userId,
      thoughtLength: thought.length,
    },
  });
  throw error;
}
```

### Mobile App

```typescript
import * as Sentry from "@sentry/react-native";

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      screen: "DistortionScreen",
    },
    extra: {
      thoughtLength: thought.length,
    },
  });
  // Show user-friendly error
}
```

---

## Railway Health Check Integration

Current health check already tests database and AI:

```typescript
app.get("/api/health", async (_req, res) => {
  const checks = {
    database: false,
    ai: false,
  };

  try {
    await storage.getReflectionHistory("health-check", 1);
    checks.database = true;
  } catch (dbError) {
    Sentry.captureException(dbError, {
      tags: { component: "health-check", check: "database" },
    });
  }

  // ... ai check

  const healthy = checks.database && checks.ai;
  if (!healthy) {
    Sentry.captureMessage("Health check degraded", {
      level: "warning",
      extra: { checks },
    });
  }

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    checks,
  });
});
```

---

## Testing Sentry Integration

### Test Backend Error Capture

```bash
curl -X POST https://noor-production-9ac5.up.railway.app/api/test-sentry
```

Add test endpoint (remove after testing):

```typescript
app.get("/api/test-sentry", (_req, res) => {
  Sentry.captureMessage("Test message from Qamar backend", {
    level: "info",
    tags: { test: true },
  });
  throw new Error("Test error for Sentry");
});
```

### Test Mobile Error Capture

Add temporary button in app:

```typescript
<Button
  title="Test Sentry"
  onPress={() => {
    Sentry.captureMessage("Test from mobile app");
    throw new Error("Test mobile error");
  }}
/>
```

---

## Verification Checklist

- [ ] Sentry account created
- [ ] Backend project created in Sentry
- [ ] Mobile app project created in Sentry (or use same project with platform tags)
- [ ] `@sentry/node` installed in backend
- [ ] `@sentry/react-native` installed in mobile
- [ ] `SENTRY_DSN` configured in Railway
- [ ] `EXPO_PUBLIC_SENTRY_DSN` in mobile `.env` and `eas.json`
- [ ] Sentry initialized before app code
- [ ] Error handlers added to Express
- [ ] App wrapped in `Sentry.wrap()`
- [ ] Test error captured successfully
- [ ] Critical error alerts configured
- [ ] Release tracking script created
- [ ] `.sentryclirc` configured

---

## Related Documentation

- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry React Native Documentation](https://docs.sentry.io/platforms/react-native/)
- [Sentry Releases](https://docs.sentry.io/product/releases/)
- [PRODUCTION_ENV_CONFIG.md](./PRODUCTION_ENV_CONFIG.md)
