# Monitoring Plan

**Purpose**: Observability strategy for Qamar in production
**Last Updated**: 2026-01-19  
**Owner**: Engineering / DevOps

---

## Overview

This document outlines monitoring requirements without vendor-specific setup. Implement using your chosen tools (Sentry, Datadog, New Relic, etc.).

**Goals:**
- Detect issues before users report them
- Minimize downtime and data loss
- Maintain 99.9% uptime target
- Respond to incidents within SLA

---

## Error Tracking Plan

### What to Track

**Server Errors:**
- API endpoint failures (5xx errors)
- Database connection failures
- Anthropic Claude API errors (rate limits, timeouts)
- Unhandled exceptions in Node.js
- Safety validation failures
- Charter compliance violations

**Client Errors:**
- JavaScript exceptions in mobile app
- Network request failures
- App crashes (native layer)
- Rendering errors
- Navigation errors

### Error Severity Classification

**Critical (P0):**
- API completely unresponsive
- Database unavailable
- App crashes on launch for all users
- Data loss or corruption

**High (P1):**
- AI endpoints failing (> 10% error rate)
- Subscription flow broken
- Crashes affecting > 5% of users

**Medium (P2):**
- Slow API responses (> 5s)
- Non-critical feature failures
- Isolated crashes (< 1% users)

**Low (P3):**
- Minor UI glitches
- Cosmetic issues
- Edge case errors

### Error Enrichment Data

Include with every error:
- Timestamp
- User ID (hashed for privacy)
- Request ID (for correlation)
- Environment (prod, staging, dev)
- App version / API version
- Platform (iOS, Android, API)
- OS version
- Stack trace
- Request payload (sanitized of PII)

### Privacy-Safe Error Logging

**Do NOT log:**
- User thought content (PII)
- Full names or emails
- API keys or secrets
- Raw user reflections

**DO log:**
- Error messages
- Stack traces
- Hashed user IDs
- Session IDs
- Endpoint paths
- HTTP status codes
- API response times

### Recommended Tools

**Server-Side:**
- Sentry (Node.js integration)
- New Relic APM
- Datadog APM
- Rollbar

**Client-Side:**
- Sentry (React Native)
- Crashlytics (Firebase)
- Bugsnag
- Instabug

**Setup:**
```javascript
// server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Sanitize PII
    if (event.request) {
      delete event.request.data?.thought;
      delete event.request.data?.reframe;
    }
    return event;
  }
});
```

---

## Uptime Monitoring Plan

### What to Monitor

**API Endpoints:**
- GET /health (basic health check)
- POST /api/analyze (core functionality)
- POST /api/reframe (core functionality)
- GET /api/reflection/history (data retrieval)

**External Dependencies:**
- Database connectivity
- Anthropic Claude API status
- DNS resolution
- SSL certificate expiry

### Uptime Checks

**Frequency:**
- Production: Every 1 minute
- Staging: Every 5 minutes

**Timeout:**
- 30 seconds (generous for AI endpoints)

**Success Criteria:**
- HTTP 200 status code
- Response time < 10 seconds
- Valid JSON response

**Failure Threshold:**
- Alert after 3 consecutive failures (3 minutes down)

### Health Check Endpoint

