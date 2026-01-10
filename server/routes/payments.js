// Payment Routes - Stripe integration
// Payment is ONLY for downloading/sharing family trees ($2.99)
// All themes and generations are FREE

import express from 'express';
import Stripe from 'stripe';
import { DOWNLOAD_PRICE } from '../services/themes.js';
import { getCleanUrl } from './generate.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

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
    const { email, imageId } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!imageId) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    // Verify the imageId is valid (clean URL exists)
    const cleanUrl = await getCleanUrl(imageId);
    if (!cleanUrl) {
      return res.status(400).json({ error: 'Invalid or expired image ID. Please regenerate your family tree.' });
    }

    const stripeClient = getStripe();

    // If Stripe is not configured, allow download for demo/testing
    if (!stripeClient) {
      console.log('⚠️ Stripe not configured - allowing free download for demo');

      // Still save the "purchase" for demo mode so user can re-download
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        await Purchase.create({
          email: email.toLowerCase(),
          imageId,
          cleanUrl,
          stripeSessionId: `demo_${Date.now()}`,
          amount: 0,
          currency: 'usd',
          userId: user?._id || null,
        });
        console.log(`💾 Demo purchase saved for ${email}`);
      } catch (dbError) {
        console.error('⚠️ Failed to save demo purchase:', dbError.message);
      }

      return res.json({
        success: true,
        downloadUrl: cleanUrl,
        message: 'Demo mode - download enabled'
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Create Stripe checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Family Tree Download',
              description: 'HD quality family tree image without watermarks',
            },
            unit_amount: Math.round(DOWNLOAD_PRICE * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientUrl}/download-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/builder`,
      metadata: {
        email,
        imageId, // Store the secure ID, not the URL
        type: 'download',
      },
    });

    console.log('✅ Stripe checkout created:', session.id);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /api/payments/verify-session/:sessionId
 * Verify a payment session and return download URL
 */
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    // Get checkout session from Stripe
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // SECURITY: Retrieve clean URL server-side using the stored imageId
      const imageId = session.metadata?.imageId;
      const cleanUrl = imageId ? await getCleanUrl(imageId) : null;
      const email = session.metadata?.email || session.customer_email;

      if (!cleanUrl) {
        // Fallback for legacy sessions or expired images
        console.warn('⚠️ Clean URL not found for imageId:', imageId);
        return res.status(410).json({
          success: false,
          paid: true,
          error: 'Image has expired. Please regenerate your family tree.',
        });
      }

      // Save purchase to database for future re-downloads
      try {
        // Check if this session was already saved
        const existingPurchase = await Purchase.findOne({ stripeSessionId: sessionId });

        if (!existingPurchase) {
          // Find user by email if they have an account
          const user = await User.findOne({ email: email.toLowerCase() });

          await Purchase.create({
            email: email.toLowerCase(),
            imageId,
            cleanUrl,
            stripeSessionId: sessionId,
            stripePaymentIntentId: session.payment_intent,
            amount: session.amount_total || 299,
            currency: session.currency || 'usd',
            userId: user?._id || null,
          });
          console.log(`💾 Purchase saved for ${email}`);
        }
      } catch (dbError) {
        // Log but don't fail - user should still get their download
        console.error('⚠️ Failed to save purchase to database:', dbError.message);
      }

      res.json({
        success: true,
        paid: true,
        downloadUrl: cleanUrl, // Only revealed after payment verification
        email,
      });
    } else {
      res.json({
        success: false,
        paid: false,
        status: session.payment_status,
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeClient = getStripe();

  if (!stripeClient || !webhookSecret) {
    console.warn('⚠️ Stripe webhook not configured');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  try {
    const sig = req.headers['stripe-signature'];
    const event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`✅ Payment successful for session: ${session.id}`);
        console.log(`   Customer: ${session.customer_email}`);
        console.log(`   Amount: $${(session.amount_total || 0) / 100}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`💰 Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ error: `Webhook error: ${error.message}` });
  }
});

/**
 * GET /api/payments/purchases/:email
 * Get all purchases for an email address
 */
router.get('/purchases/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const purchases = await Purchase.find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .select('cleanUrl createdAt amount');

    res.json({
      success: true,
      purchases: purchases.map(p => ({
        id: p._id,
        downloadUrl: p.cleanUrl,
        purchasedAt: p.createdAt,
        amount: p.amount / 100, // Convert cents to dollars
      })),
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to retrieve purchases' });
  }
});

/**
 * GET /api/payments/status
 * Check if payment system is configured
 */
router.get('/status', (req, res) => {
  res.json({
    configured: !!process.env.STRIPE_SECRET_KEY,
    provider: 'stripe',
    downloadPrice: DOWNLOAD_PRICE,
  });
});

export default router;
