import axios from 'axios'
import { defineStore } from 'pinia'

export const usePaymongoStore = defineStore('paymongo', {
  actions: {
    async createCheckoutSession(amount, email, description, metadata) {
      try {
        const payload = {
          amount, // e.g. 120
          currency: 'USD', // PayMongo supports PHP only
          email,
          description,
          metadata, // e.g. { packageType: 'Family' }
        }

        console.log('📦 Sending to backend:', payload)

        const response = await axios.post(
          'http://localhost:3001/api/paymongo/create-checkout',
          payload
        )

        console.log('✅ PayMongo response:', response.data)
        return response.data // should contain { url: 'https://checkout.paymongo.com/...' }
      } catch (error) {
        console.error('❌ PayMongo error:', error.response?.data || error.message)
        throw new Error('Failed to create PayMongo checkout session')
      }
    },
  },
})
