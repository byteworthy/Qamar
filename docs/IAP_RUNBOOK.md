# IAP Implementation Runbook

**Created**: 2026-01-20  
**Library**: react-native-iap  
**Status**: Implementation in progress

---

## Overview

Noor uses `react-native-iap` for cross-platform subscription management via Apple In-App Purchase (iOS) and Google Play Billing (Android).

**Product Structure**:
- **Plus Tier**: Unlimited reflections, history, basic insights
  - `com.noor.plus.monthly` ($6.99/mo)
  - `com.noor.plus.yearly` ($69/year)
- **Pro Tier**: All Plus features + advanced insights, export
  - `com.noor.pro.monthly` ($11.99/mo)
  - `com.noor.pro.yearly` ($119/year)

---

## Store Console Setup

### Apple App Store Connect

#### 1. Create Subscription Group
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to: **Apps** → **Your App** → **Subscriptions**
3. Click **+** → **Create Subscription Group**
4. Name: `Noor Subscriptions`
5. Copy the Subscription Group ID → Update `release/STORE_IDENTIFIERS.json` → `apple.subscriptionGroupId`

#### 2. Create Subscription Products
For each product (Plus Monthly, Plus Yearly, Pro Monthly, Pro Yearly):

1. In the subscription group, click **+** → **Create Subscription**
2. **Reference Name**: e.g., "Noor Plus Monthly"
3. **Product ID**: Use exact ID from `release/STORE_IDENTIFIERS.json` → `apple.productIds`
   - `com.noor.plus.monthly`
   - `com.noor.plus.yearly`
   - `com.noor.pro.monthly`
   - `com.noor.pro.yearly`
4. **Subscription Duration**: Monthly or Yearly
5. **Price**: Set pricing (e.g., $6.99, $69, $11.99, $119)
6. **Localization**: Add English description
7. **Review Information**: Add screenshot if required
8. **Submit for Review**: Products must be reviewed before testing

#### 3. Create Sandbox Tester
1. Navigate to: **Users and Access** → **Sandbox Testers**
2. Click **+** → Enter email (must be unique, not a real Apple ID)
3. Save email → Update `release/STORE_IDENTIFIERS.json` → `apple.sandboxTesterEmail`

#### 4. Update Store Identifiers
1. Get **Team ID**: App Store Connect → Account → Membership
2. Get **App ID**: App Store Connect → Your App → App Information → Apple ID
3. Update `release/STORE_IDENTIFIERS.json`:
   ```json
   {
     "apple": {
       "teamId": "YOUR_TEAM_ID",
       "appStoreConnectAppId": "YOUR_APP_ID",
       "subscriptionGroupId": "YOUR_SUBSCRIPTION_GROUP_ID",
       "sandboxTesterEmail": "sandbox@example.com"
     }
   }
   ```

---

### Google Play Console

