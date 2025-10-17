import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

const {
  MONEYGRAM_CLIENT_ID,
  MONEYGRAM_CLIENT_SECRET,
  MONEYGRAM_API_BASE_URL,      // e.g. sandbox or production base URL
  MONEYGRAM_AGENT_PARTNER_ID,  // your assigned partner/agent ID
  // optionally other config (posId, operatorId, etc.)
} = process.env;

// Helper: get OAuth 2 access token
async function getMoneyGramToken() {
  const tokenUrl = `${MONEYGRAM_API_BASE_URL}/oauth2/token`;
  const resp = await axios.post(
    tokenUrl,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      auth: {
        username: MONEYGRAM_CLIENT_ID,
        password: MONEYGRAM_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return resp.data.access_token;
}

// 1️⃣ Quote endpoint
app.post("/api/moneygram/quote", async (req, res) => {
  try {
    const { sendAmount, sendCurrency, destinationCountryCode, serviceOptionCode } = req.body;

    const token = await getMoneyGramToken();

    const payload = {
      targetAudience: "CONSUMER",  // or “CONSUMER_FACING”
      agentPartnerId: MONEYGRAM_AGENT_PARTNER_ID,
      destinationCountryCode,
      serviceOptionCode, // optional: you may restrict to a specific service
      sendAmount: {
        value: sendAmount,
        currencyCode: sendCurrency,
      },
      // optionally: receiveCurrencyCode, etc.
    };

    const resp = await axios.post(
      `${MONEYGRAM_API_BASE_URL}/transfer/v1/transactions/quote`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(resp.data);
  } catch (err) {
    console.error("MoneyGram quote error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to quote MoneyGram transaction",
      details: err.response?.data || err.message,
    });
  }
});

// 2️⃣ Update transaction with sender / receiver / compliance
app.put("/api/moneygram/update/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { sender, receiver, transactionDetails, targetAccount } = req.body;

    const token = await getMoneyGramToken();

    const payload = {
      sender,
      receiver,
      transactionDetails,
      targetAccount, // for bank or wallet deposit modes
    };

    const resp = await axios.put(
      `${MONEYGRAM_API_BASE_URL}/transfer/v1/transactions/${transactionId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(resp.data);
  } catch (err) {
    console.error("MoneyGram update error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to update MoneyGram transaction",
      details: err.response?.data || err.message,
    });
  }
});

// 3️⃣ Commit transaction
app.put("/api/moneygram/commit/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const token = await getMoneyGramToken();

    const resp = await axios.put(
      `${MONEYGRAM_API_BASE_URL}/transfer/v1/transactions/${transactionId}/commit`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(resp.data);
  } catch (err) {
    console.error("MoneyGram commit error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to commit MoneyGram transaction",
      details: err.response?.data || err.message,
    });
  }
});

// Webhook endpoint (if MoneyGram pushes events)
app.post("/api/moneygram/webhook", express.json(), (req, res) => {
  try {
    const event = req.body;
    console.log("MoneyGram webhook received:", event);

    // Process event.type (e.g. transfer.completed, etc.)
    // Update your DB records accordingly

    res.json({ received: true });
  } catch (err) {
    console.error("MoneyGram webhook handler error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// (Optional) Status endpoint (polling)
app.get("/api/moneygram/status/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const token = await getMoneyGramToken();

    const resp = await axios.get(
      `${MONEYGRAM_API_BASE_URL}/transfer/v1/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(resp.data);
  } catch (err) {
    console.error("MoneyGram status check error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch status",
      details: err.response?.data || err.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MoneyGram service running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`MoneyGram quote: POST /api/moneygram/quote`);
  console.log(`MoneyGram update: PUT /api/moneygram/update/:transactionId`);
  console.log(`MoneyGram commit: PUT /api/moneygram/commit/:transactionId`);
  console.log(`MoneyGram webhook: /api/moneygram/webhook`);
  console.log(`MoneyGram status: GET /api/moneygram/status/:transactionId`);
});
