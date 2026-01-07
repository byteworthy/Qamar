import { getUncachableStripeClient } from './stripeClient';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

// BILLING STATUS STATE MACHINE
// Only these four states are valid:
// - 'free': No active subscription
// - 'active': Paid and current
// - 'past_due': Payment failed, still has access but needs attention
// - 'canceled': Subscription ended
export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'canceled';

export interface UserBillingInfo {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
}

export class BillingService {
  async createCheckoutSession(userId: string, email: string, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = await getUncachableStripeClient();
    
    const user = await this.getOrCreateUser(userId, email);
    
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      console.log('[BILLING] Created Stripe customer:', { userId, customerId });
      await this.updateUserStripeInfo(userId, { stripeCustomerId: customerId });
    } else {
      console.log('[BILLING] Using existing customer:', { userId, customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
    });

    console.log('[BILLING] Checkout session created:', { userId, customerId, sessionId: session.id });

    return { checkoutUrl: session.url };
  }

  async createPortalSession(userId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    
    const user = await this.getUser(userId);
    if (!user?.stripeCustomerId) {
      throw new Error('No billing account found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { portalUrl: session.url };
  }

  async getBillingStatus(userId: string): Promise<{ status: SubscriptionStatus; planName: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { status: 'free', planName: 'Free' };
    }

    const status = this.normalizeStatus(user.subscriptionStatus);
    const planName = status === 'active' ? 'Noor Plus' : 'Free';
    
    return { status, planName };
  }

  private normalizeStatus(dbStatus: string | null): SubscriptionStatus {
    switch (dbStatus) {
      case 'active': return 'active';
      case 'past_due': return 'past_due';
      case 'canceled': return 'canceled';
      default: return 'free';
    }
  }

  async handleCheckoutCompleted(customerId: string, subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.userId;
    const periodEnd = (subscription as any).current_period_end;
    
    if (userId) {
      await this.updateUserStripeInfo(userId, {
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      });
    }
  }

  async handleSubscriptionUpdated(subscriptionId: string, status: string, currentPeriodEnd?: number) {
    const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscriptionId));
    
    if (user) {
      await this.updateUserStripeInfo(user.id, {
        subscriptionStatus: this.mapStripeStatus(status),
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      });
    }
  }

  async handleSubscriptionDeleted(subscriptionId: string) {
    const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscriptionId));
    
    if (user) {
      await this.updateUserStripeInfo(user.id, {
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
      });
    }
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    // Map Stripe subscription status to our normalized state machine
    switch (stripeStatus) {
      case 'active':
      case 'trialing': // Treat trialing as active (paid user)
        return 'active';
      case 'past_due':
        return 'past_due';
      case 'canceled':
      case 'unpaid':
      case 'incomplete':
      case 'incomplete_expired':
        return 'canceled';
      default:
        return 'free';
    }
  }

  async getOrCreateUser(userId: string, email: string) {
    let [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      [user] = await db.insert(users).values({
        id: userId,
        email,
        subscriptionStatus: 'free',
      }).returning();
    }
    
    return user;
  }

  async getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async updateUserStripeInfo(userId: string, info: Partial<{
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    subscriptionStatus: SubscriptionStatus;
    currentPeriodEnd: Date | null;
  }>) {
    const [user] = await db.update(users).set(info).where(eq(users.id, userId)).returning();
    return user;
  }

  isPaidUser(status: SubscriptionStatus): boolean {
    // Only 'active' status grants paid features
    // 'past_due' still has access (grace period) but should prompt to fix payment
    return status === 'active' || status === 'past_due';
  }

  async syncSubscriptionFromStripe(userId: string): Promise<{ status: SubscriptionStatus; planName: string }> {
    const stripe = await getUncachableStripeClient();
    const user = await this.getUser(userId);
    
    if (!user?.stripeCustomerId) {
      return { status: 'free', planName: 'Free' };
    }

    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return { status: 'free', planName: 'Free' };
      }

      const subscription = subscriptions.data[0];
      const newStatus = this.mapStripeStatus(subscription.status);
      const periodEnd = (subscription as any).current_period_end;

      console.log('[SYNC] Syncing subscription from Stripe:', {
        userId,
        subscriptionId: subscription.id,
        stripeStatus: subscription.status,
        mappedStatus: newStatus,
      });

      await this.updateUserStripeInfo(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: newStatus,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      });

      const planName = newStatus === 'active' ? 'Noor Plus' : 'Free';
      return { status: newStatus, planName };
    } catch (error) {
      console.error('[SYNC] Error syncing subscription:', error);
      return this.getBillingStatus(userId);
    }
  }
}

export const billingService = new BillingService();
