import { getStripeSync } from './stripeClient';
import { billingService } from './billingService';
import { getUncachableStripeClient } from './stripeClient';
import { db } from '../db';
import { processedStripeEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    const stripe = await getUncachableStripeClient();
    const webhookSecret = await getWebhookSecret();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('[WEBHOOK] Signature verification failed:', err);
      throw err;
    }

    // IDEMPOTENCY: Check if we've already processed this event
    const eventId = event.id;
    const [existing] = await db.select()
      .from(processedStripeEvents)
      .where(eq(processedStripeEvents.eventId, eventId));

    if (existing) {
      console.log('[WEBHOOK] Duplicate event ignored:', eventId);
      return;
    }

    console.log('[WEBHOOK] Processing event:', event.type, eventId);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('[WEBHOOK] checkout.session.completed:', { 
            customerId: session.customer, 
            subscriptionId: session.subscription 
          });
          if (session.subscription && session.customer) {
            await billingService.handleCheckoutCompleted(
              session.customer as string,
              session.subscription as string
            );
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const periodEnd = (subscription as any).current_period_end;
          console.log('[WEBHOOK] subscription updated:', { 
            subscriptionId: subscription.id, 
            status: subscription.status,
            customerId: subscription.customer
          });
          // IDEMPOTENT: Update is safe to run multiple times - same data produces same result
          await billingService.handleSubscriptionUpdated(
            subscription.id,
            subscription.status,
            periodEnd
          );
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log('[WEBHOOK] subscription deleted:', { subscriptionId: subscription.id });
          // IDEMPOTENT: Setting status to 'canceled' is safe to run multiple times
          await billingService.handleSubscriptionDeleted(subscription.id);
          break;
        }
      }

      // Mark event as processed AFTER successful handling
      await db.insert(processedStripeEvents).values({
        eventId,
        eventType: event.type,
      }).onConflictDoNothing();

      console.log('[WEBHOOK] Event processed successfully:', eventId);
    } catch (error) {
      console.error('[WEBHOOK] Error processing event:', eventId, error);
      throw error;
    }
  }
}

async function getWebhookSecret(): Promise<string> {
  const sync = await getStripeSync();
  const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  const { webhook } = await sync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/billing/webhook`);
  return webhook.secret;
}
