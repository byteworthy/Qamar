# PHASE 1: STORE ACCOUNTS AND IDENTIFIERS

**Purpose:** Lock in app identity and unblock all downstream work  
**Created:** 2026-01-19  
**Status:** Not Started

---

## A. APPLE CHECKLIST

### Step 1: Verify Apple Developer Account
**Location:** https://developer.apple.com/account

- [ ] Log in with Apple ID
- [ ] Verify enrollment status shows "Active" with expiration date
- [ ] Note Team ID from Membership page
- [ ] If not enrolled: Start enrollment ($99/year), takes 24-48 hours

**Stop Point:** Cannot proceed without active Apple Developer enrollment

**Verification:** Screenshot the Membership page showing Team ID and expiration

---

### Step 2: Reserve Bundle Identifier
**Location:** https://developer.apple.com/account/resources/identifiers/list

- [ ] Click Identifiers → Plus button
- [ ] Select App IDs → Continue
- [ ] Select App → Continue
- [ ] Description: "Noor CBT App"
- [ ] Bundle ID: Select Explicit, enter `com.noor.app`
- [ ] Capabilities: Check In-App Purchase
- [ ] Click Continue → Register

**Stop Point:** If `com.noor.app` taken, choose alternative (e.g., `com.noorcbt.app`)

**Verification:** Bundle ID appears in Identifiers list

---

### Step 3: Create App in App Store Connect
**Location:** https://appstoreconnect.apple.com/apps

- [ ] Click Plus button → New App
- [ ] Platforms: iOS
- [ ] Name: "Noor"
- [ ] Primary Language: English (U.S.)
- [ ] Bundle ID: Select `com.noor.app` from dropdown
- [ ] SKU: `noor-ios-v1`
- [ ] User Access: Full Access
- [ ] Click Create

**Stop Point:** App must be created before subscription products

**Verification:** Note the Apple ID (numeric) shown in App Information → General

---

### Step 4: Create Subscription Group
**Location:** App Store Connect → Your App → Subscriptions

- [ ] Click Plus button next to Subscription Groups
- [ ] Reference Name: "Noor Subscriptions"
- [ ] Click Create
- [ ] Note the Subscription Group ID

**Verification:** Subscription group appears in left sidebar

---

### Step 5: Create Subscription Products
**Location:** App Store Connect → Your App → Subscriptions → Noor Subscriptions

**Product 1: Noor Plus Monthly**
- [ ] Click Plus button next to Subscriptions
- [ ] Reference Name: "Noor Plus Monthly"
- [ ] Product ID: `com.noor.plus.monthly`
- [ ] Subscription Duration: 1 Month
- [ ] Subscription Price: $6.99 USD (set for all territories)
- [ ] Display Name: "Noor Plus"
- [ ] Description: "Unlimited reflections, full history, basic insights"
- [ ] Click Save

**Product 2: Noor Plus Yearly**
- [ ] Reference Name: "Noor Plus Yearly"
- [ ] Product ID: `com.noor.plus.yearly`
- [ ] Subscription Duration: 1 Year
- [ ] Subscription Price: $69.00 USD
- [ ] Display Name: "Noor Plus (Annual)"
- [ ] Description: "Unlimited reflections, full history, basic insights - save 17%"

**Product 3: Noor Pro Monthly**
- [ ] Reference Name: "Noor Pro Monthly"
- [ ] Product ID: `com.noor.pro.monthly`
- [ ] Subscription Duration: 1 Month
- [ ] Subscription Price: $11.99 USD
- [ ] Display Name: "Noor Pro"
- [ ] Description: "All Plus features plus advanced insights and data export"

**Product 4: Noor Pro Yearly**
- [ ] Reference Name: "Noor Pro Yearly"
- [ ] Product ID: `com.noor.pro.yearly`
- [ ] Subscription Duration: 1 Year
- [ ] Subscription Price: $119.00 USD
- [ ] Display Name: "Noor Pro (Annual)"
- [ ] Description: "All Plus features plus advanced insights and data export - save 17%"

**Stop Point:** All 4 products must show status "Ready to Submit"

**Verification:** All products visible in Subscriptions section

---

### Step 6: Create Sandbox Tester
**Location:** App Store Connect → Users and Access → Sandbox → Testers

- [ ] Click Plus button
- [ ] First Name: Test
- [ ] Last Name: User
- [ ] Email: Use unique email you control (e.g., noor.test1@yourdomain.com)
- [ ] Password: Create strong password, note it
- [ ] Secret Question/Answer: Any
- [ ] Country: United States
- [ ] Click Invite

