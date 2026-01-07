import { getStripeSync } from './stripeClient';
import { billingService } from './billingService';
import { getUncachableStripeClient } from './stripeClient';
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
      console.error('Webhook signature verification failed:', err);
      throw err;
    }

    console.log('[WEBHOOK] Received event:', event.type);

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
        await billingService.handleSubscriptionDeleted(subscription.id);
        break;
      }
    }
  }
}

async function getWebhookSecret(): Promise<string> {
  const sync = await getStripeSync();
  const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  const { webhook } = await sync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/billing/webhook`);
  return webhook.secret;
}
