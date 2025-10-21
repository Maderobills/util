// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

// ✅ Debug: Check if API key is loaded
console.log('=== Xendit Configuration ===');
console.log('API Key loaded:', XENDIT_SECRET_KEY ? '✅ Yes' : '❌ No');
console.log('API Key prefix:', XENDIT_SECRET_KEY?.substring(0, 20) + '...');
console.log('Key type:', XENDIT_SECRET_KEY?.startsWith('xnd_public') ? '❌ PUBLIC (Wrong!)' : '✅ SECRET (Correct)');
console.log('Environment:', XENDIT_SECRET_KEY?.includes('development') ? '🧪 TEST MODE' : '🔴 PRODUCTION MODE');
console.log('===========================');

if (!XENDIT_SECRET_KEY) {
  console.error('⚠️ WARNING: XENDIT_SECRET_KEY is not set in environment variables!');
  process.exit(1);
}

if (XENDIT_SECRET_KEY?.startsWith('xnd_public')) {
  console.error('❌ ERROR: You are using a PUBLIC key on the backend!');
  console.error('❌ Backend requires SECRET key (starts with "xnd_development_" or "xnd_production_")');
  process.exit(1);
}

/**
 * Create Xendit Invoice
 */
app.post("/api/xendit/create-invoice", async (req, res) => {
  try {
    const { amount, currency, payer, description } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!payer?.email) {
      return res.status(400).json({ error: 'Payer email is required' });
    }

    console.log('📝 Creating invoice with:', {
      amount,
      currency,
      payer_email: payer.email,
      description
    });

    const invoiceData = {
      external_id: "invoice-" + Date.now(),
      amount: Number(amount),
      currency: currency || "USD",
      payer_email: payer.email,
      description: description || "Payment",
      success_redirect_url: "http://localhost:5173",
      failure_redirect_url: "http://localhost:5173/payment",
      invoice_duration: 86400, // 24 hours
    };

    const response = await axios.post(
      "https://api.xendit.co/v2/invoices",
      invoiceData,
      {
        auth: { 
          username: XENDIT_SECRET_KEY, 
          password: "" 
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Invoice created successfully:', response.data.id);
    console.log('💳 Payment URL:', response.data.invoice_url);
    
    res.json(response.data);
  } catch (err) {
    console.error("❌ Xendit Create Invoice Error:", err.response?.data || err.message);
    
    const errorMessage = err.response?.data?.message || err.message;
    const errorCode = err.response?.data?.error_code;
    
    res.status(err.response?.status || 500).json({ 
      error: errorMessage,
      error_code: errorCode,
      details: err.response?.data 
    });
  }
});

/**
 * Check Invoice Status
 */
app.get("/api/xendit/status/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Checking invoice status:', id);

    const response = await axios.get(
      `https://api.xendit.co/v2/invoices/${id}`, 
      {
        auth: { 
          username: XENDIT_SECRET_KEY, 
          password: "" 
        }
      }
    );

    console.log('✅ Invoice status:', response.data.status);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Xendit Status Check Error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: err.response?.data?.message || err.message 
    });
  }
});

/**
 * Webhook endpoint to receive payment notifications
 */
app.post("/api/xendit/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    console.log('📨 Webhook received:', {
      id: event.id,
      external_id: event.external_id,
      status: event.status,
      amount: event.amount
    });

    // Process the webhook based on status
    if (event.status === 'PAID') {
      console.log('✅ Payment successful!');
      // TODO: Update your database here
      // e.g., mark order as paid, send confirmation email, etc.
    } else if (event.status === 'EXPIRED') {
      console.log('⏰ Invoice expired');
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Webhook error:', err);
    res.status(500).send('Error');
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ 
    status: 'OK', 
    xendit_configured: !!XENDIT_SECRET_KEY,
    environment: XENDIT_SECRET_KEY?.includes('development') ? 'test' : 'production'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Xendit backend running on port ${PORT}`);
  console.log(`📍 Create Invoice: http://localhost:${PORT}/api/xendit/create-invoice`);
  console.log(`📍 Check Status: http://localhost:${PORT}/api/xendit/status/:id`);
  console.log(`📍 Webhook: http://localhost:${PORT}/api/xendit/webhook`);
  console.log(`📍 Health: http://localhost:${PORT}/health\n`);
});