// Payment Routes - Stripe integration
// Payment is ONLY for downloading/sharing family trees ($2.99)
// All themes and generations are FREE

import express from 'express';
import Stripe from 'stripe';
import { DOWNLOAD_PRICE } from '../services/themes.js';

const router = express.Router();

// Initialize Stripe (lazy to allow for missing env vars during dev)
let stripe = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/**
 * POST /api/payments/create-checkout
 * Create a Stripe checkout session for downloading a family tree
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { email, imageUrl, cleanUrl } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const stripeClient = getStripe();

    // If Stripe is not configured, allow download for demo/testing
    if (!stripeClient) {
      console.log('⚠️ Stripe not configured - allowing free download for demo');
      return res.json({
        success: true,
        downloadUrl: cleanUrl || imageUrl,
        message: 'Demo mode - download enabled'
      });
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Family Tree Download',
              description: 'High-resolution, watermark-free family tree artwork',
              images: [imageUrl], // Show preview in Stripe
            },
            unit_amount: Math.round(DOWNLOAD_PRICE * 100), // $2.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/download-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/builder`,
      metadata: {
        email,
        imageUrl: cleanUrl || imageUrl, // Store clean URL for delivery
        type: 'download',
      },
    });

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /api/payments/verify-session
 * Verify a payment session and return download URL
 */
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      res.json({
        success: true,
        paid: true,
        downloadUrl: session.metadata.imageUrl,
        email: session.metadata.email,
      });
    } else {
      res.json({
        success: false,
        paid: false,
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
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripeClient = getStripe();
  if (!stripeClient) {
    return res.status(503).json({ error: 'Payment system not configured' });
  }

  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { email, imageUrl, type } = session.metadata;

      if (type === 'download') {
        console.log(`✅ Download purchased by ${email}`);
        // In a production app, you might want to:
        // - Send an email with the download link
        // - Store the purchase in a database
        // - Generate a secure download token
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/payments/status
 * Check if payment system is configured
 */
router.get('/status', (req, res) => {
  res.json({
    configured: !!process.env.STRIPE_SECRET_KEY,
    downloadPrice: DOWNLOAD_PRICE,
  });
});

export default router;
