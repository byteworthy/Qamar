# Local Validation Runbook

**Purpose**: Quick-start guide for running Noor locally in validation mode  
**Audience**: Testers, engineers doing local development  
**Time**: ~5 minutes to get running

---

## Prerequisites

- Node.js 18+ installed
- npm installed
- Git (to clone if needed)

---

## Install

```powershell
npm install
```

---

## Set Environment

1. Copy the example environment file:

```powershell
copy .env.example .env
```

2. The default `.env` has `VALIDATION_MODE=true` which is correct for testing.

3. No API keys required for validation mode - placeholder responses are returned.

---

## Start Server

```powershell
npm run server:dev
```

Expected output:
```
============================================================
NOOR CBT SERVER CONFIGURATION
============================================================
⚠️  VALIDATION_MODE: ENABLED
   - AI routes return placeholder responses
   - Billing/purchase flows are disabled
   - Safe for tester validation without real keys
------------------------------------------------------------
Environment: development
Port: 5000
------------------------------------------------------------
ℹ️  OpenAI: Not configured (placeholder responses will be used)
ℹ️  Stripe: Not configured (billing disabled in validation mode)
============================================================
express server serving on port 5000
```

---

## Start Client (Mobile App)

In a separate terminal:

```powershell
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

---

## Five-Minute Smoke Test

| # | Test | Expected |
|---|------|----------|
| 1 | App launches | Welcome screen appears |
| 2 | Complete onboarding | Swipe through 3-4 screens, arrive at home |
| 3 | Tap "Start Reflection" | Thought capture screen opens |
| 4 | Enter any thought and submit | Placeholder analysis appears with [VALIDATION MODE] indicator |
| 5 | Continue through flow | Reframe and practice screens show placeholder content |
| 6 | Check server logs | Should show `[VALIDATION MODE]` log entries |

---

## Validation Mode Behavior

When `VALIDATION_MODE=true`:

| Feature | Behavior |
|---------|----------|
| `/api/analyze` | Returns placeholder distortion analysis |
| `/api/reframe` | Returns placeholder reframe content |
| `/api/practice` | Returns placeholder grounding practice |
| Billing/Purchase | Disabled (shows placeholders in UI) |
| Server startup | Does not fail on missing API keys |

---

## Quality Gates

Before submitting code:

```powershell
npm run format
npm run typecheck
npm test
```

---

## Troubleshooting

**Server won't start**: Check `.env` exists and has `VALIDATION_MODE=true`

**Client can't connect**: Ensure server is running on port 5000

**Expo errors**: Try `npx expo start --clear`

---

**Last Updated**: 2026-01-19