**Implement in server/index.ts:**
```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.select().from(users).limit(1);
    
    // Check Anthropic Claude API (optional, may be slow)
    // const anthropicStatus = await checkAnthropic();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Recommended Tools

**Uptime Monitoring:**
- UptimeRobot (free tier available)
- Pingdom
- Better Uptime
- StatusCake
- Checkly

**Setup:**
1. Add endpoints to monitoring service
2. Configure check frequency (1 minute)
3. Set up alert notifications
4. Create status page (optional, for users)

---

## Alert Routing Plan

### Alert Channels

**Critical Alerts (P0):**
- Destination: PagerDuty or on-call phone
- Example: "API down for 3 minutes"
- Response SLA: 15 minutes
- Escalation: After 30 minutes with no response

**High Alerts (P1):**
- Destination: Team Slack channel + email
- Example: "Error rate > 10%"
- Response SLA: 1 hour
- Escalation: After 2 hours

**Medium Alerts (P2):**
- Destination: Team Slack channel
- Example: "Slow response times"
- Response SLA: 4 hours
- No escalation

**Low Alerts (P3):**
- Destination: Email digest (daily)
- Example: "Minor errors detected"
- Response SLA: Next business day
- No escalation

### Alert Thresholds

**Error Rate:**
- Warning: > 1% of requests fail
- Critical: > 10% of requests fail

**Response Time:**
- Warning: P95 > 5 seconds
- Critical: P95 > 15 seconds

**Crash Rate:**
- Warning: > 0.1% of sessions crash
- Critical: > 1% of sessions crash

**Uptime:**
- Warning: 2 failed health checks (2 minutes down)
- Critical: 3 failed health checks (3 minutes down)

### Alert Suppression

**Maintenance Windows:**
- Suppress alerts during planned maintenance
- Announce maintenance window in advance
- Keep window short (< 30 minutes)

**Flapping Prevention:**
- Don't alert on every single error
- Use aggregation windows (5-minute intervals)
- Require threshold breach over time

**Alert Fatigue Prevention:**
- Set realistic thresholds
- Fix noisy alerts quickly
- Review and adjust thresholds monthly

---

## Performance Monitoring Plan

### Metrics to Track

**API Performance:**
- Request rate (requests/second)
- Response time (P50, P95, P99)
- Error rate (%)
- Throughput (MB/s)

**Database Performance:**
- Query execution time
- Connection pool utilization
- Slow queries (> 1 second)
- Lock contention

**AI Service Performance:**
- Anthropic Claude API latency
- Token usage
- Rate limit proximity
- Cost per request

**Client Performance:**
- App launch time
- Screen render time
- Network request latency
- Memory usage

### Performance Targets

**API Response Time:**
- P50: < 2 seconds
- P95: < 5 seconds
- P99: < 10 seconds

**Database Query Time:**
- P95: < 500ms
- P99: < 1 second

**Mobile App Performance:**
- Launch time: < 3 seconds
- Screen transitions: < 500ms
- Crash-free sessions: > 99.9%

### Recommended Tools

**APM (Application Performance Monitoring):**
- New Relic
- Datadog APM
- Dynatrace
- AppDynamics

**Database Monitoring:**
- pganalyze (PostgreSQL)
- Datadog Database Monitoring
- Built-in PG stats

**Mobile APM:**
- Firebase Performance Monitoring
- New Relic Mobile
- Datadog Real User Monitoring

---

## Log Retention Plan

### Log Types

**Application Logs:**
- API requests and responses
- Error logs
- Safety telemetry (validation failures)
- Audit logs (orchestration decisions)

**Infrastructure Logs:**
- Server access logs
- Database logs
- Platform logs (Heroku, Railway, etc.)

**Security Logs:**
- Authentication attempts (if added later)
- Failed requests
- Rate limit violations

### Retention Periods

**Production:**
- Application logs: 30 days
- Error logs: 90 days
- Audit logs: 1 year (compliance)
- Metrics: 13 months (for year-over-year comparison)

**Staging:**
- All logs: 7 days

**Development:**
- All logs: 1 day (or no retention)

### Log Aggregation

**Requirements:**
- Centralized logging (not just platform logs)
- Structured logging (JSON format)
- Fast search and filtering
- Correlation by request ID

**Recommended Tools:**
- Datadog Logs
- Loggly
- Papertrail
- CloudWatch Logs (if on AWS)
- Google Cloud Logging (if on GCP)

**Log Format:**
```json
{
  "timestamp": "2026-01-19T01:00:00Z",
  "level": "error",
  "requestId": "uuid-1234",
  "userId": "hashed-user-id",
  "endpoint": "/api/analyze",
  "statusCode": 500,
  "message": "Anthropic Claude API timeout",
  "stack": "...",
  "environment": "production"
}
```

### Log Sanitization

**Always sanitize:**
- User thought content
- Personal information
- API keys and secrets
- Session tokens

**Implementation:**
```typescript
function sanitizeLog(data: any) {
  const sanitized = { ...data };
  delete sanitized.thought;
  delete sanitized.reframe;
  delete sanitized.intention;
  // Hash user ID
  if (sanitized.userId) {
    sanitized.userId = hashValue(sanitized.userId);
  }
  return sanitized;
}
```

---

## Dashboard Plan

### Key Dashboards

**1. System Health Dashboard**
- Uptime status (last 24 hours)
- Error rate (current)
- Request rate (requests/minute)
- Response time (P95)
- Database connection pool status

**2. User Experience Dashboard**
- Active users (current)
- Session duration (average)
- Reflections completed (today)
- Crash rate (last hour)
- App version distribution

**3. AI Safety Dashboard**
- Crisis detections (count per hour)
- Scrupulosity flags (count per hour)
- Validation failures (by type)
- Fallback language usage
- Charter violations

**4. Revenue Dashboard**
- Active subscriptions (count)
- Subscription events (upgrades/cancels)
- Revenue (daily/monthly)
- Conversion rate (free → paid)

**5. Infrastructure Dashboard**
- CPU usage
- Memory usage
- Disk usage
- Network traffic
- Database size

### Dashboard Access

- **Engineering**: All dashboards
- **Product**: User experience, Revenue, AI safety
- **Leadership**: User experience, Revenue (summary)
- **Support**: System health, User experience

---

## Monitoring Implementation Checklist

### Server-Side
- [ ] Error tracking SDK installed
- [ ] Health check endpoint implemented
- [ ] Structured logging configured
- [ ] Log sanitization in place
- [ ] APM tool integrated
- [ ] Database monitoring enabled
- [ ] Uptime monitoring configured

### Client-Side
- [ ] Crash reporting SDK installed
- [ ] Error boundary implemented
- [ ] Performance monitoring enabled
- [ ] User feedback mechanism (optional)

### Alerting
- [ ] Alert channels configured (Slack, email, PagerDuty)
- [ ] Alert thresholds defined
- [ ] On-call rotation set up
- [ ] Escalation policy documented
- [ ] Runbook linked to alerts

### Dashboards
- [ ] System health dashboard created
- [ ] User experience dashboard created
- [ ] AI safety dashboard created
- [ ] Access permissions configured
- [ ] Dashboard URLs documented

---

## Monthly Review Checklist

- [ ] Review error trends (are errors increasing?)
- [ ] Adjust alert thresholds (too many false positives?)
- [ ] Check uptime SLA (did we meet 99.9%?)
- [ ] Review slow queries (database optimization needed?)
- [ ] Analyze crash reports (patterns identified?)
- [ ] Review AI safety metrics (new safety issues?)
- [ ] Check log retention costs (can we optimize?)
- [ ] Update runbooks based on incidents

---

## Monitoring Costs Estimate

**Free Tier Options:**
- Sentry: 5K errors/month free
- UptimeRobot: 50 monitors free
- Datadog: 14-day free trial
- Firebase: Generous free tier for mobile

**Paid Tier (Rough Estimates):**
- Error tracking: $50-200/month
- Uptime monitoring: $20-50/month
- APM: $100-500/month
- Log aggregation: $50-200/month

**Total estimated**: $200-900/month depending on scale and tools chosen

---

## Getting Started (No Vendor Lock-In)

1. **Week 1**: Set up basic error tracking (Sentry free tier)
2. **Week 2**: Configure uptime monitoring (UptimeRobot)
3. **Week 3**: Implement structured logging
4. **Week 4**: Create system health dashboard
5. **Month 2**: Add APM for performance insights
6. **Month 3**: Set up advanced alerting and on-call

Start simple, add complexity as needed.

---

**Last Updated**: 2026-01-19  
**Next Review**: After first production deployment
