// Payment Routes - Stripe integration

import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { themes } from '../services/themes.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payments/create-checkout
 * Create a Stripe checkout session for theme purchase
 */
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { themeId } = req.body;

    const theme = themes[themeId];
    if (!theme || theme.category !== 'premium') {
      return res.status(400).json({ error: 'Invalid premium theme' });
    }

    const user = await User.findById(req.user.userId);
    
    // Check if already purchased
    if (user.purchasedThemes.includes(themeId)) {
      return res.status(400).json({ error: 'Theme already purchased' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${theme.name} Theme`,
              description: theme.description,
            },
            unit_amount: Math.round(theme.price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/builder`,
      metadata: {
        userId: req.user.userId.toString(),
        themeId,
        type: 'theme',
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/payments/create-premium-checkout
 * Create checkout for premium subscription
 */
router.post('/create-premium-checkout', auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Family Tree Premium',
              description: 'Unlimited generations, no watermarks, all themes included',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/builder`,
      metadata: {
        userId: req.user.userId.toString(),
        type: 'premium',
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Premium checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
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
      const { userId, themeId, type } = session.metadata;

      if (type === 'theme') {
        // Add theme to user's purchased themes
        await User.findByIdAndUpdate(userId, {
          $addToSet: { purchasedThemes: themeId },
        });
        console.log(`✅ Theme ${themeId} purchased by user ${userId}`);
      } else if (type === 'premium') {
        // Upgrade user to premium
        await User.findByIdAndUpdate(userId, {
          isPremium: true,
        });
        console.log(`✅ User ${userId} upgraded to premium`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      // Handle subscription cancellation if needed
      console.log('Subscription cancelled:', subscription.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/payments/purchases
 * Get user's purchases
 */
router.get('/purchases', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('purchasedThemes isPremium generationCredits');
    
    res.json({
      purchasedThemes: user.purchasedThemes,
      isPremium: user.isPremium,
      generationCredits: user.generationCredits,
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

export default router;

