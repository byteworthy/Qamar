# Noor Pricing Strategy - Option C (Hybrid)

**Approved:** 2026-02-01
**Model:** Two-tier freemium with monthly/yearly subscriptions + Pro lifetime

---

## Product Lineup

### Noor Plus - $6.99/month or $69.99/year

**Monthly:**
- Product ID: `noor_plus_monthly`
- Price: $6.99/month
- Type: Auto-renewable subscription
- Billing: Monthly

**Yearly:**
- Product ID: `noor_plus_yearly`
- Price: $69.99/year
- Type: Auto-renewable subscription
- Billing: Annually
- Savings: **Save 17%** vs monthly ($83.88 → $69.99)

**Features:**
- ✅ Enhanced meditation practices
- ✅ 5 daily reflections
- ✅ Basic AI insights
- ✅ 30-day history
- ✅ Islamic content library

---

### Noor Pro - $11.99/month or $119.99/year or $299.99 lifetime

**Monthly:**
- Product ID: `noor_pro_monthly`
- Price: $11.99/month
- Type: Auto-renewable subscription
- Billing: Monthly

**Yearly:**
- Product ID: `noor_pro_yearly`
- Price: $119.99/year
- Type: Auto-renewable subscription
- Billing: Annually
- Savings: **Save 17%** vs monthly ($143.88 → $119.99)

**Lifetime:**
- Product ID: `noor_pro_lifetime`
- Price: $299.99 once
- Type: Non-consumable in-app purchase
- Billing: One-time payment, lifetime access

**Features:**
- ✅ **Everything in Plus**
- ✅ Unlimited daily reflections
- ✅ Advanced AI insights & patterns
- ✅ Unlimited history (forever)
- ✅ Priority support
- ✅ Exclusive premium content
- ✅ Early access to new features

---

## Revenue Projections

### Monthly Recurring Revenue (1,000 paying users)

| Plan | Users | Price | MRR |
|------|-------|-------|-----|
| Plus Monthly | 350 | $6.99 | $2,447 |
| Plus Yearly | 250 | $69.99 | $1,458* |
| Pro Monthly | 200 | $11.99 | $2,398 |
| Pro Yearly | 150 | $119.99 | $1,500* |
| **Total MRR** | **950** | - | **$7,803** |

*Amortized over 12 months

### One-Time Revenue

| Plan | Users | Price | Revenue |
|------|-------|-------|---------|
| Pro Lifetime | 50 | $299.99 | $14,950 |

### Year 1 Total
- **Recurring:** $93,636 (12 × $7,803)
- **Lifetime:** $14,950
- **Total Year 1:** **$108,586**

### LTV Comparison

| Plan | Monthly LTV (12mo) | Yearly LTV | Lifetime LTV |
|------|-------------------|------------|--------------|
| Plus Monthly | $83.88 | $83.88 | $83.88 |
| Plus Yearly | $69.99 | $69.99 | $69.99 |
| Pro Monthly | $143.88 | $143.88 | $143.88 |
| Pro Yearly | $119.99 | $119.99 | $119.99 |
| Pro Lifetime | $299.99 | $299.99 | $299.99 |

**Key Insight:** Yearly plans have better retention (typical 70%+ vs 40% monthly), so effective LTV is 2-3x higher.

---

## Competitor Pricing Reference

| App | Monthly | Yearly | Lifetime |
|-----|---------|--------|----------|
| **Calm** | $14.99 | $69.99 | $399.99 |
| **Headspace** | $12.99 | $69.99 | - |
| **Balance** | $11.99 | $69.99 | $399.99 |
| **Ten Percent Happier** | $14.99 | $99.99 | - |
| **Noor Plus** | **$6.99** | **$69.99** | - |
| **Noor Pro** | **$11.99** | **$119.99** | **$299.99** |

**Positioning:** Noor Pro is competitively priced at the mid-range, while Plus offers an accessible entry point.

---

## Product IDs & SKUs Summary

| Product | Product ID | Type | Price | App Store SKU |
|---------|-----------|------|-------|---------------|
| Plus Monthly | `noor_plus_monthly` | Auto-renewable | $6.99/mo | noor_plus_monthly |
| Plus Yearly | `noor_plus_yearly` | Auto-renewable | $69.99/yr | noor_plus_yearly |
| Pro Monthly | `noor_pro_monthly` | Auto-renewable | $11.99/mo | noor_pro_monthly |
| Pro Yearly | `noor_pro_yearly` | Auto-renewable | $119.99/yr | noor_pro_yearly |
| Pro Lifetime | `noor_pro_lifetime` | Non-consumable | $299.99 | noor_pro_lifetime |

