// server.js
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://util-sxxx.onrender.com',
  credentials: true
}));

// IMPORTANT: For webhook, use raw body
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

// For other routes, use JSON parser
app.use(express.json());

// Create Checkout Session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    console.log('📝 Creating checkout session:', { amount, currency, metadata });

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!metadata?.customerEmail) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Create Checkout Session
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
            unit_amount: amount, // Amount in cents
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

    console.log('✅ Session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    // IMPORTANT: Return both sessionId and url
    res.json({ 
      sessionId: session.id,
      url: session.url  // This is what the frontend needs
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create checkout session' 
    });
  }
});

// Stripe Webhook endpoint
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful:', session.id);
      
      // TODO: Update your database here
      await handleSuccessfulPayment(session);
      break;
    
    case 'checkout.session.expired':
      console.log('❌ Checkout session expired:', event.data.object.id);
      break;
    
    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed:', event.data.object.id);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
  const { customer_email, metadata } = session;
  
  console.log('Processing order for:', customer_email);
  console.log('Package type:', metadata.packageType);
  
  // TODO: Implement your business logic:
  // 1. Update user subscription in your database
  // 2. Send confirmation email
  // 3. Grant access to premium features
  // 4. Create invoice record
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stripe server running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Checkout endpoint: http://localhost:${PORT}/api/create-checkout-session`);
  console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/api/stripe-webhook`);
});