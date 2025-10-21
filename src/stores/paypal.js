// stores/paypal.js
import { defineStore } from "pinia";

export const usePaypalStore = defineStore("paypal", {
  state: () => ({
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * Create PayPal payment using PayPal SDK buttons
     * @param {number} amount - Payment amount
     * @param {string} currency - Currency code (USD, EUR, etc.)
     * @param {object} metadata - Additional data (packageType, customerEmail, etc.)
     * @param {object} callbacks - { callback: successFn, onClose: cancelFn }
     */
    createPayment(amount, currency = "USD", metadata = {}, callbacks = {}) {
      this.isLoading = true;
      this.error = null;

      const { callback, onClose } = callbacks;

      // Wait for PayPal SDK to be ready
      if (!window.paypal) {
        this.error = "PayPal SDK not loaded";
        this.isLoading = false;
        throw new Error("PayPal SDK not loaded");
      }

      // Clear any existing buttons
      const container = document.getElementById("paypal-button-container");
      if (container) {
        container.innerHTML = "";
      }

      // Render PayPal buttons
      window.paypal.Buttons({
        // Create order on PayPal's servers
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: currency,
                value: amount.toFixed(2)
              },
              description: metadata.packageDescription || `${metadata.packageType} Package`,
              custom_id: metadata.customerEmail || "",
            }]
          });
        },

        // Handle successful payment
        onApprove: async (data, actions) => {
          try {
            const order = await actions.order.capture();
            console.log("✅ PayPal payment successful:", order);
            
            this.isLoading = false;
            
            if (callback) {
              callback({
                orderId: order.id,
                status: order.status,
                payer: order.payer,
                amount: order.purchase_units[0].amount.value,
                metadata
              });
            }
            
            return order;
          } catch (error) {
            console.error("❌ PayPal capture error:", error);
            this.error = error.message;
            this.isLoading = false;
            throw error;
          }
        },

        // Handle cancellation
        onCancel: (data) => {
          console.log("⚠️ PayPal payment cancelled:", data);
          this.isLoading = false;
          
          if (onClose) {
            onClose();
          }
        },

        // Handle errors
        onError: (err) => {
          console.error("❌ PayPal error:", err);
          this.error = err.message || "PayPal payment failed";
          this.isLoading = false;
          
          if (onClose) {
            onClose();
          }
        },

        // Styling options
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        }
      }).render("#paypal-button-container");

      this.isLoading = false;
    },
  },
});