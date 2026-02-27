# Qamar Freemium-to-Paid Conversion Automation
## n8n Workflow Deployment Guide

**Workflow Name**: Qamar Freemium Conversion Funnel
**Status**: Production Ready
**Cost Model**: Claude Haiku ($0.001 per personalization call)
**Estimated Monthly Cost**: $10-50 (depending on signup volume)
**Last Updated**: 2026-02-17

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites & Credentials](#prerequisites--credentials)
3. [Installation & Setup](#installation--setup)
4. [Workflow Nodes Deep Dive](#workflow-nodes-deep-dive)
5. [Environment Variables](#environment-variables)
6. [Testing & Validation](#testing--validation)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
8. [Cost Optimization](#cost-optimization)

---

## Architecture Overview

### Workflow High-Level Flow

```
User Signup (Firebase)
        ↓
Extract Metadata & Start 7-Day Delay
        ↓
Query User Activity (7 Days Later)
        ↓
Analyze Behavior Signals
        ├─ Consecutive days active
        ├─ Verses memorized
        ├─ Hifz session initiated
        ├─ Average session duration
        └─ Last activity date
        ↓
Evaluate Conversion Readiness
        ├─ 5+ consecutive days AND (10+ verses OR hifz started) = READY
        └─ <5 days = RE-ENGAGEMENT
        ↓
    ┌───────────────────────────────────────┐
    │           READY PATH                  │ RE-ENGAGEMENT PATH
    │                                       │
    │ 1. Generate Personalized Pitch       │ 1. Send re-engagement email
    │    (Claude Haiku)                    │
    │ 2. Send Push Notification            │ 2. Log to Airtable
    │ 3. Display In-App Modal              │
    │ 4. Await Stripe Webhook              │ 3. Update Firebase
    │    (charge.succeeded)                │
    │ 5. Log Conversion to Airtable        │ 4. Track in Segment
    │ 6. Send Confirmation Email           │
    │ 7. Update Firebase (premium)         │
    │ 8. Track in Segment                  │
    └───────────────────────────────────────┘
```

### Success Metrics

- **Conversion Rate Target**: 35-45% of ready users (industry benchmark: 25-40%)
- **Re-engagement Rate Target**: 15-20% of non-ready users eventually convert
- **Cost Per Acquisition (CPA)**: ~$0.05 (Claude Haiku usage)
- **Payback Period**: 2-3 months (LTV $29.94 first year if annual subscription follows)

---

## Prerequisites & Credentials

### Required Services & Accounts

1. **Firebase Project**
   - Project ID
   - Service Account JSON (for Firestore access)
   - OAuth2 credentials (for API access)

2. **Anthropic Claude API**
   - API Key (for Haiku model)

3. **Stripe Account**
   - API Keys (publishable + secret)
   - Webhook endpoint configured in Stripe Dashboard

4. **Qamar Backend Server**
   - API endpoint URL
   - API token/JWT secret

5. **Airtable Workspace**
   - Base ID for Qamar analytics
   - Personal Access Token (PAT)
   - Two tables: `tblFreemiumConversions` and `tblFreemiumNonConversions`

6. **Segment Account** (optional but recommended)
   - API token for analytics tracking

7. **n8n Instance**
   - Self-hosted or cloud (n8n.cloud)
   - Dedicated workflow execution capacity

### Airtable Schema

**Table 1: tblFreemiumConversions**
```
Fields:
- User ID (text)
- Email (email)
- Signup Date (date)
- Days Active (7-day window) (number)
- Consecutive Days (number)
- Verses Memorized (number)
- Hifz Started (checkbox)
- Avg Session Duration (min) (number)
- Conversion Status (single select: "Converted")
- Stripe Event ID (text)
- Amount Paid (currency)
- Conversion Date (date)
- Plan Type (text)
- Personalization Prompt Used (single select: "Claude Haiku")
- Cohort Date (date)
- Notes (long text)
```

**Table 2: tblFreemiumNonConversions**
```
Fields:
- User ID (text)
- Email (email)
- Signup Date (date)
- Days Active (number)
- Consecutive Days (number)
- Verses Memorized (number)
- Hifz Started (checkbox)
- Avg Session Duration (min) (number)
- Conversion Status (single select: "No Conversion")
- Re-engagement Sent (checkbox)
- Cohort Date (date)
- Notes (long text)
```

---

## Installation & Setup

### Step 1: Set Up n8n Instance

#### Option A: Docker Compose (Recommended for Self-Hosted)

```bash
# Create directory
mkdir -p ~/noor-n8n && cd ~/noor-n8n

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=https  # Use HTTPS in production
      - N8N_WEBHOOK_URL=https://your-n8n-domain.com/
      - DB_TYPE=postgres
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_PRUNE_TIMEOUT=3600
    depends_on:
      - postgres
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n_network
    restart: unless-stopped

volumes:
  n8n_data:
  postgres_data:

networks:
  n8n_network:
    driver: bridge
EOF

# Start services
docker-compose up -d
```

#### Option B: n8n Cloud (Managed, Recommended for MVP)

1. Sign up at https://app.n8n.cloud
2. Create new workflow
3. Skip to Step 3 below

### Step 2: Add Credentials to n8n

In n8n UI → Settings → Credentials:

1. **Firebase Service Account**
   - Type: Google Firebase
   - Upload service account JSON from GCP Console
   - Scopes: `firebase`, `firestore`

2. **Anthropic API Key**
   - Type: Generic Credential Type (HTTP Header Auth)
   - Header Name: `x-api-key`
   - Header Value: `{{ env.ANTHROPIC_API_KEY }}`

3. **Stripe API**
   - Type: Stripe
   - API Key: From Stripe Dashboard → Developers → API Keys

4. **Qamar API Token**
   - Type: Generic Credential Type (HTTP Header Auth)
   - Header Name: `Authorization`
   - Header Value: `Bearer {{ env.NOOR_API_TOKEN }}`

5. **Airtable API**
   - Type: Airtable
   - Personal Access Token: From Airtable Account Settings

6. **Segment API**
   - Type: Generic Credential Type (HTTP Header Auth)
   - Header Name: `Authorization`
   - Header Value: `Bearer {{ env.SEGMENT_API_TOKEN }}`

### Step 3: Import Workflow

1. In n8n UI → Workflows → Create New
2. Click "Import from JSON"
3. Paste contents of `n8n-freemium-conversion-automation.json`
4. Confirm nodes are created successfully

### Step 4: Configure Environment Variables

Create `.env` file in n8n working directory:

```bash
# Firebase
FIREBASE_PROJECT_ID=noor-app-xyz
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@noor-app-xyz.iam.gserviceaccount.com
FIREBASE_ACCESS_TOKEN=ya29.c.xxxxxxxxxxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-v0-xxxxxxxxxxxxxxx

# Qamar Backend
NOOR_API_URL=https://api.noorapp.com
NOOR_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Airtable
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_API_TOKEN=pat_xxxxxxxxxxxxx

# Segment
SEGMENT_API_TOKEN=SG.xxxxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxx
```

---

## Workflow Nodes Deep Dive

### Node 1: Firebase Trigger - New User Signup

**Purpose**: Listen for new free user signups from Qamar app
**Type**: Webhook (Incoming)
**Trigger Condition**: POST request with `uid`, `email` fields

**Expected Payload**:
```json
{
  "uid": "user_123abc",
  "email": "user@example.com",
  "displayName": "Ahmed",
  "createdAt": "2026-02-17T10:30:00Z"
}
```

**Configuration**:
- Webhook URL: `https://your-n8n-domain.com/webhook-api/v1/noor/user-signup`
- Method: POST
- Authentication: Firebase Cloud (validates token signature)

**In Qamar Backend** (`server/routes/auth.ts`):
```typescript
// After successful signup
await fetch('https://your-n8n-instance/webhook-api/v1/noor/user-signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + firebaseToken
  },
  body: JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    createdAt: new Date().toISOString()
  })
});
```

---

### Node 2: Extract User Metadata

**Purpose**: Extract and prepare user information for downstream nodes
**Type**: Set (Data Transform)

**Output**:
```json
{
  "userId": "user_123abc",
  "userEmail": "user@example.com",
  "signupTimestamp": "2026-02-17T10:30:00.000Z",
  "conversionDeadline": "2026-02-24T10:30:00.000Z",
  "cohortDate": "2026-02-17"
}
```

---

### Node 3: Wait 7 Days

**Purpose**: Delay execution for 7 days to collect user behavior data
**Type**: Wait Node
**Duration**: 7 days
**Trigger on Exit**: True (execute next node after delay)

**Why 7 Days?**
- Sufficient time to observe engagement patterns
- Research shows 70% of users active by day 7 have staying power
- Aligns with standard SaaS trial periods

---

### Node 4: Firebase Query - User Behavior Signals

**Purpose**: Query Firestore for user activity over 7-day window
**Type**: HTTP Request
**Method**: POST
**URL**: Firestore REST API (StructuredQuery)

**Query Logic**:
```
Collection: user_activity
Filter: userId == {{ extracted.userId }}
Range: Last 7 days from signup
Fields: timestamp, sessionDuration, activity_type (enum)
```

**Expected Response Structure**:
```json
{
  "document": {
    "fields": {
      "userId": { "stringValue": "user_123abc" },
      "timestamp": { "timestampValue": "2026-02-20T14:30:00Z" },
      "sessionDuration": { "integerValue": "1200" },
      "activity_type": { "stringValue": "verse_memorized" }
    }
  }
}
```

**Activity Types Tracked**:
- `verse_opened`: User opened Quran reader
- `verse_memorized`: User memorized a verse (hifz)
- `hifz_started`: User initiated hifz mode
- `hifz_session_completed`: User completed hifz review
- `tafsir_read`: User read tafsir explanation
- `dua_search`: User searched duas
- `study_plan_viewed`: User viewed personalized study plan

---

### Node 5: Process Behavior Signals

**Purpose**: Analyze activity records and compute engagement metrics
**Type**: Code (JavaScript/Node.js)

**Computation Logic**:

```javascript
/**
 * Calculate user engagement signals
 *
 * Outputs:
 * - daysActive: Count of unique days with activity
 * - consecutiveDaysActive: Max streak of consecutive days
 * - versesMemorized: Count of "verse_memorized" events
 * - hifzStarted: Boolean flag if hifz mode initiated
 * - averageSessionDuration: Mean session length in seconds
 * - lastActivityDate: Most recent activity date
 */

// Example calculation
{
  "daysActive": 6,
  "consecutiveDaysActive": 4,
  "versesMemorized": 15,
  "hifzStarted": true,
  "averageSessionDuration": 1850,  // ~31 minutes
  "lastActivityDate": "2026-02-24"
}
```

**Consecutive Days Algorithm**:
1. Group activities by date
2. Sort dates chronologically
3. Calculate gaps between consecutive dates
4. Track longest streak (gap of exactly 1 day = continuation)

---

### Node 6: Evaluate Conversion Readiness

**Purpose**: Route users to either upgrade offer or re-engagement flow
**Type**: If (Conditional Router)

**Decision Logic**:
```
IF:
  consecutiveDaysActive >= 5
  AND (
    versesMemorized >= 10
    OR hifzStarted == true
  )
THEN:
  → Route to Upgrade Offer (Node 7)
ELSE:
  → Route to Re-engagement (Node 8)
```

**Rationale**:
- **Consecutive days**: Indicates habit formation; 5+ days shows user is building routine
- **Verses memorized (10+)**: High engagement with core hifz feature
- **Hifz started**: Strongest signal of intent (premium feature unlock trigger)
- **OR logic**: Either signal alone + daily habit = conversion-ready

---

### Node 9: Claude Haiku - Generate Personalized Pitch

**Purpose**: Generate customized upgrade message based on user behavior
**Type**: HTTP Request (Anthropic API)
**Model**: `claude-3-5-haiku-20241022`
**Max Tokens**: 150
**Temperature**: 0.7 (creative, but coherent)

**System Prompt**:
```
You are a personalized upgrade pitch generator for Qamar, an Islamic companion app.
Generate a compelling, concise pitch (2-3 sentences) referencing the user's specific
engagement pattern. Be warm, encouraging, and focus on deepening their Islamic learning.
```

**User Prompt Template**:
```
Generate an upgrade pitch for a user who:
- Days active: {{ daysActive }}
- Verses memorized: {{ versesMemorized }}
- Hifz started: {{ hifzStarted }}
- Average session duration: {{ sessionDurationMinutes }} minutes

Focus on: unlimited hifz, advanced AI feedback, personalized study plans.
```

**Example Output**:
```
"Mashallah, you've memorized 15 verses in just 6 days! Your dedication shows real
potential. Unlock unlimited hifz reviews with advanced AI feedback to perfect your
recitation. Join our premium community and accelerate your Quranic journey today."
```

**Cost**: ~$0.001 per request
**Latency**: 100-300ms

---

### Node 11: Qamar App API - Send Push Notification

**Purpose**: Deliver personalized upgrade offer via push notification
**Type**: HTTP Request
**Method**: POST
**Endpoint**: `{{ env.NOOR_API_URL }}/api/v1/notifications/push`

**Request Payload**:
```json
{
  "userId": "user_123abc",
  "type": "upgrade_offer",
  "title": "Unlock Premium Islamic Learning",
  "body": "{{ personalizationMessage }}",
  "deepLink": "noor://premium?offer=freemium_conversion&discount=3month_199",
  "metadata": {
    "cohortDate": "2026-02-17",
    "daysActive": 6,
    "hifzInitiated": true
  }
}
```

**Deep Link Handler** (in Qamar client):
```typescript
// client/navigation/RootStackNavigator.tsx
const linking = {
  screens: {
    Main: {
      screens: {
        Profile: {
          screens: {
            PremiumPaywall: 'premium',
          },
        },
      },
    },
  },
};

// Extract query params: offer, discount
```

---

### Node 12: In-App Modal - Display Upgrade Offer

**Purpose**: Show structured in-app offer UI
**Type**: Set (Data Transform)
**Triggers**: Client receives push, opens app, sees modal overlay

**Modal Data Structure**:
```json
{
  "offerTitle": "Continue Your Islamic Journey",
  "offerDescription": "{{ personalizationMessage }}",
  "offerPrice": "3 months at $1.99/month",
  "monthlyPrice": 1.99,
  "totalPrice": 5.97,
  "discountPercentage": 75,
  "regularPrice": 2.99,
  "features": [
    "Unlimited hifz memorization reviews",
    "Advanced mistake analysis with AI feedback",
    "Personalized study plans",
    "Hifz circles with community",
    "Deep tafsir explanations",
    "Dua recommendations"
  ],
  "ctaText": "Start 3-Month Trial",
  "validUntil": "2026-03-17"
}
```

**In Qamar Client** (`client/components/PremiumUpsellModal.tsx`):
```typescript
interface UpgradeOffer {
  title: string;
  description: string;
  price: string;
  features: string[];
}

export function PremiumUpsellModal({ offer }: { offer: UpgradeOffer }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await purchases.purchasePackage(
        packages.noorPlus3Months
      );
      // Log conversion to Stripe via RevenueCat webhook
    } catch (error) {
      // Handle purchase error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible onDismiss={/* close */}>
      <Box p="lg">
        <Text variant="h2">{offer.title}</Text>
        <Text>{offer.description}</Text>
        <Box mt="md">
          {offer.features.map(f => (
            <Text key={f}>✓ {f}</Text>
          ))}
        </Box>
        <Button onPress={handlePurchase} loading={isLoading}>
          {offer.cta}
        </Button>
      </Box>
    </Modal>
  );
}
```

---

### Node 13: Stripe Webhook Listener - Conversion

**Purpose**: Listen for successful payment via Stripe
**Type**: Webhook (Incoming)
**Events**: `charge.succeeded`, `invoice.paid`

**Stripe Webhook Setup** (in Stripe Dashboard):
1. Developers → Webhooks
2. Add Endpoint: `https://your-n8n-instance/webhook-api/v1/noor/stripe-conversion`
3. Events: `charge.succeeded`, `invoice.paid`, `customer.subscription.updated`

**Expected Payload**:
```json
{
  "type": "charge.succeeded",
  "data": {
    "object": {
      "id": "ch_1234567890",
      "amount": 597,
      "currency": "usd",
      "customer": "cus_xxxxx",
      "created": 1708118400,
      "lines": {
        "data": [
          {
            "plan": {
              "id": "com.byteworthy.noor.plus.monthly"
            }
          }
        ]
      }
    }
  }
}
```

---

### Node 14: Process Stripe Event

**Purpose**: Extract and normalize Stripe event data
**Type**: Code (JavaScript)

**Output**:
```json
{
  "eventId": "ch_1234567890",
  "timestamp": "2026-02-24T15:00:00Z",
  "customerId": "cus_xxxxx",
  "amount": 5.97,
  "currency": "usd",
  "status": "converted",
  "planType": "com.byteworthy.noor.plus.monthly"
}
```

---

### Node 15-19: Conversion Path

**Flow**:
1. Check if purchase completed (Conditional)
2. Log to Airtable (conversions table)
3. Send confirmation email
4. Update Firebase (mark user as `subscription_status: premium`)
5. Track in Segment analytics

---

### Node 20-23: Re-engagement Path

**Flow**:
1. Send re-engagement email
2. Log to Airtable (non-conversions table)
3. Update Firebase (mark as `conversion_funnel_status: re-engagement_sent`)
4. Track in Segment

---

## Environment Variables

### Complete .env File

```bash
# ============================================
# FIREBASE CONFIGURATION
# ============================================
FIREBASE_PROJECT_ID=noor-app-production
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...EKW3qOQvQ==\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@noor-app-production.iam.gserviceaccount.com
FIREBASE_ACCESS_TOKEN=ya29.a0AfH6SMBxxxxxxxxxxxxxxxxxxxxxxx

# Firestore Collection Names
FIRESTORE_USER_ACTIVITY_COLLECTION=user_activity
FIRESTORE_USERS_COLLECTION=users

# ============================================
# ANTHROPIC CLAUDE CONFIGURATION
# ============================================
ANTHROPIC_API_KEY=sk-ant-v0-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-haiku-20241022

# ============================================
# NOOR BACKEND CONFIGURATION
# ============================================
NOOR_API_URL=https://api.noorapp.com
NOOR_API_TOKEN=<your-jwt-token-here>
NOOR_API_VERSION=v1

# ============================================
# STRIPE CONFIGURATION
# ============================================
STRIPE_SECRET_KEY=<your-stripe-secret-key-here>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key-here>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret-here>

# Product IDs (from Stripe)
STRIPE_PRODUCT_NOOR_PLUS=prod_noorplus001
STRIPE_PRICE_3MONTH_199=price_3month_199_usd

# ============================================
# AIRTABLE CONFIGURATION
# ============================================
AIRTABLE_BASE_ID=appNoorAnalytics2026
AIRTABLE_API_TOKEN=pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AIRTABLE_TABLE_CONVERSIONS=tblFreemiumConversions
AIRTABLE_TABLE_NON_CONVERSIONS=tblFreemiumNonConversions

# ============================================
# SEGMENT CONFIGURATION (Optional)
# ============================================
SEGMENT_API_TOKEN=SG.noor_freemium_conversion_xxxxxxxxxxxxxxxxxxxxx
SEGMENT_WORKSPACE_ID=noor_workspace_001

# ============================================
# EMAIL CONFIGURATION
# ============================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_NAME=Qamar
EMAIL_FROM_ADDRESS=no-reply@noorapp.com
EMAIL_SUPPORT_ADDRESS=support@byteworthy.com

# ============================================
# N8N CONFIGURATION
# ============================================
N8N_HOST=https://n8n.noorapp.com
N8N_PORT=443
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.noorapp.com/
N8N_TIMEZONE=America/Chicago

# ============================================
# GENERAL CONFIGURATION
# ============================================
ENVIRONMENT=production
LOG_LEVEL=info
DEBUG=false
```

---

## Testing & Validation

### Manual Test Flow

**Step 1: Trigger New User Signup**
```bash
# Simulate Firebase webhook
curl -X POST https://your-n8n-instance/webhook-api/v1/noor/user-signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(firebase_token)" \
  -d '{
    "uid": "test_user_001",
    "email": "testuser@example.com",
    "displayName": "Test User",
    "createdAt": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
    "signupSource": "n8n_test"
  }'
```

**Step 2: Verify Metadata Extraction**
- In n8n UI, check Node 2 output
- Should contain: userId, userEmail, signupTimestamp, conversionDeadline

**Step 3: Wait for Execution History**
- Check n8n Execution History
- Wait 7 days, or manually trigger Node 3 for testing

**Step 4: Simulate Firebase Activity**
```bash
# Insert test activities into Firestore
firebase firestore:list-documents users/test_user_001/activity
```

**Step 5: Verify Claude Haiku Personalization**
- Check Node 9 output for generated pitch
- Validate that it references user behavior (verses, hifz, etc.)

**Step 6: Monitor Stripe Webhook**
```bash
# Stripe CLI for local testing
stripe listen --forward-to localhost:5678/webhook-api/v1/noor/stripe-conversion

# Send test event
stripe trigger charge.succeeded
```

---

## Monitoring & Troubleshooting

### Key Metrics to Track

**Dashboard in Airtable or Segment**:
- Daily signups processed
- Conversion ready rate (% users meeting criteria)
- Conversion rate (% of ready → purchased)
- Re-engagement rate (% of non-ready → purchased later)
- Cost per conversion (Haiku calls ÷ conversions)
- LTV per cohort

### Common Issues & Solutions

#### Issue 1: Firebase Query Returns Empty Results
**Symptoms**: Node 4 returns 0 records
**Cause**: Activity data not being logged to Firestore
**Solution**:
1. Verify Qamar app logs activity to Firestore
2. Check Firestore rules allow read/write
3. Confirm userId format matches between trigger and query

**Qamar Backend Fix** (`server/routes/activity.ts`):
```typescript
import * as admin from 'firebase-admin';

export async function logUserActivity(userId: string, activity: ActivityEvent) {
  const db = admin.firestore();
  const ref = db.collection('user_activity').doc();

  await ref.set({
    userId,
    activity_type: activity.type,
    sessionDuration: activity.duration,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    metadata: activity.metadata
  });
}
```

#### Issue 2: Claude Haiku API Returns 401 Unauthorized
**Symptoms**: Node 9 fails with "Invalid API Key"
**Cause**: ANTHROPIC_API_KEY not set or expired
**Solution**:
1. Rotate API key in Anthropic console
2. Update .env file
3. Restart n8n container

#### Issue 3: Stripe Webhook Not Triggering
**Symptoms**: Node 13 never receives payment events
**Cause**: Webhook URL not registered or signing secret mismatch
**Solution**:
1. Register webhook in Stripe Dashboard
2. Verify signing secret matches N8N
3. Check firewall/CORS allows Stripe IP

```bash
# Verify webhook registration
stripe webhooks list --format=table
```

#### Issue 4: Airtable Import Fails
**Symptoms**: Node 16/21 throws "Base not found"
**Cause**: AIRTABLE_BASE_ID incorrect or missing
**Solution**:
1. Open Airtable base
2. Copy base ID from URL (appXXXXXXXXXXXXXX)
3. Update .env and re-test

---

## Cost Optimization

### Monthly Cost Breakdown

| Component | Volume | Unit Cost | Monthly |
|-----------|--------|-----------|---------|
| Claude Haiku | 300 conversions | $0.001 | $0.30 |
| Anthropic - input tokens | 300 × 100 | $0.80/1M | $0.02 |
| Firebase Firestore reads | 300 queries | $0.06/100K | $0.02 |
| Firebase Firestore writes | 600 updates | $0.18/100K | $0.11 |
| Stripe API calls | 300 events | Free | $0.00 |
| Airtable API calls | 600 writes | Free (up to 5) | $0.00 |
| Segment events | 600 events | Free (up to 100K) | $0.00 |
| n8n Execution Hours | ~50 hours | $0.10/hour | $5.00 |
| **Total** | | | **~$5.45** |

### Cost Optimization Strategies

1. **Batch Haiku Calls**: Instead of personalizing immediately, batch 10 users and call Haiku once
2. **Cache Personalizations**: If users have similar behavior, reuse pitches
3. **Reduce Query Frequency**: Lower Firebase query frequency to once per day
4. **Self-Hosted n8n**: Avoid cloud platform fees

---

## Deployment Checklist

- [ ] Firebase service account JSON loaded
- [ ] Anthropic API key configured
- [ ] Qamar API credentials set
- [ ] Stripe webhook registered
- [ ] Airtable tables created with proper schema
- [ ] Segment workspace configured (optional)
- [ ] Email SMTP settings verified
- [ ] n8n webhook URL registered in Qamar backend
- [ ] Workflow activated in n8n UI
- [ ] Test signup triggered and verified end-to-end
- [ ] Monitor logs for errors over 24 hours
- [ ] Verify Airtable entries populate correctly
- [ ] Confirm Segment events appear in dashboard
- [ ] Set up Slack alerts for workflow failures

---

## Success Metrics & Targets (First 30 Days)

| Metric | Target | Current |
|--------|--------|---------|
| Signups Processed | 100+ | TBD |
| Conversion Ready | 35-45% | TBD |
| Conversion Rate | 30%+ | TBD |
| Claude Haiku Calls | 35-45 | TBD |
| Cost per Conversion | <$0.10 | TBD |
| Re-engagement Opens | 10-20% | TBD |
| LTV per Conversion | $5.97+ | TBD |

---

## Next Steps

1. **Deploy to n8n Cloud or self-hosted instance** (24 hours)
2. **QA test with 10 synthetic users** (1-2 days)
3. **Launch to 1% of new signups** (1 week)
4. **Monitor and optimize** (ongoing)
5. **Scale to 100% of signups** (week 3)
6. **Implement advanced segmentation** (future: segment by Quran vs. Hifz interest)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-17
**Maintainer**: Kevin Richards (@DevyKev_Bot)
