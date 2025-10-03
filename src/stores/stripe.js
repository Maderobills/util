import { defineStore } from "pinia";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const useStripeStore = defineStore("stripe", {
  state: () => ({
    publishableKey: STRIPE_PUBLISHABLE_KEY || "",
    stripe: null,
    loading: false,
    error: null,
  }),

  actions: {
    async initializeStripe() {
      if (!this.stripe && this.publishableKey) {
        try {
          this.stripe = await loadStripe(this.publishableKey);
        } catch (error) {
          console.error("Failed to initialize Stripe:", error);
          this.error = "Failed to load payment system";
          throw error;
        }
      }
      return this.stripe;
    },

    async createCheckoutSession(amount, currency, metadata) {
      this.loading = true;
      this.error = null;

      try {
        // Don't need Stripe.js for server-side checkout
        // Create checkout session on your backend
        const response = await fetch("http://localhost:3000/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Ensure it's an integer
            currency: currency || "usd", // Changed to USD for Stripe compatibility
            metadata,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const { sessionId, url, error } = await response.json();

        if (error) {
          throw new Error(error);
        }

        // Redirect to Stripe Checkout URL directly
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No checkout URL returned");
        }

        // Note: Code after window.location won't execute as user is redirected
      } catch (err) {
        this.error = err.message;
        console.error("Error creating checkout session:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});