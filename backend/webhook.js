// server/binance-api.js
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import axios from 'axios'

const app = express()
app.use(cors())
app.use(express.json())

const BINANCE_API_KEY = process.env.BINANCE_API_KEY
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET

function sign(payload) {
  return crypto.createHmac('sha512', BINANCE_API_SECRET).update(payload).digest('hex')
}

// Create order endpoint
app.post('/api/binance/create-order', async (req, res) => {
  try {
    const { orderId, amount, metadata } = req.body

    const url = 'https://bpay.binanceapi.com/binancepay/openapi/v2/order'
    const timestamp = Date.now().toString()
    const nonce = Math.random().toString(36).substring(2, 15)

    const data = {
      merchantTradeNo: orderId,
      orderAmount: parseFloat(amount).toFixed(2),
      currency: 'USDT',
      goods: {
        goodsType: '01',
        goodsCategory: 'D000',
        referenceGoodsId: orderId,
        goodsName: metadata?.packageDescription || `Order ${orderId}`,
      },
    }

    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(data)}\n`
    const signature = sign(payload)

    const headers = {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': BINANCE_API_KEY,
      'BinancePay-Signature': signature,
    }

    const response = await axios.post(url, data, { headers })
    res.json(response.data)
  } catch (error) {
    console.error('Binance API error:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Payment failed', 
      details: error.response?.data || error.message 
    })
  }
})

// Query order endpoint
app.post('/api/binance/query-order', async (req, res) => {
  try {
    const { orderId } = req.body

    const url = 'https://bpay.binanceapi.com/binancepay/openapi/v2/order/query'
    const timestamp = Date.now().toString()
    const nonce = Math.random().toString(36).substring(2, 15)

    const data = { merchantTradeNo: orderId }
    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(data)}\n`
    const signature = sign(payload)

    const headers = {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': BINANCE_API_KEY,
      'BinancePay-Signature': signature,
    }

    const response = await axios.post(url, data, { headers })
    res.json(response.data)
  } catch (error) {
    console.error('Query order error:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Query failed', 
      details: error.response?.data || error.message 
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Binance API server running on port ${PORT}`)
})