# Testing Guide

## Overview

Comprehensive testing strategy for Noor application covering unit tests, integration tests, and user acceptance testing across iOS, Android, and backend.

---

## Testing Infrastructure

### TestFlight (iOS Beta Testing)

#### Setup

1. **Configure EAS for TestFlight Submissions**

Update `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  },
  "build": {
    "production": {
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release",
        "autoIncrement": true
      }
    }
  }
}
```

2. **Build and Submit to TestFlight**

```bash
# Build for production
eas build --profile production --platform ios --auto-submit

# Or build then submit separately
eas build --profile production --platform ios
eas submit --platform ios --latest
```

3. **Configure TestFlight Groups**

Go to App Store Connect → TestFlight:

**Internal Testing Group** (Instant access, no review):
- Add team members
- Up to 100 internal testers
- Immediate access to builds

**External Testing Group** (Requires Apple review):
- Name: "Early Access Testers"
- Add up to 10,000 external testers
- Builds reviewed by Apple (24-48 hours)

#### Tester Onboarding

Create invitation email template:

```markdown
Subject: You're invited to test Noor

Hi [Name],

You've been invited to test the Noor app for iOS!

**What is Noor?**
Noor is an Islamic companion app for Quran reading, Arabic learning, daily reflections, and prayer support.

**How to Join:**
1. Install TestFlight from the App Store: https://apps.apple.com/app/testflight/id899247664
2. Tap this invite link: [TestFlight Invite Link]
3. Accept the invitation and install Noor

**What to Test:**
- Complete at least 3 full reflection sessions
- Try the Insights feature
- Test on different network conditions
- Report any bugs or confusing UX

**Feedback:**
Use the feedback form in TestFlight or email: feedback@noorapp.com

Thank you for helping us improve Noor!

- The Noor Team
```

---

### Google Play Internal Testing (Android)

#### Setup

1. **Configure EAS for Google Play**

Update `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": "versionCode"
      }
    }
  }
}
```

2. **Create Service Account**

- Go to Google Cloud Console
- Create service account with "Release Manager" role
- Download JSON key
- Save as `google-play-service-account.json` (add to `.gitignore`)

3. **Build and Submit**

```bash
# Build AAB
eas build --profile production --platform android

# Submit to internal testing
eas submit --platform android --latest
```

4. **Configure Testing Track**

Go to Google Play Console → Internal Testing:
- Create new release
- Upload AAB
- Add release notes
- Add tester email addresses

#### Tester Onboarding

Create Google Group for testers:
1. Go to Google Groups
2. Create group: noor-testers@googlegroups.com
3. Add tester emails

Send invitation:

```markdown
Subject: Test Noor on Android

Hi [Name],

Join our internal testing program for Noor on Android!

**Opt-in Link:**
[Google Play Testing Link]

**After opting in:**
1. Visit Google Play Store
2. Search for "Noor"
3. Install the app

**What to Test:**
- Complete full reflection flow
- Test Insights generation
- Verify offline behavior
- Report bugs via in-app feedback

Feedback: feedback@noorapp.com

Thanks for testing!
```

---

## Bug Reporting Workflow

### GitHub Issues Setup

Create issue templates in `.github/ISSUE_TEMPLATE/`:

#### `bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug or unexpected behavior
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Device Info:**
- Device: [e.g. iPhone 14, Pixel 7]
- OS: [e.g. iOS 17.2, Android 14]
- App Version: [e.g. 0.9.0]

