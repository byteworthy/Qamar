# In-App Purchase Setup Guide - Noor
## Option B: Free with IAP at Launch

**Decision Made:** 2026-02-01
**Launch Strategy:** Free app with premium subscription tiers
**Revenue Model:** Freemium with Noor Plus ($6.99/month) and Noor Pro ($11.99/month)

---

## Overview

This guide sets up In-App Purchases (IAP) for Noor using RevenueCat as the subscription management platform.

### Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 reflections/month, basic AI responses |
| **Noor Plus** | $6.99/month | Unlimited reflections, advanced insights, pattern tracking |
| **Noor Pro** | $11.99/month | All Plus features + priority support, early access to new features |

---

## Part 1: Code Configuration

### Step 1: Enable IAP in App Config

**File:** `client/lib/config.ts`

```typescript
// CHANGE THIS BEFORE PRODUCTION BUILD
export const VALIDATION_MODE = false; // Set to false to enable IAP
```

### Step 2: Verify Billing Config

**File:** `client/lib/billingConfig.ts`

Verify product IDs match what you'll create in App Store Connect:

```typescript
export const SUBSCRIPTION_PRODUCTS = {
  plus: {
    id: 'noor_plus_monthly',
    name: 'Noor Plus',
    price: '$6.99',
    interval: 'month',
  },
  pro: {
    id: 'noor_pro_monthly',
    name: 'Noor Pro',
    price: '$11.99',
    interval: 'month',
  },
} as const;
```

### Step 3: Update App Description

**File:** `release/STORE_PACK/apple/APP_STORE_METADATA.md`

Add subscription pricing information to the description:

```markdown
SUBSCRIPTION OPTIONS
• Free: 5 reflections per month
• Noor Plus: $6.99/month - Unlimited reflections and insights
• Noor Pro: $11.99/month - All features plus priority support

Subscriptions auto-renew unless canceled 24 hours before renewal.
```

---

## Part 2: RevenueCat Setup

### Step 1: Create RevenueCat Account

