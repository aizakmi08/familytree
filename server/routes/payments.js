import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session for theme purchase
router.post('/checkout/theme', authenticate, async (req, res) => {
  try {
    const { themeId } = req.body;

    if (!themeId) {
      return res.status(400).json({ message: 'Theme ID is required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Premium Theme: ${themeId}`,
              description: `Unlock the ${themeId} theme for your family tree`,
            },
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/themes`,
      metadata: {
        userId: req.userId.toString(),
        type: 'theme',
        themeId: themeId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Payment session creation failed' });
  }
});

// Create checkout session for export purchase
router.post('/checkout/export', authenticate, async (req, res) => {
  try {
    const { format } = req.body; // 'pdf' or 'png'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Premium Export: ${format.toUpperCase()}`,
              description: `Export your family tree as ${format.toUpperCase()} without watermark`,
            },
            unit_amount: 299, // $2.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/tree`,
      metadata: {
        userId: req.userId.toString(),
        type: 'export',
        format: format,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Payment session creation failed' });
  }
});

// Webhook handler for Stripe events
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
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, type, themeId, format } = session.metadata;

    if (type === 'theme' && themeId) {
      // Add theme to user's purchased themes
      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedThemes: themeId },
      });
    } else if (type === 'export') {
      // Export purchase - could track this separately if needed
      console.log(`Export purchased: ${format} by user ${userId}`);
    }
  }

  res.json({ received: true });
});

// Get user's purchased themes
router.get('/purchases', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('purchasedThemes');
    res.json({ purchasedThemes: user?.purchasedThemes || [] });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

