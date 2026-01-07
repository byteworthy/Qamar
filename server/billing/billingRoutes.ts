import type { Express, Request, Response } from 'express';
import express from 'express';
import { billingService } from './billingService';
import { WebhookHandlers } from './webhookHandlers';
import { getStripePublishableKey, getStripeSecretKey } from './stripeClient';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export function registerBillingWebhookRoute(app: Express) {
  app.post(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        if (!Buffer.isBuffer(req.body)) {
          console.error('Webhook body is not a Buffer');
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );
}

export function registerBillingRoutes(app: Express) {
  app.post('/api/billing/create-checkout-session', async (req: Request, res: Response) => {
    try {
      const { userId, email, priceId } = req.body;

      console.log('[CHECKOUT] Creating session:', { userId, email, priceId });

      if (!userId || !email || !priceId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const result = await billingService.createCheckoutSession(
        userId,
        email,
        priceId,
        `${baseUrl}/billing/success`,
        `${baseUrl}/billing/cancel`
      );

      console.log('[CHECKOUT] Session created, URL:', result.checkoutUrl?.substring(0, 60) + '...');

      res.json(result);
    } catch (error: any) {
      console.error('[CHECKOUT] Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/billing/create-portal-session', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const returnUrl = `${protocol}://${host}/`;

      const result = await billingService.createPortalSession(userId, returnUrl);
      res.json(result);
    } catch (error: any) {
      console.error('Create portal session error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/billing/status', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.json({ status: 'free', planName: 'Free' });
      }

      const result = await billingService.getBillingStatus(userId);
      res.json(result);
    } catch (error: any) {
      console.error('Get billing status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/billing/config', async (req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      const priceId = process.env.STRIPE_PRICE_ID || '';
      
      res.json({ publishableKey, priceId });
    } catch (error: any) {
      console.error('Get billing config error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/billing/debug', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      
      let hasStripeKey = false;
      let hasWebhookSecret = false;
      
      try {
        const secretKey = await getStripeSecretKey();
        hasStripeKey = !!secretKey && secretKey.startsWith('sk_');
      } catch (e) {
        hasStripeKey = false;
      }

      hasWebhookSecret = true;

      const hasPriceId = !!process.env.STRIPE_PRICE_ID;
      const environmentMode = process.env.REPLIT_DEPLOYMENT === '1' ? 'production' : 'development';

      let subscriptionStatus = null;
      if (userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        subscriptionStatus = user?.subscriptionStatus || 'not_found';
      }

      res.json({
        hasStripeKey,
        hasWebhookSecret,
        hasPriceId,
        environmentMode,
        currentUserId: userId || null,
        subscriptionStatus,
      });
    } catch (error: any) {
      console.error('Debug error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