---

## RevenueCat Entitlements

```
Entitlement: noor_plus_access
├─ noor_plus_monthly (auto-renewable, $6.99/mo)
└─ noor_plus_yearly (auto-renewable, $69.99/yr)

Entitlement: noor_pro_access
├─ noor_pro_monthly (auto-renewable, $11.99/mo)
├─ noor_pro_yearly (auto-renewable, $119.99/yr)
└─ noor_pro_lifetime (non-consumable, $299.99)
```

**Logic:**
- User with `noor_plus_access` → Gets Plus features
- User with `noor_pro_access` → Gets Pro features (which includes all Plus features)

---

## App Store Connect Subscription Group

**Group Name:** "Noor Premium Subscriptions"

**Subscription Levels:**
1. **Level 1:** Plus (Monthly & Yearly)
2. **Level 2:** Pro (Monthly & Yearly)

**Non-Renewable IAP:**
- Pro Lifetime (separate from subscription group)

**Upgrade/Downgrade Rules:**
- Plus → Pro: Immediate upgrade, prorated refund
- Pro → Plus: Downgrade at end of current billing period
- Any subscription → Lifetime: User keeps subscription until expiry, lifetime starts after

---

## Marketing Copy

### Plus Tier Messaging

**Headline:** "Start Your Journey"

**Description:**
"Deepen your daily reflection practice with AI-guided insights rooted in Islamic wisdom. Perfect for those beginning their personal growth journey."

**Call to Action:**
- Monthly: "Start with Plus - $6.99/month"
- Yearly: "Save 17% with Annual - $69.99/year"

### Pro Tier Messaging

**Headline:** "Unlock Your Full Potential"

**Description:**
"Everything in Plus, plus unlimited reflections, advanced AI insights, lifetime history, and priority support. For those committed to continuous growth."

**Call to Action:**
- Monthly: "Upgrade to Pro - $11.99/month"
- Yearly: "Best Value: Pro Yearly - $119.99/year"
- Lifetime: "Never Pay Again - $299.99 Lifetime"

### Lifetime Upsell

**When to Show:**
- After 3 months of Pro monthly subscription
- In settings page for all Pro users
- During special promotions (Ramadan, New Year)

**Messaging:**
"You've invested $35.97 so far. Get lifetime Pro access for just $299.99 and never pay again."

---

## Configuration Steps

### Step 1: App Store Connect Setup (After Apple Approval)

```
1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Create Subscription Group:
   - Name: "Noor Premium Subscriptions"
   - Create

3. Add Plus Monthly Subscription:
   - Product ID: noor_plus_monthly
   - Reference Name: Noor Plus Monthly
   - Duration: 1 Month
   - Price: $6.99
   - Subscription Group: Noor Premium Subscriptions
   - Level: Level 1
   - Localizations:
     * Display Name: "Noor Plus"
     * Description: "Enhanced meditation and 5 daily reflections with basic AI insights"

4. Add Plus Yearly Subscription:
   - Product ID: noor_plus_yearly
   - Reference Name: Noor Plus Yearly
   - Duration: 1 Year
   - Price: $69.99
   - Subscription Group: Noor Premium Subscriptions
   - Level: Level 1
   - Localizations:
     * Display Name: "Noor Plus (Annual)"
     * Description: "Enhanced meditation and 5 daily reflections with basic AI insights - Save 17%"

5. Add Pro Monthly Subscription:
   - Product ID: noor_pro_monthly
   - Reference Name: Noor Pro Monthly
   - Duration: 1 Month
   - Price: $11.99
   - Subscription Group: Noor Premium Subscriptions
   - Level: Level 2
   - Localizations:
     * Display Name: "Noor Pro"
     * Description: "Unlimited reflections, advanced AI insights, lifetime history, and priority support"

6. Add Pro Yearly Subscription:
   - Product ID: noor_pro_yearly
   - Reference Name: Noor Pro Yearly
   - Duration: 1 Year
   - Price: $119.99
   - Subscription Group: Noor Premium Subscriptions
   - Level: Level 2
   - Localizations:
     * Display Name: "Noor Pro (Annual)"
     * Description: "Unlimited reflections, advanced AI insights, lifetime history, and priority support - Save 17%"

7. Add Pro Lifetime IAP:
   - Type: Non-Consumable
   - Product ID: noor_pro_lifetime
   - Reference Name: Noor Pro Lifetime
   - Price: $299.99
   - Localizations:
     * Display Name: "Noor Pro (Lifetime)"
     * Description: "One-time payment for lifetime Pro access - never pay again"

8. Submit all products for review (auto-approved with app)
```