**Additional context**
Any other context about the problem.
```

#### `feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest a new feature or improvement
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Screenshots, mockups, or examples.
```

### Labels

Create these labels in GitHub:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | #d73a4a | Something isn't working |
| `enhancement` | #a2eeef | New feature or request |
| `documentation` | #0075ca | Documentation improvements |
| `critical` | #b60205 | Blocks core functionality |
| `P0` | #d93f0b | Fix immediately |
| `P1` | #fbca04 | Fix before next release |
| `P2` | #0e8a16 | Fix when possible |
| `ios` | #5319e7 | iOS-specific |
| `android` | #3ddc84 | Android-specific |
| `backend` | #1d76db | Backend-specific |

---

## Testing Checklist

### Critical User Flows

Test these flows on every build:

#### 1. New User Onboarding
- [ ] Open app for first time
- [ ] Skip or complete onboarding screens
- [ ] Land on Home screen

#### 2. Reflection Flow (Core Feature)
- [ ] Enter thought on Home screen
- [ ] Select at least one distortion
- [ ] Generate reframe (Claude API call)
- [ ] Select regulation practice
- [ ] Read and save Dua
- [ ] Verify session saved to history

#### 3. History & Insights
- [ ] View reflection history
- [ ] Open past reflection
- [ ] Generate insights (paid feature, Claude API)
- [ ] View assumptions tab

#### 4. Settings
- [ ] Toggle theme (light/dark)
- [ ] Navigate to subscription screen
- [ ] (If subscribed) Manage subscription

#### 5. Error Handling
- [ ] Test with airplane mode (offline behavior)
- [ ] Test with slow network
- [ ] Test when backend is down
- [ ] Verify error boundaries catch crashes

---

## Automated Testing

### Backend Tests

Current test coverage: **79 tests passing**

Run tests:
```bash
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

Critical test suites:
- `server/routes.test.ts` - API endpoints
- `server/storage.test.ts` - Database operations
- `server/anthropic.test.ts` - AI integration
- `server/billing.test.ts` - Stripe integration

### Mobile App Tests

Run tests:
```bash
cd client
npm test

# With coverage
npm test -- --coverage
```

Test files:
- `__tests__/App.test.tsx` - App initialization
- `__tests__/components/*.test.tsx` - Component tests
- `__tests__/hooks/*.test.tsx` - Hook tests

---

## Performance Testing

### Backend Performance

**Load Testing with k6:**

Create `scripts/load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const res = http.get('https://noor-production-9ac5.up.railway.app/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

Run:
```bash
k6 run scripts/load-test.js
```

### Mobile Performance

**Check Bundle Size:**
```bash
npx expo export --dump-sourcemap
```

**Profile with React DevTools:**
- Install React Native Debugger
- Enable "Highlight Updates"
- Profile render times

---

## User Acceptance Testing (UAT)

### UAT Test Plan

**Participants:** 5-10 target users

**Duration:** 1 week

**Process:**
1. Send TestFlight/Play Store invite
2. Provide testing instructions
3. Ask users to complete 5 reflection sessions
4. Conduct 30-min interview after testing
5. Collect feedback via survey

**Interview Questions:**
1. What was your first impression?
2. Was the reflection process clear?
3. Did the reframes feel helpful?
4. Would you use this regularly?
5. What would make you recommend it to others?
6. Any confusing or frustrating moments?

**Survey (Google Form):**
- Overall satisfaction (1-5 stars)
- How likely to recommend? (NPS: 0-10)
- Favorite feature
- Most confusing part
- Feature requests
- Open feedback

---

## Tester Communication

### Discord/Slack Channel Setup

Create channels:
- `#testing-general` - General discussion
- `#bug-reports` - Bug reports
- `#feature-requests` - Feature ideas
- `#announcements` - New build notifications

### Build Notification Template

```markdown
📱 **New Build Available: v0.9.1**

**What's New:**
- Fixed crash on Insights screen
- Improved loading states
- Added offline support for viewing history

**How to Update:**
- iOS: TestFlight will auto-update
- Android: Check Google Play Store

**Please Test:**
- [ ] Offline mode
- [ ] Insights generation
- [ ] Any previously reported bugs

**Report Issues:**
Use #bug-reports or GitHub Issues

Thanks for testing! 🙏
```

---

## Quality Gates

Before releasing to production:

- [ ] All P0 bugs fixed
- [ ] No crashes in last 24 hours (Sentry)
- [ ] Backend health check passing
- [ ] All automated tests passing
- [ ] At least 5 testers completed full flow
- [ ] No critical feedback unresolved
- [ ] Performance metrics acceptable (< 2s API response time)
- [ ] Sentry error rate < 1%

---

## Related Documentation

- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment procedures
- [SENTRY_SETUP.md](./SENTRY_SETUP.md) - Error monitoring
- [PRODUCTION_ENV_CONFIG.md](./PRODUCTION_ENV_CONFIG.md) - Environment config