**Verification:** Tester appears in list, note email and password

---

## B. GOOGLE PLAY CHECKLIST

### Step 1: Verify Google Play Console Account
**Location:** https://play.google.com/console

- [ ] Log in with Google account
- [ ] Verify Developer account is active
- [ ] If not enrolled: Pay $25 one-time fee, takes minutes

**Stop Point:** Cannot proceed without active Play Console account

**Verification:** Dashboard shows "All apps" option

---

### Step 2: Create App
**Location:** https://play.google.com/console → All Apps

- [ ] Click Create app
- [ ] App name: "Noor"
- [ ] Default language: English (United States)
- [ ] App or game: App
- [ ] Free or paid: Free
- [ ] Check Developer Program Policies declaration
- [ ] Check US export laws declaration
- [ ] Click Create app

**Stop Point:** App entry must exist before products

**Verification:** Note the numeric App ID from URL or app overview

---

### Step 3: Verify Package Name
**Location:** Play Console → Your App → Release → Production → Create new release (or view existing)

The package name is set on first upload. Since we haven't uploaded yet:
- [ ] Confirm app.json has `"package": "com.noor.app"`
- [ ] First AAB upload will lock this package name

**Note:** Package name cannot be changed after first upload

**Verification:** app.json shows correct package

---

### Step 4: Create Subscription Products
**Location:** Play Console → Your App → Monetize → Products → Subscriptions

**Product 1: Noor Plus Monthly**
- [ ] Click Create subscription
- [ ] Product ID: `noor_plus_monthly`
- [ ] Name: "Noor Plus"
- [ ] Description: "Unlimited reflections, full history, basic insights"
- [ ] Click Create subscription
- [ ] Add base plan:
  - Base plan ID: `plus-monthly`
  - Billing period: 1 Month
  - Price: $6.99 USD (set for all countries)
- [ ] Activate base plan

**Product 2: Noor Plus Yearly**
- [ ] Product ID: `noor_plus_yearly`
- [ ] Name: "Noor Plus (Annual)"
- [ ] Description: "Unlimited reflections, full history, basic insights - save 17%"
- [ ] Base plan ID: `plus-yearly`
- [ ] Billing period: 1 Year
- [ ] Price: $69.00 USD

**Product 3: Noor Pro Monthly**
- [ ] Product ID: `noor_pro_monthly`
- [ ] Name: "Noor Pro"
- [ ] Description: "All Plus features plus advanced insights and data export"
- [ ] Base plan ID: `pro-monthly`
- [ ] Billing period: 1 Month
- [ ] Price: $11.99 USD

**Product 4: Noor Pro Yearly**
- [ ] Product ID: `noor_pro_yearly`
- [ ] Name: "Noor Pro (Annual)"
- [ ] Description: "All Plus features plus advanced insights and data export - save 17%"
- [ ] Base plan ID: `pro-yearly`
- [ ] Billing period: 1 Year
- [ ] Price: $119.00 USD

**Stop Point:** All 4 subscriptions must show "Active" status

**Verification:** All products visible with active base plans

---

### Step 5: Set Up License Testing
**Location:** Play Console → Settings → License testing

- [ ] Add your email address(es) to License testers
- [ ] Set License response: RESPOND_NORMALLY

**Verification:** Email appears in testers list

---

### Step 6: Upload First Build (Internal Testing)
**Location:** Play Console → Your App → Release → Testing → Internal testing

**Note:** This is required to lock package name and enable product testing

- [ ] Create internal testing track (if not exists)
- [ ] Create new release
- [ ] Upload AAB built with: `npx eas build --profile production --platform android`
- [ ] This locks `com.noor.app` as the package name
- [ ] Add release notes: "Internal testing build"
- [ ] Review and roll out to internal testers

**Stop Point:** Package name is now permanently locked

**Verification:** Internal testing shows active release

---

## C. DEFINITIVE LIST OF IDS AND SKUS

### iOS Product IDs (Apple)
```
com.noor.plus.monthly     → $6.99/month
com.noor.plus.yearly      → $69.00/year
com.noor.pro.monthly      → $11.99/month
com.noor.pro.yearly       → $119.00/year
```

### Android Product IDs (Google)
```
noor_plus_monthly         → $6.99/month  (base plan: plus-monthly)
noor_plus_yearly          → $69.00/year  (base plan: plus-yearly)
noor_pro_monthly          → $11.99/month (base plan: pro-monthly)
noor_pro_yearly           → $119.00/year (base plan: pro-yearly)
```

