// Payment Routes - Polar integration
// Payment is ONLY for downloading/sharing family trees ($2.99)
// All themes and generations are FREE

import express from 'express';
import { Polar } from '@polar-sh/sdk';
import { DOWNLOAD_PRICE } from '../services/themes.js';

const router = express.Router();

// Initialize Polar (lazy to allow for missing env vars during dev)
let polar = null;
function getPolar() {
  if (!polar && process.env.POLAR_ACCESS_TOKEN) {
    polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      // Use sandbox for testing, remove for production
      server: process.env.POLAR_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production',
    });
  }
  return polar;
}

/**
 * POST /api/payments/create-checkout
 * Create a Polar checkout session for downloading a family tree
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { email, imageUrl, cleanUrl } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const polarClient = getPolar();

    // If Polar is not configured, allow download for demo/testing
    if (!polarClient) {
      console.log('⚠️ Polar not configured - allowing free download for demo');
      return res.json({
        success: true,
        downloadUrl: cleanUrl || imageUrl,
        message: 'Demo mode - download enabled'
      });
    }

    // Get product ID from environment or use default
    const productId = process.env.POLAR_PRODUCT_ID;

    if (!productId) {
      console.error('❌ POLAR_PRODUCT_ID not configured');
      return res.status(503).json({ error: 'Payment product not configured' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Create Polar checkout session
    const checkout = await polarClient.checkouts.create({
      products: [productId],
      customerEmail: email,
      successUrl: `${clientUrl}/download-success?checkout_id={CHECKOUT_ID}`,
      metadata: {
        email,
        imageUrl: cleanUrl || imageUrl,
        type: 'download',
      },
    });

    console.log('✅ Polar checkout created:', checkout.id);

    res.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /api/payments/verify-session/:checkoutId
 * Verify a payment session and return download URL
 */
router.get('/verify-session/:checkoutId', async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const polarClient = getPolar();
    if (!polarClient) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    // Get checkout status from Polar
    const checkout = await polarClient.checkouts.get({ id: checkoutId });

    if (checkout.status === 'succeeded') {
      res.json({
        success: true,
        paid: true,
        downloadUrl: checkout.metadata?.imageUrl,
        email: checkout.metadata?.email || checkout.customerEmail,
      });
    } else if (checkout.status === 'confirmed') {
      // Payment confirmed but not yet fully processed
      res.json({
        success: true,
        paid: true,
        downloadUrl: checkout.metadata?.imageUrl,
        email: checkout.metadata?.email || checkout.customerEmail,
      });
    } else {
      res.json({
        success: false,
        paid: false,
        status: checkout.status,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment session' });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Polar webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️ POLAR_WEBHOOK_SECRET not configured');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['webhook-signature'] || req.headers['polar-signature'];

    if (!signature) {
      console.error('❌ Missing webhook signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Parse the webhook payload
    const payload = JSON.parse(req.body.toString());

    // Handle different event types
    const eventType = payload.type || payload.event;

    switch (eventType) {
      case 'checkout.created':
        console.log('📝 Checkout created:', payload.data?.id);
        break;

      case 'checkout.updated':
        console.log('🔄 Checkout updated:', payload.data?.id, 'Status:', payload.data?.status);
        break;

      case 'order.created': {
        const order = payload.data;
        console.log(`✅ Order created: ${order?.id}`);
        console.log(`   Customer: ${order?.customer?.email}`);
        console.log(`   Amount: $${(order?.amount || 0) / 100}`);

        // In production, you might want to:
        // - Send an email with the download link
        // - Store the purchase in a database
        // - Generate a secure download token
        break;
      }

      case 'subscription.created':
      case 'subscription.updated':
        console.log('📦 Subscription event:', eventType, payload.data?.id);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/payments/status
 * Check if payment system is configured
 */
router.get('/status', (req, res) => {
  res.json({
    configured: !!process.env.POLAR_ACCESS_TOKEN && !!process.env.POLAR_PRODUCT_ID,
    provider: 'polar',
    downloadPrice: DOWNLOAD_PRICE,
  });
});

export default router;
