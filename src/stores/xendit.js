import { defineStore } from "pinia";

export const useXenditStore = defineStore("xendit", {
  state: () => ({
    loading: false,
    error: null,
    transaction: null,
    xenditPublicKey: import.meta.env.VITE_XENDIT_PUBLIC_KEY || null,
  }),

  actions: {
    /**
     * Create a Xendit invoice using Xendit.js (client-side)
     * @param {number} amount - Amount to charge
     * @param {string} currency - Currency code (e.g., 'PHP', 'USD', 'IDR')
     * @param {object} payer - Payer object with email property
     * @param {string} description - Payment description
     */
    async createInvoice(amount, currency, payer, description) {
      this.loading = true;
      this.error = null;

      try {
        if (!this.xenditPublicKey) {
          throw new Error("Xendit public key not configured");
        }

        // Initialize Xendit with public key
        if (typeof Xendit === 'undefined') {
          throw new Error("Xendit.js library not loaded");
        }

        Xendit.setPublishableKey(this.xenditPublicKey);

        // Create invoice via backend (still needs backend for invoice creation)
        const response = await fetch("http://localhost:3001/api/xendit/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            currency: currency || 'PHP',
            payer: {
              email: payer.email || payer
            },
            description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        this.transaction = result;
        
        return result;
      } catch (err) {
        console.error("Xendit invoice creation failed:", err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a tokenized card payment (client-side with public key)
     * @param {object} cardData - Card data object
     * @param {number} amount - Amount to charge
     * @param {string} currency - Currency code
     */
    async createCardToken(cardData, amount, currency) {
      this.loading = true;
      this.error = null;

      try {
        if (!this.xenditPublicKey) {
          throw new Error("Xendit public key not configured");
        }

        if (typeof Xendit === 'undefined') {
          throw new Error("Xendit.js library not loaded");
        }

        Xendit.setPublishableKey(this.xenditPublicKey);

        // Create card token using public key (client-side)
        const tokenData = await new Promise((resolve, reject) => {
          Xendit.card.createToken(cardData, (err, token) => {
            if (err) reject(err);
            else resolve(token);
          });
        });

        // Send token to backend for charge
        const response = await fetch("http://localhost:3001/api/xendit/charge-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token_id: tokenData.id,
            amount,
            currency: currency || 'PHP',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        this.transaction = result;
        
        return result;
      } catch (err) {
        console.error("Card payment failed:", err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Check invoice status
     * @param {string} invoiceId - The Xendit invoice ID
     */
    async checkInvoiceStatus(invoiceId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `http://localhost:3001/api/xendit/status/${invoiceId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch status");
        }

        this.transaction = { ...this.transaction, status: data.status };
        return data;
      } catch (err) {
        console.error("⚠️ Error checking Xendit invoice status:", err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});