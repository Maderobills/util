import { defineStore } from "pinia";

export const useMoneyGramStore = defineStore("moneygram", {
  state: () => ({
    loading: false,
    error: null,
    transaction: null, // stores complete transaction info
  }),

  actions: {
    /**
     * Send money via MoneyGram (simulated or real backend)
     */
  // moneygram.js
async sendMoney(amount, currency, receiver, sender) {
  this.loading = true
  this.error = null

  try {
    const response = await fetch("http://localhost:3001/api/moneygram/create-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        receiver,
        sender,
      }),
    })

    if (!response.ok) throw new Error(`Server error: ${response.status}`)
    const result = await response.json()
    this.transactionId = result.transactionId
    return result
  } catch (err) {
    this.error = err.message
    console.error("MoneyGram transaction failed:", err)
    throw err
  } finally {
    this.loading = false
  }
},

    /**
     * Check the status of a transfer using its transaction ID
     */
    async checkTransactionStatus(transactionId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `http://localhost:3001/api/moneygram/status/${transactionId}`
        );

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to fetch status");

        this.transaction = { ...this.transaction, status: data.status };
        return data;
      } catch (err) {
        console.error("⚠️ Error checking MoneyGram status:", err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
