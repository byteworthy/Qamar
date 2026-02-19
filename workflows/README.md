# Noor Freemium-to-Paid Conversion Workflow

**Status**: Production Ready
**Last Updated**: 2026-02-17
**Maintainer**: Kevin Richards (@byteworthy)

---

## Quick Start

### What is This?

This is an **end-to-end n8n workflow** that automates Noor's freemium-to-paid conversion funnel. It:

1. **Monitors** new user signups
2. **Tracks** user behavior over 7 days (verses memorized, hifz initiation, session duration)
3. **Evaluates** if user is ready to upgrade (5+ consecutive days active AND (10+ verses OR hifz started))
4. **Personalizes** upgrade offer using Claude Haiku AI
5. **Sends** push notification + in-app modal
6. **Converts** via Stripe
7. **Logs** conversion to Airtable + updates Firebase

**Expected ROI**: 35-45% conversion rate for ready users; ~$0.05 cost per conversion.

---

## Files Included

### 1. `n8n-freemium-conversion-automation.json`
Complete n8n workflow export. Import this into your n8n instance.

**Key Features**:
- Firebase trigger (new signup webhook)
- 7-day delay + behavior signal collection
- Claude Haiku personalization ($0.001 per call)
- Stripe payment webhook handler
- Airtable cohort logging
- Segment analytics tracking

**Nodes**: 23 total
- 1 Webhook trigger (Firebase signup)
- 2 Data extraction nodes
- 1 7-day delay
- 1 Firestore query
- 1 Behavior analysis (JavaScript)
- 1 Conditional router
- 1 Claude Haiku personalization
- 1 Push notification sender
- 1 Stripe webhook listener
- 1 Stripe event processor
- 1 Conditional (purchase check)
- 6 Conversion path nodes (Airtable, email, Firebase, Segment)
- 5 Re-engagement path nodes (email, Airtable, Firebase, Segment)

---

### 2. `N8N_WORKFLOW_DEPLOYMENT_GUIDE.md`
Step-by-step guide to deploy and operate the workflow.

**Sections**:
- Prerequisites & credential setup
- Installation (Docker Compose or n8n Cloud)
- Node-by-node deep dive
- Environment variables
- Testing & validation
- Monitoring & troubleshooting
- Cost optimization

**Time to Deploy**: 2-4 hours

---

### 3. `NOOR_BACKEND_INTEGRATION.md`
Backend code changes needed to support the workflow.

**Requirements**:
- Activity logging service (Firebase Firestore)
- Push notification API endpoint (Expo SDK)
- Stripe webhook receiver
- Firebase user metadata updates

**Time to Implement**: 6 hours

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  NOOR APP (React Native)                    │
├─────────────────────────────────────────────────────────────┤
│  • User signup                                              │
│  • Activity logging (verse_opened, hifz_started, etc.)     │
│  • Push notification handler                               │
│  • In-app modal display + purchase trigger                │
└────────────┬────────────────────────────┬──────────────────┘
             │                            │
             ▼                            ▼
     ┌──────────────┐         ┌──────────────────┐
     │   Firebase   │         │  Noor Backend    │
     │  (Firestore) │         │  (Express.js)    │
     │ • Users      │         │ • Activity logs  │
     │ • Activity   │         │ • Notifications  │
     │ • Conversions│         │ • Webhook routes │
     └──────┬───────┘         └────────┬─────────┘
            │                         │
            │    ┌────────────────────┴────────────┐
            │    │                                 │
            ▼    ▼                                 ▼
    ┌─────────────────────────────────────────────────┐
    │              N8N WORKFLOW                       │
    │  (Freemium Conversion Automation)               │
    │                                                 │
    │  Node Flow:                                     │
    │  1. Firebase Webhook (signup)                  │
    │  2. Extract metadata + 7-day wait               │
    │  3. Query user activity                         │
    │  4. Analyze signals                             │
    │  5. Route: Ready vs Re-engagement               │
    │  6. Claude Haiku personalization                │
    │  7. Push notification                           │
    │  8. Stripe webhook handler                      │
    │  9. Conversion logging                          │
    └─────────────────────────────────────────────────┘
            │
   ┌────────┴────────┬────────┐
   ▼                 ▼        ▼