#### 1. Create Subscription Products
1. Log in to [Google Play Console](https://play.google.com/console)
2. Navigate to: **Monetize** → **Subscriptions**
3. Click **Create subscription**
4. **Product ID**: Use exact ID from `release/STORE_IDENTIFIERS.json` → `google.productIds`
   - `noor_plus_monthly`
   - `noor_plus_yearly`
   - `noor_pro_monthly`
   - `noor_pro_yearly`
5. **Name**: e.g., "Noor Plus Monthly"
6. **Description**: User-facing description

#### 2. Create Base Plans
For each product:
1. Click **Add base plan**
2. **Base plan ID**: Use from `release/STORE_IDENTIFIERS.json` → `google.basePlanIds`
   - `plus-monthly`, `plus-yearly`, `pro-monthly`, `pro-yearly`
3. **Billing period**: 1 month or 1 year
4. **Price**: Set pricing (e.g., $6.99, $69, $11.99, $119)
5. **Renewal type**: Auto-renewing
6. **Activate** base plan

#### 3. Set Up License Testing
1. Navigate to: **Setup** → **License testing**
2. Add test Gmail accounts
3. Save email → Update `release/STORE_IDENTIFIERS.json` → `google.licenseTesterEmail`

#### 4. Update Store Identifiers
1. Get **Application ID**: Play Console → Dashboard → View app details
2. Update `release/STORE_IDENTIFIERS.json`:
   ```json
   {
     "google": {
       "playConsoleAppId": "com.noor.app"
     }
   }
   ```

---

## Building for IAP Testing

### iOS Sandbox Testing

#### Prerequisites
- Xcode installed
- Apple Developer account
- Sandbox tester account created
- Subscription products submitted for review (can test while "Waiting for Review")

#### Build Development Client
```bash
# Install dependencies
npm install

# Build dev client for iOS
npx eas build --profile development --platform ios

# Or build locally
npx eas build --profile development --platform ios --local
```

#### Install on Device
1. Download build from EAS
2. Install via TestFlight (Internal Testing) or direct install
3. On device: **Settings** → **App Store** → **Sandbox Account** → Sign in with sandbox tester

#### Test Purchase Flow
1. Open app → Navigate to Pricing screen
2. Tap "Noor Plus Monthly" or "Noor Pro Monthly"
3. Sandbox purchase dialog appears (shows "[Sandbox]" banner)
4. Confirm purchase (no real charge)
5. Verify entitlement unlocked

#### Test Restore
1. Delete app
2. Reinstall
3. Tap "Restore Purchases"
4. Verify subscription restored

#### Manage Subscriptions (Sandbox)
1. Tap "Manage Subscription"
2. Opens **Settings** → **Subscriptions** (sandbox)
3. Cancel or modify subscription

---

### Android License Testing

#### Prerequisites
- Android Studio or adb installed
- Google Play Console access
- License testing account added
- Subscription products published (can be in "Draft" for testing)

#### Build Development Client
```bash
# Build dev client for Android
npx eas build --profile development --platform android

# Or build locally
npx eas build --profile development --platform android --local
```

#### Install on Device
1. Download APK from EAS
2. Install via `adb install app.apk` or direct transfer
3. On device: Ensure license tester account is primary Google account

#### Test Purchase Flow
1. Open app → Navigate to Pricing screen
2. Tap "Noor Plus Monthly"
3. Google Play purchase dialog appears (shows "Test" badge)
4. Confirm purchase (no real charge)
5. Verify entitlement unlocked

#### Test Restore
1. Clear app data: **Settings** → **Apps** → **Noor** → **Clear Data**
2. Reopen app
3. Tap "Restore Purchases"
4. Verify subscription restored

#### Manage Subscriptions (License Testing)
1. Tap "Manage Subscription"
2. Opens Play Store subscription management
3. Cancel or modify subscription

---

## Known Failure Modes

### iOS

| Issue | Cause | Expected UI Behavior |
|-------|-------|---------------------|
| "Cannot connect to App Store" | No network, sandbox account issues | Show error: "Unable to connect. Try again later." |
| Product IDs not found | Products not configured in App Store Connect | Show error: "Products unavailable. Try again later." |
| Purchase canceled | User tapped Cancel | Return to Pricing screen, no error shown |
| Purchase failed | Payment issue, sandbox limit | Show error: "Purchase failed. Please try again." |
| Restore finds nothing | No active subscription | Show message: "No purchases found." |

### Android

| Issue | Cause | Expected UI Behavior |
|-------|-------|---------------------|
| "Google Play services unavailable" | Play Services not installed/updated | Show error: "Update Google Play Services." |
| Product IDs not found | Products not published in Play Console | Show error: "Products unavailable. Try again later." |
| Purchase canceled | User tapped back/cancel | Return to Pricing screen, no error shown |
| Purchase failed | Payment issue | Show error: "Purchase failed. Please try again." |
| Restore finds nothing | No active subscription | Show message: "No purchases found." |

### Common Issues

| Issue | Solution |
|-------|----------|
| "Validation mode" message in production | Ensure `EXPO_PUBLIC_VALIDATION_MODE=false` in `eas.json` production profile |
| Products show as "Coming Soon" | Check `billingConfig` status, ensure store identifiers filled |
| Subscription not unlocking features | Check entitlement logic in `billingProvider.ts` |
| Restore button does nothing | Check logs for IAP errors, verify store connection |

---

## Testing Checklist

### Pre-Submission Testing

#### iOS
- [ ] Build with `--profile production`
- [ ] Verify `EXPO_PUBLIC_VALIDATION_MODE=false` in build logs
- [ ] Test purchase in Sandbox with sandbox tester account
- [ ] Test restore after deleting app
- [ ] Test "Manage Subscription" link opens correct screen
- [ ] Verify Pro features are gated correctly
- [ ] Test subscription expiry (sandbox accelerates time: 1 day = 5 minutes)
- [ ] Test purchase cancellation flow
- [ ] Verify no crashes on purchase error

#### Android
- [ ] Build with `--profile production` and `--platform android`
- [ ] Verify `EXPO_PUBLIC_VALIDATION_MODE=false` in build logs
- [ ] Test purchase with license tester account
- [ ] Test restore after clearing app data
- [ ] Test "Manage Subscription" link opens Play Store
- [ ] Verify Pro features are gated correctly
- [ ] Test subscription cancellation in Play Console
- [ ] Test purchase cancellation flow
- [ ] Verify no crashes on purchase error

---

## Environment Variables Required

### Production (EAS Build)

Already configured in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_VALIDATION_MODE": "false"
      }
    }
  }
}
```

### Store Identifiers

Must be filled in `release/STORE_IDENTIFIERS.json` before IAP can function:
- `apple.teamId`
- `apple.appStoreConnectAppId`
- `apple.subscriptionGroupId`
- `google.playConsoleAppId`

---

## Troubleshooting

### Check Billing Configuration Status
```typescript
import { getBillingDebugInfo } from '@/lib/billingProvider';

console.log(getBillingDebugInfo());
// Outputs: { mode: 'store' | 'mock', isConfigured: boolean, ... }
```

### Force Mock Billing (Development Only)
If store billing is causing issues during development:
1. Set all store identifiers to `null` in `STORE_IDENTIFIERS.json`
2. App will fall back to mock billing
3. Use PricingScreen to "purchase" tiers (stored locally only)

### Reset Mock Profile
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('@noor_mock_billing_profile');
```

