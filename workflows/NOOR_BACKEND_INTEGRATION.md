# Noor Backend Integration for n8n Freemium Conversion Workflow

**Purpose**: Backend changes required to support n8n freemium-to-paid conversion automation
**Status**: Implementation Guide (Ready for Development)
**Estimated Implementation Time**: 4-6 hours
**Dependencies**: Firebase Admin SDK, Express.js middleware

---

## Overview

The Noor backend needs to:
1. Log user activity events to Firestore (consumed by n8n Node 4)
2. Expose push notification API endpoint (consumed by n8n Node 11)
3. Expose Stripe webhook receiver for subscription events (consumed by n8n Node 13)
4. Update user subscription metadata after conversion

---

## 1. Activity Logging Service

### File: `server/services/activity-logger.ts` (NEW)

```typescript
import * as admin from 'firebase-admin';
import { Request } from 'express';

export interface ActivityEvent {
  type: 'verse_opened' | 'verse_memorized' | 'hifz_started' | 'hifz_session_completed'
       | 'tafsir_read' | 'dua_search' | 'study_plan_viewed' | 'companion_used';
  userId: string;
  sessionDuration?: number; // seconds
  metadata?: Record<string, any>;
}

export class ActivityLogger {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Log a user activity event to Firestore
   * Collection: user_activity
   * Document ID: auto-generated
   */
  async logActivity(event: ActivityEvent): Promise<string> {
    try {
      const ref = this.db.collection('user_activity').doc();

      const docData = {
        userId: event.userId,
        activity_type: event.type,
        sessionDuration: event.sessionDuration || 0,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: event.metadata || {},
        createdAt: new Date().toISOString(),
        ttl: this.calculateTTL(), // 90 days retention
      };

      await ref.set(docData);

      return ref.id;
    } catch (error) {
      console.error('[ActivityLogger] Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Batch log multiple activities (efficient)
   */
  async logActivitiesBatch(events: ActivityEvent[]): Promise<void> {
    const batch = this.db.batch();

    events.forEach((event) => {
      const ref = this.db.collection('user_activity').doc();
      batch.set(ref, {
        userId: event.userId,
        activity_type: event.type,
        sessionDuration: event.sessionDuration || 0,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: event.metadata || {},
        ttl: this.calculateTTL(),
      });
    });

    await batch.commit();
  }

  private calculateTTL(): number {
    // 90 days retention in seconds (for Firestore TTL policy)
    return Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;
  }
}

export const activityLogger = new ActivityLogger();
```

### Usage in Route Handlers

**File: `server/routes/quran-routes.ts` (MODIFIED)**

```typescript
import { activityLogger } from '../services/activity-logger';

router.get('/api/quran/surah/:surahId', async (req, res) => {
  const { surahId } = req.params;
  const userId = req.auth.userId;

  try {
    // Existing logic...
    const verses = await getVerses(surahId);

    // NEW: Log activity
    await activityLogger.logActivity({
      type: 'verse_opened',
      userId,
      metadata: {
        surahId: parseInt(surahId),
        verseCount: verses.length,
      },
    });

    res.json(verses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verses' });
  }
});
```

**File: `server/routes/hifz-routes.ts` (MODIFIED)**

```typescript
import { activityLogger } from '../services/activity-logger';

// When user completes a hifz session
router.post('/api/hifz/session/complete', async (req, res) => {
  const userId = req.auth.userId;
  const { sessionDuration, versesReviewed, accuracy } = req.body;

  try {
    // Existing logic to save session...

    // NEW: Log multiple activities
    const events = [
      {
        type: 'hifz_session_completed' as const,
        userId,
        sessionDuration,
        metadata: { versesReviewed, accuracy },
      },
      {
        type: 'verse_memorized' as const,
        userId,
        metadata: { count: versesReviewed },
      },
    ];

    await activityLogger.logActivitiesBatch(events);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// When user initiates hifz mode (first time)
router.post('/api/hifz/start', async (req, res) => {
  const userId = req.auth.userId;

  try {
    // Existing logic...

    // NEW: Log hifz initiation (high-priority signal)
    await activityLogger.logActivity({
      type: 'hifz_started',
      userId,
      metadata: { timestamp: Date.now() },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start hifz' });
  }
});
```

---

## 2. Push Notification API Endpoint

### File: `server/routes/notification-routes.ts` (NEW)