┌────────┐  ┌──────────────┐  ┌─────────┐
│Airtable│  │ Segment      │  │ Firebase│
│(Cohort)│  │(Analytics)   │  │(Updated)│
└────────┘  └──────────────┘  └─────────┘
```

---

## Integration Points

### Input: Firebase Webhook (Signup Event)
```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "displayName": "Ahmed",
  "createdAt": "2026-02-17T10:30:00Z"
}
```

### Input: Firestore Activity Data
```json
{
  "userId": "user_123",
  "activity_type": "hifz_started",
  "sessionDuration": 1800,
  "timestamp": "2026-02-24T14:00:00Z"
}
```

### Output: Airtable Conversion Log
```
User ID | Email | Signup Date | Days Active | Verses | Hifz | Status | Amount
user_123 | user@... | 2/17 | 6 | 15 | true | Converted | $5.97
```

### Output: Firebase Updated User
```json
{
  "subscription_status": "premium",
  "subscription_tier": "plus_monthly",
  "conversion_date": "2026-02-24T15:00:00Z",
  "freemium_days_active": 6,
  "conversion_source": "n8n_freemium_workflow"
}
```

---

## Cost Breakdown

| Component | Cost per Conversion |
|-----------|-------------------|
| Claude Haiku (personalization) | $0.001 |
| Firebase Firestore (queries + writes) | $0.0005 |
| Stripe API | Free |
| Airtable API | Free (within quota) |
| Segment events | Free (within quota) |
| n8n execution | $0.02-0.05 |
| **Total per Conversion** | **~$0.05** |

**Monthly Cost (300 conversions)**:
- Haiku calls: $0.30
- Firestore: $0.15
- n8n executions: $6-15
- **Total: ~$7-15/month**

---

## Success Metrics

### Target Benchmarks (First 30 Days)

| Metric | Target | Notes |
|--------|--------|-------|
| Signups processed | 100+ | Through n8n |
| Conversion-ready users | 35-45% | Meet 5-day + engagement criteria |
| Conversion rate | 30-40% | Of ready users → purchase |
| Re-engagement opens | 10-20% | Email click-through |
| Cost per conversion | <$0.10 | Full-stack including infrastructure |
| LTV | $5.97+/conversion | 3-month plan; future annual subs improve |

### Monitoring Dashboard (in Airtable)

Create a formula view:
```
Conversion Rate = COUNTA({Converted}) / COUNTA({All Users})
Re-engagement Rate = COUNTA({Re-engagement}) / COUNTA({Non-Conversion})
Cost per Conversion = Total Costs / Conversions
```

---

## Deployment Checklist

### Prerequisites
- [ ] Firebase project with Firestore enabled
- [ ] Anthropic Claude API key
- [ ] Stripe account with webhook configured
- [ ] Noor backend deployed + supporting endpoints
- [ ] Airtable workspace + tables created
- [ ] n8n instance (cloud or self-hosted)

### Deployment
- [ ] Set environment variables in n8n
- [ ] Import workflow JSON
- [ ] Test Firebase webhook connectivity
- [ ] Test Claude Haiku API
- [ ] Test Stripe webhook signature
- [ ] Test Airtable connection
- [ ] Trigger synthetic user signup
- [ ] Verify end-to-end flow
- [ ] Monitor logs for 24 hours
- [ ] Launch to 1% of signups
- [ ] Scale to 100% after validation

### Post-Launch
- [ ] Set up Slack alerts for failures
- [ ] Daily monitoring of conversion metrics
- [ ] Weekly review of personalization messages
- [ ] Monthly cost analysis + optimization

---

## Troubleshooting

### Workflow Not Triggering
**Cause**: Firebase webhook not connected
**Fix**: Verify webhook URL in Noor backend. Test with `curl`.

### Haiku Calls Failing
**Cause**: API key invalid or quota exceeded
**Fix**: Rotate API key in Anthropic console. Check usage dashboard.

### Airtable Not Logging Conversions
**Cause**: Base ID incorrect or table schema mismatch
**Fix**: Verify `AIRTABLE_BASE_ID` and table field names.

### Push Notifications Not Sending
**Cause**: User's push tokens empty in Firebase
**Fix**: Ensure Noor app saves `pushToken` to Firebase on startup.

---

## Optimization Ideas (Future)

1. **Segment-Based Offers**
   - Different offers for "Quran learners" vs. "hifz enthusiasts"
   - Track separate cohorts

2. **A/B Testing**
   - Vary offer price ($0.99 vs $1.99 vs $2.99)
   - Different Claude prompts for personalization
   - Measure impact on conversion rate

3. **Re-engagement Follow-ups**
   - Send Day 10 reminder to non-converted users
   - Offer extended trial (7 days free + 3 months $1.99)
   - Higher discount for winter/summer peaks

4. **Premium Upsell**
   - After 3-month Plus user converts to annual plan ($19.99)
   - Different n8n workflow triggered at 2-month mark

5. **Cohort Analytics**
   - Track LTV by signup source
   - Track LTV by first activity type
   - Optimize messaging by cohort

---

## Support & Maintenance

### Weekly Tasks
- [ ] Check workflow execution history for errors
- [ ] Monitor conversion rate trends
- [ ] Review Airtable for data quality

### Monthly Tasks
- [ ] Calculate cohort LTV
- [ ] Optimize Claude prompts based on click-through
- [ ] Review and adjust targeting criteria
- [ ] Plan A/B tests

### Quarterly Tasks
- [ ] Full ROI analysis
- [ ] Cost optimization review
- [ ] Update targeting based on learnings
- [ ] Plan next iteration (advanced segmentation, etc.)

---

## Quick Links

- **n8n Workflow**: `n8n-freemium-conversion-automation.json`
- **Deployment Guide**: `N8N_WORKFLOW_DEPLOYMENT_GUIDE.md`
- **Backend Integration**: `NOOR_BACKEND_INTEGRATION.md`
- **Noor App**: `/Users/kevinrichards/projects/noor`
- **Noor Firebase**: `https://console.firebase.google.com/project/noor-app-production`
- **Stripe Dashboard**: `https://dashboard.stripe.com/`
- **Airtable Base**: `https://airtable.com/app/appNoorAnalytics2026`
- **Segment Workspace**: `https://app.segment.com/`

