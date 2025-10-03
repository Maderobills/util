import { defineStore } from "pinia";


const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

export const usePaystackStore = defineStore("paystack", {
  state: () => ({
    secretKey: PAYSTACK_SECRET_KEY || "",
  }),

  actions: {
    initializePayment( amount, email, ref, { callback, onClose }) {
      if (!window.PaystackPop) {
        console.error("Paystack script not loaded!");
        return;
      }

      const payAmount = amount * 100; // Convert cedi
      const handler = window.PaystackPop.setup({
        key: this.secretKey,
        email,
        amount: payAmount, 
        currency: "GHS",
        ref: ref || `ref_${Date.now()}`,
        callback: (response) => {
          console.log("Payment successful:", response);
          callback(response);},
        onClose: () => {
          console.log("Payment cancelled");
          onClose();
        },
      });

      handler.openIframe();
    },
  },
});
