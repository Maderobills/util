import { defineStore } from "pinia";

export const useXenditStore = defineStore("xendit", {
  state: () => ({
    loading: false,
    error: null,
    transaction: null,
    xenditPublicKey: import.meta.env.VITE_XENDIT_PUBLIC_KEY || null,
  }),

  getters: {
    isTestMode: (state) => state.xenditPublicKey?.includes('development'),
    hasValidKey: (state) => state.xenditPublicKey?.startsWith('xnd_public_'),
  },

  actions: {
    /**
     * Initialize and validate Xendit configuration
     */
    validateConfig() {
      console.log('=== Xendit Client Configuration ===');
      console.log('Public Key exists:', !!this.xenditPublicKey);
      console.log('Key prefix:', this.xenditPublicKey?.substring(0, 25) + '...');
      console.log('Valid format:', this.hasValidKey);
      console.log('Test mode:', this.isTestMode);
      console.log('===================================');

      if (!this.xenditPublicKey) {
        throw new Error("Xendit public key not configured in .env file");
      }

      if (!this.hasValidKey) {
        throw new Error("Invalid Xendit public key format. Must start with 'xnd_public_'");
      }

      return true;
    },

    /**
     * Create a Xendit invoice
     * @param {number} amount - Amount to charge (in smallest currency unit)
     * @param {string} currency - Currency code (e.g., 'PHP', 'USD', 'IDR')
     * @param {object} payer - Payer object with email property
     * @param {string} description - Payment description
     */
    async createInvoice(amount, currency, payer, description) {
      this.loading = true;
      this.error = null;

      try {
        // Validate configuration
        this.validateConfig();

        // Validate inputs
        if (!amount || amount <= 0) {
          throw new Error("Invalid amount");
        }

        const email = payer?.email || payer;
        if (!email || !email.includes('@')) {
          throw new Error("Valid email is required");
        }

        console.log('💳 Creating invoice:', { amount, currency, email, description });

        // Create invoice via backend
        const response = await fetch("http://localhost:3001/api/xendit/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            currency: currency || 'PHP',
            payer: { email },
            description,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Server error: ${response.status}`);
        }

        this.transaction = result;
        console.log('✅ Invoice created:', result.id);
        
        return result;
      } catch (err) {
        console.error("❌ Xendit invoice creation failed:", err);
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
        this.validateConfig();

        if (typeof Xendit === 'undefined') {
          throw new Error("Xendit.js library not loaded. Add <script src='https://js.xendit.co/v1/xendit.min.js'></script> to your HTML");
        }

        Xendit.setPublishableKey(this.xenditPublicKey);

        console.log('🔐 Creating card token...');

        // Create card token using public key (client-side)
        const tokenData = await new Promise((resolve, reject) => {
          Xendit.card.createToken(cardData, (err, token) => {
            if (err) {
              console.error('Token creation error:', err);
              reject(new Error(err.message || 'Card tokenization failed'));
            } else {
              resolve(token);
            }
          });
        });

        console.log('✅ Token created:', tokenData.id);

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

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Server error: ${response.status}`);
        }

        this.transaction = result;
        console.log('✅ Card charged successfully');
        
        return result;
      } catch (err) {
        console.error("❌ Card payment failed:", err);
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
        if (!invoiceId) {
          throw new Error("Invoice ID is required");
        }

        console.log('🔍 Checking invoice status:', invoiceId);

        const response = await fetch(
          `http://localhost:3001/api/xendit/status/${invoiceId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch status");
        }

        this.transaction = { ...this.transaction, ...data };
        console.log('✅ Status:', data.status);
        
        return data;
      } catch (err) {
        console.error("⚠️ Error checking Xendit invoice status:", err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear transaction data
     */
    clearTransaction() {
      this.transaction = null;
      this.error = null;
    },
  },
});