---

## FAQ

**Q: What if a user doesn't meet conversion criteria?**
A: They receive a re-engagement email. If they re-engage and meet criteria later, they'll be targeted in the next cycle.

**Q: Can I change the 7-day window?**
A: Yes. In Node 3, modify the "Wait" duration. Shorter windows (3-5 days) may work better; longer windows (10+ days) capture more engaged users but delay conversion.

**Q: How much does this cost per user?**
A: ~$0.05 per conversion. Most users (65%) never reach the upgrade offer, so the cost is low. For paying customers, CPA is extremely attractive (~$0.05 for $5.97 LTV on 3-month plan).

**Q: Can I use different AI models?**
A: Yes. Claude Opus is faster but more expensive; Claude Sonnet is middle ground. For personalization, Haiku is ideal (fast, cheap, sufficient quality).

**Q: What's the expected payback period?**
A: With $5.97 first purchase and 35% conversion rate, you break even on infrastructure costs (~$5/month) in one month. If users upgrade to annual ($19.99), payback is under 2 weeks.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-17 | Initial release: 23-node workflow, Haiku personalization, Stripe + Airtable integration |

---

**Created by**: Kevin Richards (@DevyKev_Bot)
**For**: Noor App (Islamic Companion)
**Project**: Freemium-to-Paid Conversion Automation (Phase 6)
**Status**: Production Ready for Deployment

---

## Next Steps

1. **Review** this workflow with product/engineering team
2. **Deploy** to n8n (follow `N8N_WORKFLOW_DEPLOYMENT_GUIDE.md`)
3. **Implement** backend changes (follow `NOOR_BACKEND_INTEGRATION.md`)
4. **Test** end-to-end with 10 synthetic users
5. **Launch** to 1% of live signups
6. **Monitor** for 1 week, then scale to 100%
7. **Optimize** based on data

**Estimated Time to Production**: 2-3 weeks (1 week deployment + testing, 1 week monitoring + optimization, 1 week full rollout).

---

**Questions? Contact**: support@byteworthy.com or @DevyKev_Bot on Telegram