### SKU Mapping Table
| Tier | Period | iOS Product ID | Android Product ID | Price |
|------|--------|----------------|-------------------|-------|
| Plus | Monthly | com.noor.plus.monthly | noor_plus_monthly | $6.99 |
| Plus | Yearly | com.noor.plus.yearly | noor_plus_yearly | $69.00 |
| Pro | Monthly | com.noor.pro.monthly | noor_pro_monthly | $11.99 |
| Pro | Yearly | com.noor.pro.yearly | noor_pro_yearly | $119.00 |

---

## D. SINGLE SOURCE OF TRUTH TABLE

**Fill in during execution:**

| Field | Value |
|-------|-------|
| **App Identity** | |
| App Name | Noor |
| App Display Name | Noor |
| **Apple** | |
| Bundle ID | com.noor.app |
| Team ID | [FILL: from developer.apple.com Membership] |
| App Store Connect App ID | [FILL: numeric ID from app info] |
| Subscription Group Name | Noor Subscriptions |
| Subscription Group ID | [FILL: from subscription group] |
| iOS Plus Monthly ID | com.noor.plus.monthly |
| iOS Plus Yearly ID | com.noor.plus.yearly |
| iOS Pro Monthly ID | com.noor.pro.monthly |
| iOS Pro Yearly ID | com.noor.pro.yearly |
| Sandbox Tester Email | [FILL: test email created] |
| **Google** | |
| Package Name | com.noor.app |
| Play Console App ID | [FILL: numeric from URL] |
| Android Plus Monthly ID | noor_plus_monthly |
| Android Plus Yearly ID | noor_plus_yearly |
| Android Pro Monthly ID | noor_pro_monthly |
| Android Pro Yearly ID | noor_pro_yearly |
| License Tester Email | [FILL: email added to testing] |
| **EAS** | |
| EAS Account | [FILL: from `eas whoami`] |
| EAS Project ID | [FILL: from `eas project:info`] |

---

## E. SCREENSHOTS AND SETTINGS TO CAPTURE

Capture these for later phases and as backup:

### Apple
1. **Membership page** - Shows Team ID and expiration
2. **Identifiers page** - Shows Bundle ID registered
3. **App Store Connect app page** - Shows App ID
4. **Subscription group page** - Shows all 4 products with status
5. **Sandbox testers page** - Shows tester created

### Google
1. **Play Console dashboard** - Shows account active
2. **App dashboard** - Shows App ID in URL
3. **Subscriptions page** - Shows all 4 products with Active status
4. **License testing page** - Shows testers added
5. **Internal testing page** - Shows release with package name

### EAS
1. **Terminal output** of `eas whoami`
2. **Terminal output** of `eas project:info`

---

## F. PHASE 1 COMPLETION CONFIRMATION TEMPLATE

Once complete, fill in and save this confirmation:

```
=== PHASE 1 COMPLETION CONFIRMATION ===
Date Completed: [DATE]

APPLE CONFIRMATION:
- Bundle ID reserved: com.noor.app [YES/NO]
- Team ID: [PASTE VALUE]
- App Store Connect App ID: [PASTE VALUE]
- Subscription products created: [4/4]
- Sandbox tester created: [EMAIL]

GOOGLE CONFIRMATION:
- Package name locked: com.noor.app [YES/NO]
- Play Console App ID: [PASTE VALUE]
- Subscription products created: [4/4]
- License tester added: [EMAIL]

EAS CONFIRMATION:
- EAS account: [PASTE OUTPUT OF eas whoami]
- EAS project ID: [PASTE VALUE]

BLOCKERS (if any):
- [List any issues encountered]

READY FOR PHASE 2: [YES/NO]
```

---

## G. TROUBLESHOOTING

### Bundle ID Already Taken (Apple)
- Try: `com.noorcbt.app`
- Update app.json `ios.bundleIdentifier` to match
- Update this document with new ID

### Package Name Already Taken (Google)
- Try: `com.noorcbt.app`
- Update app.json `android.package` to match
- Update this document with new ID
- Note: You must choose before first upload; cannot change after

### Subscription Product Creation Fails
- Ensure app is created first
- Check that Bundle ID / Package is registered
- Wait 10-15 minutes after app creation

### EAS Not Linked
- Run: `eas login`
- Run: `eas project:init`
- Ensure you're in correct directory

---

**End of Phase 1 Checklist**
