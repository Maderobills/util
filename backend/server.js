import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Change to https://api-m.paypal.com for production

// Get PayPal access token
async function getAccessToken() {
  try {
    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to get PayPal access token:", error.response?.data || error.message);
    throw error;
  }
}

// ✅ Create PayPal payment (called by client)
app.post("/api/paypal/create-payment", async (req, res) => {
  try {
    const { amount, currency = "USD", description, customId } = req.body;
    const accessToken = await getAccessToken();

    const payment = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: parseFloat(amount).toFixed(2),
            },
            description: description || "Package Purchase",
            custom_id: customId || "",
          },
        ],
        application_context: {
          brand_name: "Your Company Name",
          landing_page: "LOGIN",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: "https://yourwebsite.com/success",
          cancel_url: "https://yourwebsite.com/cancel",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ paymentId: payment.data.id });
  } catch (error) {
    console.error("❌ PayPal create-payment error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create PayPal payment",
      details: error.response?.data || error.message,
    });
  }
});

// ✅ Capture PayPal payment (called after user approves)
app.post("/api/paypal/capture-payment", async (req, res) => {
  try {
    const { paymentId } = req.body;
    const accessToken = await getAccessToken();

    const capture = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${paymentId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Here you can save the transaction to your database
    console.log("✅ Payment captured:", capture.data);

    res.json({
      status: "success",
      paymentId: capture.data.id,
      captureId: capture.data.purchase_units[0].payments.captures[0].id,
      amount: capture.data.purchase_units[0].payments.captures[0].amount.value,
      payer: capture.data.payer,
    });
  } catch (error) {
    console.error("❌ PayPal capture-payment error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to capture PayPal payment",
      details: error.response?.data || error.message,
    });
  }
});

// ✅ Get payment details
app.get("/api/paypal/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const accessToken = await getAccessToken();

    const payment = await axios.get(
      `${PAYPAL_API}/v2/checkout/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(payment.data);
  } catch (error) {
    console.error("❌ PayPal get-payment error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to get payment details",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(3001, () =>
  console.log("✅ PayPal payment backend running at http://localhost:3001")
);