1. Go to [https://app.revenuecat.com/signup](https://app.revenuecat.com/signup)
2. Sign up with email: `scale@getbyteworthy.com`
3. Verify email and complete onboarding

### Step 2: Create New App in RevenueCat

1. Click "Create new app"
2. **App Name:** Noor
3. **Bundle ID (iOS):** `com.noor.app`
4. **Package Name (Android):** `com.noor.app`

### Step 3: Get API Keys

Navigate to **Project Settings → API Keys**

You'll need two keys:

**Public API Key (Client-side):**
- Used in React Native app
- Safe to embed in app code
- Example: `appl_aBcDeFgHiJkLmNoPqRsTuVwXyZ`

**Secret API Key (Server-side):**
- Used for backend webhook verification
- **NEVER** embed in app code
- Store in environment variables only
- Example: `sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ`

### Step 4: Add API Keys to App

**File:** `client/lib/config.ts`

```typescript
export const REVENUECAT_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'YOUR_PUBLIC_KEY_HERE',
  // For iOS builds, this will be: appl_xxxxxxxxx
  // For Android builds, this will be: goog_xxxxxxxxx
};
```

**Environment Variables (.env):**
```bash
# RevenueCat Public API Key
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_aBcDeFgHiJkLmNoPqRsTuVwXyZ

# RevenueCat Secret Key (backend only)
REVENUECAT_SECRET_KEY=sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

---

## Part 3: App Store Connect IAP Products

### Step 1: Enable Paid Apps Agreement

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **Agreements, Tax, and Banking**
3. Complete **Paid Apps Agreement**:
   - Sign agreement
   - Add bank account information
   - Complete tax forms (W-9 for US, W-8BEN for non-US)

**CRITICAL:** You cannot create IAP products until this is complete.

### Step 2: Create Subscription Group

1. Go to **My Apps → Noor → In-App Purchases**
2. Click **+** next to "Subscription Groups"
3. **Reference Name:** Noor Premium Subscriptions
4. Click **Create**

### Step 3: Create Noor Plus Subscription

1. Inside the subscription group, click **+** (Add Subscription)
2. **Product ID:** `noor_plus_monthly`
3. **Reference Name:** Noor Plus Monthly
4. Click **Create**

**Subscription Duration:**
- Duration: **1 month**

**Subscription Prices:**
- Click **Add Pricing**
- **United States:** $6.99
- Click **Next**, review, and **Submit**

**Localization (US English):**
- **Subscription Display Name:** Noor Plus
- **Description:** Unlimited reflections, advanced insights, and pattern tracking. Your journey to clarity, unlimited.

**Review Information:**
- **Screenshot:** (Upload screenshot showing Plus features)
- **Review Notes:** Premium tier with unlimited reflections and advanced AI insights.

### Step 4: Create Noor Pro Subscription

Repeat the same process:
1. **Product ID:** `noor_pro_monthly`
2. **Reference Name:** Noor Pro Monthly
3. **Duration:** 1 month
4. **Price:** $11.99 USD
5. **Display Name:** Noor Pro
6. **Description:** Everything in Plus, plus priority support and early access to new features. Experience the full potential of Noor.

### Step 5: Set Subscription Levels

1. In your subscription group, drag and drop to set hierarchy:
   - **Level 1:** Noor Plus ($6.99)
   - **Level 2:** Noor Pro ($11.99)
2. This allows users to upgrade from Plus → Pro

---

## Part 4: RevenueCat Product Configuration

### Step 1: Create Entitlements

1. In RevenueCat dashboard, go to **Entitlements**
2. Click **+ New**
3. Create entitlement: `noor_plus_access`
   - Description: "Access to Noor Plus features"
4. Create entitlement: `noor_pro_access`
   - Description: "Access to Noor Pro features"

### Step 2: Configure Products in RevenueCat

1. Go to **Products** in RevenueCat
2. Click **+ New**

**Product 1: Noor Plus**
- **Product ID:** `noor_plus_monthly` (must match App Store Connect)
- **Store:** App Store (iOS)
- **Type:** Subscription
- **Entitlements:** `noor_plus_access`

**Product 2: Noor Pro**
- **Product ID:** `noor_pro_monthly`
- **Store:** App Store (iOS)
- **Type:** Subscription
- **Entitlements:** `noor_pro_access`, `noor_plus_access` (Pro includes Plus features)

### Step 3: Create Offerings

1. Go to **Offerings** in RevenueCat
2. Click **+ New Offering**
3. **Identifier:** `default`
4. **Description:** Default subscription offerings
5. Add products:
   - **Package 1:** `noor_plus_monthly`
   - **Package 2:** `noor_pro_monthly`
6. Save

---

## Part 5: App Code Integration

### Step 1: Initialize RevenueCat

**File:** `client/App.tsx` (or root component)

```typescript
import Purchases from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '@/lib/config';

// In your app initialization
useEffect(() => {
  async function initPurchases() {
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_CONFIG.apiKey });
    }
  }
  initPurchases();
}, []);
```

### Step 2: Check Subscription Status

**File:** `client/hooks/useSubscription.ts` (create this)

```typescript
import { useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export function useSubscription() {
  const [isPlusSubscriber, setIsPlusSubscriber] = useState(false);
  const [isProSubscriber, setIsProSubscriber] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      setIsProSubscriber(customerInfo.entitlements.active['noor_pro_access'] !== undefined);
      setIsPlusSubscriber(customerInfo.entitlements.active['noor_plus_access'] !== undefined);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return { isPlusSubscriber, isProSubscriber, isLoading, refresh: checkSubscription };
}
```

### Step 3: Display Paywall

Use the existing paywall component:
- **File:** `client/screens/PaywallScreen.tsx` (already exists)
- Update to fetch offerings from RevenueCat
- Handle purchase flow

---

## Part 6: Testing IAP

### Step 1: Sandbox Testing (Before Submission)

1. **Create Sandbox Tester Account**
   - Go to App Store Connect → Users and Access → Sandbox Testers
   - Click **+** to add tester
   - **Email:** Use a fresh email (e.g., `noor.test@icloud.com`)
   - **First/Last Name, Country:** Fill in
   - **Password:** Create strong password

2. **Sign Out of Real Apple ID on Device**
   - Settings → [Your Name] → Sign Out (on test device)

3. **Build and Install via TestFlight or Xcode**

4. **Make Test Purchase**
   - Open app
   - Navigate to paywall
   - Tap "Subscribe to Noor Plus"
   - Use **sandbox tester email** when prompted
   - Complete fake purchase (no real money charged)

### Step 2: Verify in RevenueCat

1. Go to RevenueCat dashboard → **Customers**
2. Find the test user
3. Verify subscription shows as active

---

## Part 7: Production Checklist

Before submitting to App Store:

- [ ] VALIDATION_MODE set to `false` in config.ts
- [ ] RevenueCat API key configured in .env
- [ ] Both IAP products created in App Store Connect
- [ ] Products have pricing for all territories
- [ ] Products linked in RevenueCat
- [ ] Offerings configured in RevenueCat
- [ ] Paid Apps Agreement signed
- [ ] Bank account and tax forms completed
- [ ] Sandbox testing completed successfully
- [ ] Paywall UI displays correct pricing
- [ ] Purchase flow works end-to-end
- [ ] Subscription status check works
- [ ] App description mentions subscription options
- [ ] Privacy Policy mentions subscription data handling

---

## Part 8: App Store Review Notes

**Add to App Review Notes:**

```
SUBSCRIPTION INFORMATION

This app offers optional in-app subscriptions:
- Noor Plus: $6.99/month (unlimited reflections and insights)
- Noor Pro: $11.99/month (all features plus priority support)

Subscriptions are managed through RevenueCat. The free tier allows 5 reflections per month.

Test Account: [Your sandbox tester email]
Password: [Your sandbox tester password]

To test premium features:
1. Sign in with test account
2. Tap "Upgrade" from Profile
3. Select Noor Plus or Pro
4. Complete purchase (sandbox mode, no charge)
5. Premium features will unlock immediately
```

---

## Troubleshooting

### Issue: Products Don't Load

**Symptoms:** Paywall shows "No products available"

**Solutions:**
1. Verify Bundle ID in RevenueCat matches `com.noor.app`
2. Check IAP products are "Ready to Submit" in App Store Connect
3. Wait 2-4 hours after creating products (Apple sync delay)
4. Verify API key is correct in config

### Issue: Purchase Fails

**Symptoms:** "Cannot connect to iTunes Store"

**Solutions:**
1. Verify device is signed in with sandbox tester account
2. Check internet connection
3. Verify products are approved in App Store Connect
4. Try logging out and back in with sandbox tester

### Issue: Subscription Not Recognized

**Symptoms:** Purchase completes but features don't unlock

**Solutions:**
1. Check entitlements are correctly configured in RevenueCat
2. Verify product IDs match exactly between App Store Connect and RevenueCat
3. Call `Purchases.syncPurchases()` to force sync
4. Check RevenueCat dashboard for customer subscription status

---

## Support Resources

- **RevenueCat Documentation:** [https://docs.revenuecat.com/](https://docs.revenuecat.com/)
- **RevenueCat Support:** support@revenuecat.com
- **Apple IAP Guide:** [https://developer.apple.com/in-app-purchase/](https://developer.apple.com/in-app-purchase/)
- **React Native IAP Plugin:** [https://github.com/RevenueCat/react-native-purchases](https://github.com/RevenueCat/react-native-purchases)

---

## Pricing Strategy Notes

### Why These Price Points?

- **$6.99/month (Plus):** Standard for journaling/self-improvement apps
- **$11.99/month (Pro):** Premium tier for power users, 70% markup is industry standard

### Free Tier Limits

- **5 reflections/month:** Enough to try the core experience
- **Basic AI responses:** No advanced insights or pattern tracking
- **Conversion Goal:** ~5-10% of users upgrade after 3+ sessions

### Future Considerations

- **Annual Plans:** Add discounted annual options (e.g., $59.99/year for Plus, 28% savings)
- **Lifetime Access:** One-time purchase option (e.g., $299.99)
- **Promo Codes:** Generate promo codes for early supporters, influencers

---

**STATUS:** Ready for implementation. Complete steps in order, test thoroughly before submission.
