# Release Automation

**Created**: 2026-01-20  
**Purpose**: Automated GitHub Actions for EAS builds and store submissions

---

## Overview

Two GitHub Actions workflows automate the release process:

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `pr-check.yml` | Pull requests to `main` | Typecheck + Tests |
| `eas-build.yml` | Push to `main` | EAS production builds for iOS and Android |

---

## Setup Instructions

### 1. Create an Expo Access Token

1. Go to [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Click **Create Token**
3. Name it: `GitHub Actions`
4. Copy the token (you won't see it again)

### 2. Add EXPO_TOKEN to GitHub Secrets

1. Go to your repo on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo token
6. Click **Add secret**

### 3. Link Your EAS Project (if not already done)

```bash
# In your repo root
npx eas init
```

This updates `app.json` with your EAS project ID.

---

## Workflow Behavior

### PR Check (`pr-check.yml`)

**Runs on**: Every pull request to `main`

**Steps**:
1. Checkout code
2. Install dependencies (`npm ci`)
3. Run typecheck (`npm run check:types`)
4. Run tests (`npm test`)

**Result**: PR cannot merge if checks fail.

---

### EAS Build (`eas-build.yml`)

**Runs on**: Every push to `main`

**Steps**:
1. Checkout code
2. Setup Expo GitHub Action
3. Install dependencies
4. Run typecheck and tests
5. Trigger iOS production build (non-blocking)
6. Trigger Android production build (non-blocking)

**Builds use**: `eas.json` → `production` profile

**Note**: Builds are started with `--no-wait` so the workflow completes quickly. Monitor builds at [expo.dev](https://expo.dev).

---

## Enabling Store Submission

Submissions are **off by default** to prevent accidental uploads.

### Option 1: Manual Trigger

1. Go to **Actions** → **EAS Build**
2. Click **Run workflow**
3. Set **Submit to stores** = `true`
4. Click **Run workflow**

### Option 2: Auto-Submit on Every Main Push

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click the **Variables** tab
3. Click **New repository variable**
4. Name: `AUTO_SUBMIT`
5. Value: `true`
6. Save

Now every push to `main` will build AND submit.

### Prerequisites for Submit to Work

Before enabling submit, you must have:

| Store | Requirements |
|-------|--------------|
| **iOS** | App Store Connect app created, ASC API key configured in EAS |
| **Android** | Play Console app created, service account JSON configured in EAS |

See [EAS Submit docs](https://docs.expo.dev/submit/introduction/) for credential setup.

---

## EAS Profiles Reference

Your `eas.json` profiles:

| Profile | Distribution | Use Case |
|---------|--------------|----------|
| `development` | Internal | Dev client for testing |
| `preview` | Internal | Internal testing builds |
| `production` | Store | App Store / Play Store builds |

The workflows use `production` profile for store-ready builds.

---

## Troubleshooting

### Common Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `EXPO_TOKEN not found` | Secret not set | Add EXPO_TOKEN in GitHub Secrets |
| `Project not found` | EAS not initialized | Run `npx eas init` |
| `Build failed` | Code issue | Check EAS dashboard for logs |
| `Submit failed: No credentials` | ASC/Play credentials missing | Configure in `eas.json` or EAS website |
| `Submit failed: App not found` | Store app not created | Create app in App Store Connect / Play Console |

### Check Build Status

1. Go to [expo.dev](https://expo.dev)
2. Open your project
3. Click **Builds** to see status and logs

### View Workflow Logs

1. Go to **Actions** tab in GitHub
2. Click the failed workflow run
3. Expand the failing step to see details

---

## Security Notes

- `EXPO_TOKEN` is never printed in logs
- Secrets are masked automatically by GitHub
- Don't commit tokens to the repo
- Rotate tokens if compromised

---

## Manual Build Commands

If you need to build manually:

```bash
# Development build
npx eas build --profile development --platform all

# Preview build
npx eas build --profile preview --platform all

# Production build
npx eas build --profile production --platform all

# Submit latest build
npx eas submit --profile production --platform all --latest
```

---

## References

- [Expo GitHub Action](https://github.com/expo/expo-github-action)
- [Building on CI](https://docs.expo.dev/build/building-on-ci/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [GitHub Secrets](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions)