---

## Next Steps After Implementation

1. Fill `release/STORE_IDENTIFIERS.json` with real IDs from App Store Connect and Play Console
2. Build development client: `npx eas build --profile development --platform all`
3. Test purchase flow on physical iOS and Android devices
4. Submit products for review in App Store Connect (required before production)
5. Publish subscription products in Play Console
6. Build production: `npx eas build --profile production --platform all`
7. Submit to stores: `npx eas submit --profile production --platform all`

---

---

## Store Identifiers Checklist

### Fields to Fill in `release/STORE_IDENTIFIERS.json`

| Field | Where to Find | Required For |
|-------|---------------|--------------|
| `apple.teamId` | App Store Connect → Account → Membership → Team ID | iOS builds |
| `apple.appStoreConnectAppId` | App Store Connect → Your App → App Information → Apple ID (numeric) | iOS IAP |
| `apple.subscriptionGroupId` | App Store Connect → Your App → Subscriptions → Group → ID | iOS IAP |
| `apple.sandboxTesterEmail` | App Store Connect → Users → Sandbox Testers | iOS testing |
| `google.playConsoleAppId` | Play Console → Dashboard → View app details | Android IAP |
| `google.licenseTesterEmail` | Play Console → Setup → License testing | Android testing |
| `eas.account` | Your EAS account name (from `eas whoami`) | EAS builds |
| `eas.projectId` | EAS project ID (from `eas init` or app.json expo.extra.eas.projectId) | EAS builds |

### Placeholder Product IDs (Already Set)

The following product IDs are pre-configured. **Do not change** - create products in store consoles with these exact IDs:

**Apple (App Store Connect)**:
- `com.noor.plus.monthly` → Create subscription, monthly, $6.99
- `com.noor.plus.yearly` → Create subscription, yearly, $69
- `com.noor.pro.monthly` → Create subscription, monthly, $11.99
- `com.noor.pro.yearly` → Create subscription, yearly, $119

**Google (Play Console)**:
- `noor_plus_monthly` → Create subscription + base plan "plus-monthly", $6.99/mo
- `noor_plus_yearly` → Create subscription + base plan "plus-yearly", $69/yr
- `noor_pro_monthly` → Create subscription + base plan "pro-monthly", $11.99/mo
- `noor_pro_yearly` → Create subscription + base plan "pro-yearly", $119/yr

---

## EAS Build Commands

### Important: Expo Go Does NOT Support IAP

**react-native-iap requires a development client build**. Expo Go will crash or show blank pricing screens. You MUST build a dev client to test purchases.

### iOS Development Build
```bash
# Build iOS development client (for device testing)
npx eas build --profile development --platform ios

# Build locally (requires Xcode)
npx eas build --profile development --platform ios --local
```

### Android Development Build
```bash
# Build Android development client (for device testing)
npx eas build --profile development --platform android

# Build locally (requires Android SDK)
npx eas build --profile development --platform android --local
```

### Both Platforms
```bash
# Build both platforms
npx eas build --profile development --platform all
```

### Installing Development Builds

**iOS**:
1. Build completes → Download .ipa from EAS dashboard
2. Use Apple Configurator 2 or `ios-deploy` to install
3. Or: Submit to TestFlight internal testing → install via TestFlight app

**Android**:
1. Build completes → Download .apk from EAS dashboard
2. Enable "Install from unknown sources" on device
3. Install via `adb install noor-dev.apk` or transfer & tap file

### Production Builds (for Store Submission)
```bash
# Production iOS build
npx eas build --profile production --platform ios

# Production Android build
npx eas build --profile production --platform android

# Submit to stores
npx eas submit --profile production --platform ios
npx eas submit --profile production --platform android
```

---

## Device Sandbox Testing Proof Requirements

### Proof Needed Before Gate 2

**iOS (StoreKit Sandbox)**:
- [ ] Sandbox purchase completes without error
- [ ] Entitlement unlocks (Plus or Pro features visible)
- [ ] Restore succeeds after reinstall or storage clear
- [ ] Manage Subscriptions opens correct iOS Settings screen

**Android (License Testing)**:
- [ ] License tester purchase completes without error
- [ ] Entitlement unlocks (Plus or Pro features visible)
- [ ] Restore succeeds after clearing app data
- [ ] Manage Subscriptions opens Play Store

### How to Prove

1. **Screenshot**: Pricing screen before purchase (shows "Select Noor Plus")
2. **Screenshot**: Purchase dialog (iOS shows "[Sandbox]", Android shows "Test")
3. **Screenshot**: Success screen or unlocked feature (shows "Noor Plus" or "Noor Pro")
4. **Screenshot**: Restore success after data clear

### Testing Priority

**Do iOS first** - Apple is stricter about IAP review. If it works in sandbox, it will likely pass review.

---

**Last Updated**: 2026-01-20  
**Implementation Status**: Complete (pending device testing)
