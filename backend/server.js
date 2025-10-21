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
console.log('===========================');

if (!XENDIT_SECRET_KEY) {
  console.error('⚠️ WARNING: XENDIT_SECRET_KEY is not set in environment variables!');
}

/**
 * Create Xendit Invoice
 */
app.post("/api/xendit/create-invoice", async (req, res) => {
  try {
    const { amount, currency, payer, description } = req.body;

    console.log('Creating invoice with:', {
      amount,
      currency,
      payer_email: payer.email,
      description
    });

    const response = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id: "invoice-" + Date.now(),
        amount,
        currency: currency || "PHP",
        payer_email: payer.email,
        description,
        success_redirect_url: "http://localhost:5173/payment-success",
        failure_redirect_url: "http://localhost:5173/payment-failed",
      },
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
    res.json(response.data);
  } catch (err) {
    console.error("❌ Xendit Create Invoice Error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: err.response?.data?.message || err.message,
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

    const response = await axios.get(
      `https://api.xendit.co/v2/invoices/${id}`, 
      {
        auth: { 
          username: XENDIT_SECRET_KEY, 
          password: "" 
        }
      }
    );

    console.log('✅ Invoice status retrieved:', response.data.status);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Xendit Status Check Error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: err.response?.data?.message || err.message 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Xendit backend running on port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/xendit/create-invoice`);
});