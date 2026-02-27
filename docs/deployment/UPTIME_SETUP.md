# Uptime Monitoring Quick Start

**Purpose**: Step-by-step guide to set up free uptime monitoring  
**Last Updated**: 2026-01-20

---

## Recommended: UptimeRobot (Free Tier)

UptimeRobot offers 50 monitors free with 5-minute check intervals.

### Step 1: Create Account

1. Go to https://uptimerobot.com
2. Click "Register for FREE"
3. Create account with email

### Step 2: Add Health Check Monitor

1. Click "Add New Monitor"
2. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Qamar API Health
   - **URL**: `https://your-api-domain.com/health`
   - **Monitoring Interval**: 5 minutes
3. Click "Create Monitor"

### Step 3: Add Keyword Monitor (Optional)

This verifies the response contains expected data:

1. Click "Add New Monitor"
2. Configure:
   - **Monitor Type**: Keyword
   - **Friendly Name**: Qamar API Content Check
   - **URL**: `https://your-api-domain.com/health`
   - **Keyword Type**: Keyword should exist
   - **Keyword**: `"status":"ok"`
   - **Monitoring Interval**: 5 minutes
3. Click "Create Monitor"

### Step 4: Configure Alerts

1. Go to "My Settings" → "Alert Contacts"
2. Add contacts:
   - **Email**: Your team email
   - **Slack Webhook**: (optional) Paste Slack webhook URL
   - **SMS**: (Pro feature)
3. Save contacts

### Step 5: Assign Alerts to Monitors

1. Edit each monitor
2. Under "Alert Contacts", check the contacts to notify
3. Save

---

## Alternative: Better Uptime (Free Tier)

Better Uptime offers unlimited monitors with 3-minute checks.

### Setup Steps

1. Go to https://betteruptime.com
2. Create free account
3. Add monitor:
   - **URL**: `https://your-api-domain.com/health`
   - **Check frequency**: 3 minutes
   - **Timeout**: 30 seconds (for AI endpoints)
4. Add team members for alerts

---

## Health Endpoint Verification

Before adding monitors, verify your health endpoint works:

```bash
# Local
curl http://localhost:5000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-01-20T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 123.45,
  "checks": {
    "database": { "configured": true, "connected": true },
    "ai": { "configured": true },
    "sentry": { "configured": false },
    "rateLimit": { "enabled": false }
  }
}

# Production (replace with your domain)
curl https://your-api-domain.com/health
```

---

## Monitors to Create

| Name | URL | Interval | Alert After |
|------|-----|----------|-------------|
| API Health | `/health` | 5 min | 3 failures |
| AI Endpoint | `/api/analyze` (POST) | 10 min | 2 failures |

**Note**: POST monitors may require Pro tier. Start with GET /health which covers database and basic server availability.

---

## Status Page (Optional)

Both UptimeRobot and Better Uptime offer free status pages:

1. UptimeRobot: https://status.uptimerobot.com
2. Better Uptime: Built-in status pages

**Benefits:**
- Users can check if service is down
- Reduces support requests during outages
- Shows uptime history

---

## Alert Channels Summary

| Priority | Channel | Example |
|----------|---------|---------|
| P0 Critical | Phone/PagerDuty | API down 5+ minutes |
| P1 High | Slack + Email | Error rate > 10% |
| P2 Medium | Slack | Slow responses |
| P3 Low | Daily email | Minor errors |

---

## Integration with Sentry

Your Sentry setup (Step 3) handles error tracking. Uptime monitoring complements this:

- **Sentry**: Catches errors that happen
- **Uptime**: Detects when service is unreachable

Together they provide complete observability.

---

## Monthly Monitoring Checklist

- [ ] Review uptime percentage (target: 99.9%)
- [ ] Check false positive alerts
- [ ] Review incident response times
- [ ] Adjust thresholds if needed
- [ ] Verify alert contacts are current

---

**Estimated Setup Time**: 15 minutes
