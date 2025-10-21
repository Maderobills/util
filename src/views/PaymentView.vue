<script setup>
import { onMounted, ref } from 'vue'
import PackageCard from '@/components/PackageCard.vue'
import Packages from '@/stores/packages'
import { usePaystackStore } from '@/stores/paystack'
import { useStripeStore } from '@/stores/stripe'
import { useBinanceStore } from '@/stores/binance'
import { usePaymongoStore } from '@/stores/paymongo'
import { useXenditStore } from '@/stores/xendit'

const paystackStore = usePaystackStore()
const stripeStore = useStripeStore()
const binanceStore = useBinanceStore()
const paymongoStore = usePaymongoStore()
const xenditStore = useXenditStore()

onMounted(() => {
  console.log('=== Environment Variables Debug ===')
  console.log('All env vars:', import.meta.env)
  console.log('Binance API Key:', import.meta.env.VITE_BINANCE_API_KEY)
  console.log('Paymongo Public Key:', import.meta.env.VITE_PAYMONGO_PUBLIC_KEY)
  console.log('Xendit API Key:', import.meta.env.VITE_XENDIT_API_KEY)
  console.log('Binance Secret exists:', !!import.meta.env.VITE_BINANCE_API_SECRET)
  console.log('Xendit Secret exists:', !!import.meta.env.VITE_XENDIT_SECRET_KEY)
  console.log('==================================')
})

// Payment method selection
const paymentMethod = ref('paystack') // Default to paystack

// Handle package selection
function selectPackage(packageData) {
  console.log('Selected package:', packageData)

  const email = "dennisbortey60@gmail.com"

  if (paymentMethod.value === 'paystack') {
    processPaystackPayment(packageData.price, email)
      .then((res) => console.log("Paystack payment success:", res))
      .catch((err) => console.error("Paystack payment failed:", err.message))
  } 
  else if (paymentMethod.value === 'stripe') {
    processStripePayment(packageData, email)
      .then((res) => console.log("Stripe payment success:", res))
      .catch((err) => console.error("Stripe payment failed:", err.message))
  } 
  else if (paymentMethod.value === 'binance') {
    processBinancePayment(packageData, email)
      .then((res) => console.log("Binance payment success:", res))
      .catch((err) => console.error("Binance payment failed:", err.message))
  } 
  else if (paymentMethod.value === 'paymongo') {
    processPaymongoPayment(packageData, email)
      .then((res) => console.log("PayMongo payment success:", res))
      .catch((err) => console.error("PayMongo payment failed:", err.message))
  }
  else if (paymentMethod.value === 'xendit') {
    processXenditPayment(packageData, email)
      .then((res) => console.log("Xendit payment success:", res))
      .catch((err) => console.error("Xendit payment failed:", err.message))
  }
}

// Process payment with Paystack
const processPaystackPayment = async (amount, emailValue) => {
  return new Promise((resolve, reject) => {
    paystackStore.initializePayment(
      amount,
      emailValue,
      `ref_${Date.now()}`,
      {
        callback: resolve,
        onClose: () => reject(new Error("Payment cancelled by user"))
      }
    )
  })
}

// Process payment with Stripe
const processStripePayment = async (packageData, emailValue) => {
  return new Promise((resolve, reject) => {
    stripeStore.createCheckoutSession(
      packageData.price,
      'usd',
      {
        packageType: packageData.type,
        packageDescription: packageData.description,
        customerEmail: emailValue,
      },
      {
        callback: resolve,
        onClose: () => reject(new Error("Payment cancelled by user"))
      }
    )
  })
}

// Process payment with Binance
const processBinancePayment = async (packageData, emailValue) => {
  try {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const response = await binanceStore.createUSDTOrder(
      orderId,
      packageData.price.toString(),
      {
        packageType: packageData.type,
        packageDescription: packageData.description,
        customerEmail: emailValue,
      }
    )
    
    if (response.status === 'SUCCESS' && response.data) {
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl
      } else if (response.data.qrcodeLink) {
        console.log('QR Code:', response.data.qrcodeLink)
      }
      return response
    } else {
      throw new Error(response.message || 'Failed to create Binance payment')
    }
  } catch (error) {
    console.error("Binance payment error:", error)
    throw error
  }
}

// Process payment with PayMongo
async function processPaymongoPayment(packageData) {
  try {
    const checkoutUrl = await paymongoStore.createCheckoutSession(
      parseFloat(packageData.price),
      'dennisbortey60@gmail.com',
      'Great for households with shared access and family-friendly features.' + packageData.type,
      { packageType: packageData.type }
    )

    // Redirect user to PayMongo checkout page
    window.location.href = checkoutUrl.url
  } catch (err) {
    console.error('PayMongo payment failed:', err.message)
  }
}

// Process payment with Xendit
async function processXenditPayment(packageData, emailValue) {
  try {
    const response = await xenditStore.createInvoice(
      packageData.price,
      'PHP', // or 'USD' depending on your backend setup
      { email: emailValue },
      `${packageData.type} - ${packageData.description}`
    )

    console.log('✅ Xendit response:', response)

    if (response.invoice_url) {
      // Redirect user to Xendit payment page
      window.location.href = response.invoice_url
    } else {
      throw new Error('No invoice URL received from Xendit')
    }

    return response
  } catch (error) {
    console.error('❌ Xendit payment error:', error)
    alert(`Payment failed: ${error.message}`)
    throw error
  }
}

</script>

<template>
  <div>
    <h1 class="text-4xl font-bold text-center text-foreground dark:text-dark-foreground mb-4">
      Select Package
    </h1>

    <!-- Payment Method Selector -->
    <div class="flex justify-center gap-4 mb-6 flex-wrap">
      <button
        @click="paymentMethod = 'paystack'"
        :class="[
          'px-6 py-2 rounded-lg font-semibold transition-colors',
          paymentMethod === 'paystack'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
      >
        Pay with Paystack
      </button>
      <button
        @click="paymentMethod = 'stripe'"
        :class="[
          'px-6 py-2 rounded-lg font-semibold transition-colors',
          paymentMethod === 'stripe'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
      >
        Pay with Stripe
      </button>
      <button
        @click="paymentMethod = 'binance'"
        :class="[
          'px-6 py-2 rounded-lg font-semibold transition-colors',
          paymentMethod === 'binance'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
      >
        Pay with Binance (USDT)
      </button>
      <button
        @click="paymentMethod = 'paymongo'"
        :class="[
          'px-6 py-2 rounded-lg font-semibold transition-colors',
          paymentMethod === 'paymongo'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
      >
        Pay with PayMongo
      </button>
      <button
        @click="paymentMethod = 'xendit'"
        :class="[
          'px-6 py-2 rounded-lg font-semibold transition-colors',
          paymentMethod === 'xendit'
            ? 'bg-teal-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
      >
        Pay with Xendit
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <PackageCard 
        v-for="pac in Packages"
        :key="pac.type"
        :type="pac.type"
        :description="pac.description"
        :price="pac.price"
        @click="() => selectPackage(pac)" 
      />
    </div>
  </div>
</template>