```typescript
import { Router, Request, Response } from 'express';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import * as admin from 'firebase-admin';

const router = Router();
const db = admin.firestore();

// Initialize Expo SDK
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

interface PushNotificationRequest {
  userId: string;
  type: string; // e.g., 'upgrade_offer'
  title: string;
  body: string;
  deepLink?: string;
  metadata?: Record<string, any>;
}

/**
 * POST /api/v1/notifications/push
 * Send push notification to user (called by n8n Node 11)
 */
router.post('/api/v1/notifications/push', async (req: Request, res: Response) => {
  try {
    const { userId, type, title, body, deepLink, metadata }: PushNotificationRequest = req.body;

    // Validate required fields
    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch user's push tokens from Firebase
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pushTokens = userDoc.data()?.pushTokens || [];
    if (pushTokens.length === 0) {
      // User has not enabled notifications
      return res.json({
        sent: 0,
        message: 'User has no push tokens registered'
      });
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = pushTokens
      .filter(token => Expo.isExpoPushToken(token))
      .map(pushToken => ({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: {
          type,
          deepLink,
          ...metadata,
        },
        badge: 1,
      }));

    if (messages.length === 0) {
      return res.json({ sent: 0, message: 'No valid push tokens' });
    }

    // Send in batches (Expo limit: 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    let successCount = 0;
    let failureCount = 0;

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);

        tickets.forEach(ticket => {
          if (ticket.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
            console.warn('Push send failed:', ticket.message);
          }
        });
      } catch (error) {
        console.error('Batch send error:', error);
        failureCount += chunk.length;
      }
    }

    // Log notification in Firestore for analytics
    await db.collection('user_notifications').doc().set({
      userId,
      type,
      title,
      body,
      deepLink,
      metadata,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      successCount,
      failureCount,
    });

    res.json({
      sent: successCount,
      failed: failureCount,
      message: `Sent ${successCount}/${messages.length} notifications`
    });
  } catch (error) {
    console.error('[NotificationAPI] Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router;
```

### Register Route in `server/routes.ts`

```typescript
import notificationRoutes from './routes/notification-routes';

router.use(notificationRoutes);
```

---

## 3. Stripe Webhook Handler

### File: `server/routes/billing-routes.ts` (NEW/MODIFIED)

