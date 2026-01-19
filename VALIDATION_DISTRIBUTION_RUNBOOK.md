# Validation Distribution Runbook

**Purpose**: How to build and distribute Noor CBT to internal testers  
**Audience**: Engineers, QA, product team  
**Scope**: Controlled distribution only — not App Store or Play Store submission

---

## 1. How to Run Locally

### Prerequisites
- Node.js 18+
- npm
- Expo CLI (`npm install -g expo-cli` if needed)

### Steps

```powershell
# 1. Install dependencies
npm install

# 2. Copy environment files
copy .env.example .env

# 3. Start the server (Terminal 1)
npm run server:dev

# 4. Start the client (Terminal 2)
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go on physical device

---

## 2. How to Generate Internal Builds

### iOS Build (for TestFlight Internal Testing)

```powershell
# Development build (for internal testing)
npx eas build --profile development --platform ios

# Preview build (closer to production, but internal only)
npx eas build --profile preview --platform ios
```

**Build output**: EAS provides a download link or uploads to App Store Connect.

### Android Build (for Internal Testing)

```powershell
# Development build (APK for internal testing)
npx eas build --profile development --platform android

# Preview build (AAB for internal track)
npx eas build --profile preview --platform android
```

**Build output**: EAS provides a download link for APK or AAB file.

---

## 3. How to Share Builds with Testers

### iOS via TestFlight Internal Testing

1. Build completes on EAS → automatically uploaded to App Store Connect
2. Go to App Store Connect → TestFlight → Internal Testing
3. Add testers by email (must be Apple ID)
4. Testers receive invite, install TestFlight app, then install build

**Note**: Internal testing does not require App Store review.

### Android via Direct APK

1. Build completes on EAS → download APK from build page
2. Share APK via:
   - Secure file sharing (Google Drive, Dropbox with restricted access)
   - Email attachment (for known testers only)
   - Internal distribution platform if available

**Note**: Testers must enable "Install from unknown sources" in Android settings.

### Android via Internal Testing Track (Optional)

1. Build AAB with preview profile
2. Upload to Google Play Console → Internal Testing track
3. Add testers by email
4. Testers receive invite link to join internal test

**Note**: Internal track does not require Play Store review.

---

## 4. How Testers Report Issues

### Preferred Method: GitHub Issues

1. Go to: https://github.com/byteworthy/Noor-CBT/issues
2. Click "New Issue"
3. Include:
   - Device and OS version
   - Steps to reproduce
   - Screenshot or screen recording if possible
   - Expected vs actual behavior

### Alternative: Direct Communication

- Slack/Discord channel (if team has one)
- Email to designated QA contact
- Voice call for urgent/blocking issues

### Issue Template

```
**Device**: iPhone 14 Pro / iOS 17.2
**Build**: Validation v1.0.0 (dev)
**Steps**:
1. Open app
2. Go to [screen]
3. Do [action]
**Expected**: [what should happen]
**Actual**: [what happened]
**Screenshot**: [attach if helpful]
```

---

## 5. How Testers Find Build Info

Open the **Profile** tab (bottom navigation).

Scroll to the bottom of the screen to see:
- Build version
- Validation Mode (on/off)
- Server URL

Include this info when reporting issues.

---

## 6. Validation Mode Behavior

When running validation builds:

| Feature | Behavior |
|---------|----------|
| AI responses | Return placeholder text marked `[VALIDATION MODE]` |
| Billing | Paid tiers show "Coming Soon" badge, no purchase action |
| PricingScreen | Shows "Validation Build — Paid tiers coming soon" banner |
| Server startup | Logs warnings for missing config, continues running |

---

## 6. Environment File Summary

| File | Purpose | Used by |
|------|---------|---------|
| `.env.example` | Master template (root) | Documentation reference |
| `client/.env.example` | Client config template | Copy to `client/.env` for local |
| `server/.env.example` | Server config template | Copy to root `.env` for local |
| `.env` | Actual config (root) | Server reads from `process.env` |

**For development**: Copy root `.env.example` to `.env` and modify as needed.

---

## 7. Quick Reference Commands

```powershell
# Format code
npm run format

# Type check
npm run typecheck

# Run tests
npm test

# Start server
npm run server:dev

# Start Expo
npx expo start

# Build iOS dev
npx eas build --profile development --platform ios

# Build Android dev
npx eas build --profile development --platform android
```

---

**Last Updated**: 2026-01-19
