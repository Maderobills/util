// stores/binance.js
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useBinanceStore = defineStore('binance', {
  state: () => ({
    isProcessing: false,
    lastOrderId: null,
  }),

  actions: {
    /**
     * Create a USDT Payment Order
     * @param {string} orderId - Your unique order ID
     * @param {string} amount - Amount in USDT
     * @param {Object} metadata - Additional order metadata
     */
    async createUSDTOrder(orderId, amount, metadata = {}) {
      this.isProcessing = true
      
      try {
        console.log('Creating Binance order via backend...')
        
        const response = await axios.post(`${API_BASE_URL}/api/binance/create-order`, {
          orderId,
          amount,
          metadata,
        })

        this.lastOrderId = orderId
        console.log('Binance Response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('Binance payment error:', error)
        if (error.response) {
          console.error('Response error:', error.response.data)
        }
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    /**
     * Query order status
     * @param {string} orderId - The order ID to query
     */
    async queryOrder(orderId) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/binance/query-order`, {
          orderId,
        })
        
        return response.data
      } catch (error) {
        console.error('Query order error:', error)
        throw error
      }
    },
  },
})