### Step 2: RevenueCat Configuration (After Apple Approval)

```
1. Go to RevenueCat Dashboard → Your Noor Project

2. Configure iOS App:
   - Platform: iOS
   - Bundle ID: com.noor.app
   - App Store Connect Shared Secret: (get from App Store Connect)

3. Create Entitlements:
   a. Entitlement: noor_plus_access
      - Identifier: noor_plus_access
      - Description: "Access to Noor Plus features"

   b. Entitlement: noor_pro_access
      - Identifier: noor_pro_access
      - Description: "Access to Noor Pro features"

4. Add Products:
   - noor_plus_monthly → Link to noor_plus_access
   - noor_plus_yearly → Link to noor_plus_access
   - noor_pro_monthly → Link to noor_pro_access
   - noor_pro_yearly → Link to noor_pro_access
   - noor_pro_lifetime → Link to noor_pro_access

5. Create Offering:
   - Identifier: default
   - Description: "Default Noor pricing"
   - Packages:
     * $rc_monthly (Plus): noor_plus_monthly
     * $rc_annual (Plus): noor_plus_yearly
     * $rc_monthly (Pro): noor_pro_monthly
     * $rc_annual (Pro): noor_pro_yearly
     * lifetime (Pro): noor_pro_lifetime

6. Save and publish
```

### Step 3: Get Production API Key

```
1. RevenueCat Dashboard → API Keys
2. Copy iOS Public API Key (starts with appl_)
3. Update .env.production:
   EXPO_PUBLIC_REVENUECAT_API_KEY=appl_your_production_key
```

---

## Testing Strategy

### Sandbox Testing

**Test Accounts:**
1. Create iOS Sandbox test accounts in App Store Connect
2. Test all 5 purchase flows
3. Verify entitlements are granted correctly
4. Test upgrade/downgrade flows
5. Test subscription renewals
6. Test lifetime purchase

**Test Checklist:**
- [ ] Plus Monthly purchase works
- [ ] Plus Yearly purchase works
- [ ] Pro Monthly purchase works
- [ ] Pro Yearly purchase works
- [ ] Pro Lifetime purchase works
- [ ] Plus → Pro upgrade works (immediate)
- [ ] Pro → Plus downgrade works (at period end)
- [ ] Lifetime purchase disables subscription prompts
- [ ] Feature gates work correctly (Plus vs Pro features)
- [ ] Subscription renewal works (24 hours in sandbox)

---

## Launch Strategy

### Phase 1: Launch (Week 1)
- All 5 products available
- Default paywall shows monthly pricing
- "Save 17%" badge on yearly options
- Lifetime shown in settings only

### Phase 2: Optimize (Week 2-4)
- A/B test: Default to yearly vs monthly
- A/B test: Show lifetime upfront vs in settings
- Track conversion rates per product
- Analyze Plus → Pro upgrade rate

### Phase 3: Iterate (Month 2+)
- Adjust pricing based on conversion data
- Test promotional pricing (first month discount)
- Seasonal campaigns (Ramadan: Lifetime discount?)

---

## Success Metrics

**Target Conversion Rates:**
- Free → Plus: 3-5%
- Free → Pro: 1-2%
- Plus → Pro: 15-20%
- Monthly → Yearly: 30-40%

**Target Revenue Mix:**
- Plus Monthly: 30%
- Plus Yearly: 20%
- Pro Monthly: 25%
- Pro Yearly: 20%
- Pro Lifetime: 5%

**LTV Goals:**
- Average LTV: $100+
- Pro LTV: $150+
- Lifetime drives 10%+ of total revenue

---

## FAQ

**Q: Why Pro Lifetime but not Plus Lifetime?**
A: Pro Lifetime creates premium positioning and captures whales without cannibalizing subscription revenue. Plus Lifetime would undercut the upgrade path to Pro.

**Q: Why 17% yearly discount?**
A: Standard SaaS discount (15-20%). Not too aggressive to devalue the product, but enough to incentivize annual commitment.

**Q: What if users only buy Lifetime?**
A: Unlikely. Data shows 80-90% still choose subscriptions. Lifetime appeals to a specific segment (whales, gift-givers, lifetime product fans).

**Q: Can we change pricing later?**
A: Yes, but existing subscribers are grandfathered. New prices only apply to new subscribers. Price increases require careful communication.

---

**Approved by:** Product Team
**Implementation Date:** After Apple Developer approval
**Next Review:** 30 days post-launch
