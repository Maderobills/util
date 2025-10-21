// stores/paypal.js
import { defineStore } from 'pinia'

export const usePaypalStore = defineStore('paypal', {
  state: () => ({
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    isLoading: false,
    error: null
  }),

  actions: {
    /**
     * Create PayPal order
     * @param {number} amount - Amount in USD
     * @param {string} currency - Currency code (default: USD)
     * @param {object} metadata - Additional order metadata
     * @returns {Promise<object>} Order details
     */
    async createOrder(amount, currency = 'USD', metadata = {}) {
      this.isLoading = true
      this.error = null

      try {
        // Call your backend API to create a PayPal order
        const response = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount.toString(),
            currency,
            metadata
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to create PayPal order')
        }

        const data = await response.json()
        return data
      } catch (error) {
        this.error = error.message
        console.error('PayPal order creation error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Initialize PayPal Smart Payment Buttons
     * @param {number} amount - Amount in USD
     * @param {string} currency - Currency code
     * @param {object} metadata - Additional metadata
     * @param {object} options - Callback options
     */
    async initializePayPalButtons(amount, currency = 'USD', metadata = {}, options = {}) {
      return new Promise((resolve, reject) => {
        if (!window.paypal) {
          reject(new Error('PayPal SDK not loaded'))
          return
        }

        const paypalButtonsConfig = {
          createOrder: async (data, actions) => {
            try {
              const order = await this.createOrder(amount, currency, metadata)
              return order.id // Return PayPal order ID
            } catch (error) {
              console.error('Error creating order:', error)
              reject(error)
            }
          },

          onApprove: async (data, actions) => {
            try {
              // Capture the payment
              const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: data.orderID
                })
              })

              const captureData = await response.json()

              if (options.callback) {
                options.callback(captureData)
              }

              resolve(captureData)
            } catch (error) {
              console.error('Error capturing payment:', error)
              reject(error)
            }
          },

          onError: (err) => {
            console.error('PayPal error:', err)
            this.error = err.message || 'PayPal payment error'
            if (options.onClose) {
              options.onClose()
            }
            reject(err)
          },

          onCancel: () => {
            console.log('Payment cancelled by user')
            if (options.onClose) {
              options.onClose()
            }
            reject(new Error('Payment cancelled by user'))
          }
        }

        // Render PayPal buttons
        window.paypal.Buttons(paypalButtonsConfig).render('#paypal-button-container')
      })
    },

    /**
     * Capture PayPal order
     * @param {string} orderId - PayPal order ID
     * @returns {Promise<object>} Capture details
     */
    async captureOrder(orderId) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to capture PayPal order')
        }

        const data = await response.json()
        return data
      } catch (error) {
        this.error = error.message
        console.error('PayPal capture error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})