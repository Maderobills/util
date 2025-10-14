// server.js
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import axios from 'axios'; // ✅ For PayMongo API calls
import crypto from 'crypto'; // ✅ For webhook signature verification

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite frontend (development)
    'http://localhost:3000'   // optional, if you sometimes run frontend here
  ],
  credentials: true
}));

// ⚠️ For Stripe webhook, must use raw body
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

// ✅ For other routes (Stripe normal + PayMongo), use JSON
app.use(express.json());

// ====================================================
// 🟣 STRIPE CHECKOUT ENDPOINT
// ====================================================
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    console.log('📝 Creating Stripe checkout session:', { amount, currency, metadata });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!metadata?.customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: metadata.packageType || 'Subscription Package',
              description: metadata.packageDescription || '',
            },
            unit_amount: amount, // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      customer_email: metadata.customerEmail,
      metadata: {
        packageType: metadata.packageType,
        customerEmail: metadata.customerEmail,
      },
    });

    console.log('✅ Stripe session created:', session.id);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================================
// 🟡 PAYMONGO CHECKOUT ENDPOINT
// ====================================================
app.post('/api/paymongo/create-checkout', async (req, res) => {
  try {
    let { amount, currency, email, description, metadata } = req.body

    // ✅ Convert USD → PHP if needed
    if (currency === 'USD') {
      const conversionRate = 58 // You can replace this with a live API later
      amount = amount * conversionRate
      currency = 'PHP'
      console.log(`💱 Converted USD to PHP: ${amount} PHP`)
    }

    // ✅ Build PayMongo payload
    const payload = {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // PayMongo expects centavos
          currency,
          description: description || 'Payment',
          billing: {
            name: email.split('@')[0],
            email,
          },
          line_items: [
            {
              name: metadata?.packageType || 'Package',
              amount: Math.round(amount * 100),
              currency,
              quantity: 1,
            },
          ],
          payment_method_types: ['card', 'gcash'],
          metadata,
          success_url: 'http://localhost:5173',
          cancel_url: 'http://localhost:5173/payment',
        },
      },
    }

    // ✅ Send to PayMongo
    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      payload,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.json({ url: response.data.data.attributes.checkout_url })
  } catch (error) {
    console.error('❌ PayMongo checkout error:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Failed to create PayMongo checkout session',
      details: error.response?.data,
    })
  }
})


// ====================================================
// 🟢 STRIPE WEBHOOK
// ====================================================
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Stripe payment successful:', session.id);
      await handleSuccessfulPayment(session);
      break;

    case 'checkout.session.expired':
      console.log('⌛ Stripe session expired:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log('❌ Stripe payment failed:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ====================================================
// 🟠 PAYMONGO WEBHOOK (optional but recommended)
// ====================================================
app.post('/api/paymongo-webhook', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['paymongo-signature'];
    const body = JSON.stringify(req.body);
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

    // Validate webhook signature (optional)
    if (signature && secret) {
      const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (hmac !== signature) {
        console.warn('⚠️ Invalid PayMongo webhook signature');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = req.body.data;
    console.log('📩 PayMongo webhook event:', event.attributes.type);

    if (event.attributes.type === 'checkout_session.payment_paid') {
      const checkout = event.attributes.data.attributes;
      console.log('✅ PayMongo payment successful:', checkout.reference_number);
      // TODO: handle success logic here
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ PayMongo webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ====================================================
// 💾 Helper: Handle successful payments (shared logic)
// ====================================================
async function handleSuccessfulPayment(session) {
  const { customer_email, metadata } = session;

  console.log('Processing order for:', customer_email);
  console.log('Package type:', metadata.packageType);

  // TODO:
  // 1. Update user subscription in your database
  // 2. Send confirmation email
  // 3. Grant premium access
  // 4. Log transaction
}

// ====================================================
// 🩺 Health Check
// ====================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stripe + PayMongo server running' });
});

// ====================================================
// 🚀 Start Server
// ====================================================
const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🧾 Stripe endpoint: http://localhost:${PORT}/api/create-checkout-session`);
  console.log(`🪙 PayMongo endpoint: http://localhost:${PORT}/api/paymongo/create-checkout`);
});