```typescript
import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { raw } from 'express';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});
const db = admin.firestore();

// Webhook endpoint (raw body required for Stripe signature verification)
router.post(
  '/api/v1/billing/stripe-webhook',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      // Handle different event types
      switch (event.type) {
        case 'charge.succeeded':
          await handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;

        case 'invoice.paid':
          await handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  }
);

async function handleChargeSucceeded(charge: Stripe.Charge) {
  console.log(`[Billing] Charge succeeded: ${charge.id}`);

  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripe_customer_id', '==', charge.customer)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.warn(`User not found for customer: ${charge.customer}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;

  // Log conversion event to analytics
  await db.collection('conversions').doc().set({
    userId,
    stripe_charge_id: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency,
    type: 'freemium_to_paid',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      source: 'freemium_conversion_workflow', // From n8n
      n8n_triggered: true,
    },
  });

  // Update user subscription status
  await db.collection('users').doc(userId).update({
    subscription_status: 'premium',
    last_payment_date: new Date(),
    payment_events: admin.firestore.FieldValue.arrayUnion({
      type: 'charge_succeeded',
      amount: charge.amount / 100,
      timestamp: new Date(),
    }),
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Billing] Invoice paid: ${invoice.id}`);

  // Similar logic to handleChargeSucceeded
  const usersSnapshot = await db
    .collection('users')
    .where('stripe_customer_id', '==', invoice.customer)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;

    await db.collection('users').doc(userId).update({
      subscription_status: 'premium',
      last_payment_date: new Date(),
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Billing] Subscription updated: ${subscription.id}`);

  const usersSnapshot = await db
    .collection('users')
    .where('stripe_subscription_id', '==', subscription.id)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;

    await db.collection('users').doc(userId).update({
      subscription_status: subscription.status, // 'active', 'past_due', etc.
      subscription_current_period_end: new Date(subscription.current_period_end * 1000),
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Billing] Subscription deleted: ${subscription.id}`);

  const usersSnapshot = await db
    .collection('users')
    .where('stripe_subscription_id', '==', subscription.id)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;

    await db.collection('users').doc(userId).update({
      subscription_status: 'free',
      subscription_cancelled_at: new Date(),
    });
  }
}

export default router;
```

### Register Route in `server/routes.ts`

```typescript
import billingRoutes from './routes/billing-routes';

// Register BEFORE other JSON middleware (Stripe needs raw body)
app.use(billingRoutes);

// Then register other routes
app.use(express.json());
app.use(apiRoutes);
```

---

## 4. Firebase User Metadata Updates

### File: `server/services/user-service.ts` (MODIFIED)

Add methods to track freemium-to-paid conversion:

```typescript
import * as admin from 'firebase-admin';

export async function updateUserSubscriptionStatus(
  userId: string,
  status: 'free' | 'premium',
  metadata?: Record<string, any>
): Promise<void> {
  const db = admin.firestore();

  const updateData: Record<string, any> = {
    subscription_status: status,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (status === 'premium') {
    updateData.subscription_tier = metadata?.tier || 'plus_monthly';
    updateData.conversion_date = admin.firestore.FieldValue.serverTimestamp();
    updateData.freemium_days_active = metadata?.daysActive || 0;
    updateData.conversion_source = metadata?.source || 'freemium_funnel_7day';
  }

  await db.collection('users').doc(userId).update(updateData);
}

export async function markUserAsConverted(
  userId: string,
  conversionData: {
    daysActive: number;
    versesMemorized: number;
    hifzStarted: boolean;
    stripeEventId?: string;
  }
): Promise<void> {
  const db = admin.firestore();

  await db.collection('users').doc(userId).update({
    subscription_status: 'premium',
    subscription_tier: 'plus_monthly',
    conversion_date: admin.firestore.FieldValue.serverTimestamp(),
    conversion_funnel_data: {
      days_active_at_conversion: conversionData.daysActive,
      verses_memorized: conversionData.versesMemorized,
      hifz_initiated: conversionData.hifzStarted,
      stripe_event_id: conversionData.stripeEventId,
    },
    conversion_source: 'n8n_freemium_workflow',
  });
}
```

---

## 5. n8n Webhook Trigger Registration

### File: `server/routes/webhook-registration.ts` (NEW)

Register n8n webhook endpoint in Noor backend startup:

```typescript
import axios from 'axios';

export async function registerN8nWebhook(): Promise<void> {
  const N8N_INSTANCE = process.env.N8N_INSTANCE_URL || 'https://n8n.noorapp.com';
  const N8N_API_KEY = process.env.N8N_API_KEY;

  if (!N8N_API_KEY) {
    console.warn('[Webhook] N8N_API_KEY not configured, skipping webhook registration');
    return;
  }

  try {
    // This webhook is already configured in n8n, but we verify connectivity
    const response = await axios.post(
      `${N8N_INSTANCE}/webhook-api/v1/noor/verify-connection`,
      { source: 'noor_backend' },
      { headers: { Authorization: `Bearer ${N8N_API_KEY}` } }
    );

    console.log('[Webhook] Connected to n8n:', response.data);
  } catch (error) {
    console.error('[Webhook] Failed to connect to n8n:', error);
  }
}

// Call in server startup
// server/index.ts
registerN8nWebhook().catch(console.error);
```

---

## 6. Firestore Security Rules

### Update `firestore.rules` (MODIFIED)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User activity logging (write-only for backend, read for n8n)
    match /user_activity/{document=**} {
      allow read: if request.auth.uid == resource.data.userId
                  || request.auth.token.admin == true;
      allow write: if request.auth.token.admin == true
                  || (request.auth != null && request.auth.uid == request.resource.data.userId);
      allow create: if request.resource.data.userId is string;
    }

    // User notifications
    match /user_notifications/{document=**} {
      allow read: if request.auth.token.admin == true;
      allow write: if request.auth.token.admin == true;
    }

    // Conversions analytics
    match /conversions/{document=**} {
      allow read: if request.auth.token.admin == true;
      allow write: if request.auth.token.admin == true;
      allow create: if request.resource.data.userId is string;
    }

    // Users (update for subscription metadata)
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId
                   || request.auth.token.admin == true;
      allow update: if request.resource.data.subscription_status != null
                   && request.auth.token.admin == true;
    }
  }
}
```

---

## 7. Environment Variables for Backend

### Add to `.env` file

```bash
# n8n Webhook Integration
N8N_INSTANCE_URL=https://n8n.noorapp.com
N8N_API_KEY=n8n_api_key_xxxxxxxxxxxxx

# Firebase Activity Logging
FIRESTORE_USER_ACTIVITY_COLLECTION=user_activity

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxxxxxxxxxxxxx

# Expo Push Notifications
EXPO_ACCESS_TOKEN=ExponentPushTokenXXXXXXXXXXXX

# Analytics
SEGMENT_API_TOKEN=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 8. Testing Checklist

- [ ] Activity logger logs `verse_opened` event
- [ ] Activity logger logs `hifz_started` event
- [ ] Activity logger logs `verse_memorized` event
- [ ] Push notification endpoint responds with 200
- [ ] Stripe webhook signature verification passes
- [ ] Charge succeeded event updates user subscription status
- [ ] Firebase user metadata updated with conversion data
- [ ] End-to-end test: signup → 7 days → conversion → user marked premium

---

## Implementation Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| 1 | Activity Logger Service + Usage in Routes | 1.5 hours |
| 2 | Push Notification API Endpoint | 1 hour |
| 3 | Stripe Webhook Handler | 1.5 hours |
| 4 | Firebase Rules Update + Testing | 1 hour |
| 5 | End-to-End Integration Testing | 1 hour |
| **Total** | | **6 hours** |

---

**Next Steps**:
1. Implement Activity Logger Service
2. Add activity logging to all relevant routes
3. Deploy notification API
4. Configure Stripe webhook in Stripe Dashboard
5. Update Firestore security rules
6. Test end-to-end with n8n workflow

**Document Version**: 1.0
**Last Updated**: 2026-02-17
