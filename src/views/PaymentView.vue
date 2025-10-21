<script setup>
import { onMounted, ref } from 'vue'
import PackageCard from '@/components/PackageCard.vue'
import Packages from '@/stores/packages'
import { usePaystackStore } from '@/stores/paystack'
import { useStripeStore } from '@/stores/stripe'
import { useBinanceStore } from '@/stores/binance'
import { usePaymongoStore } from '@/stores/paymongo'
import { useXenditStore } from '@/stores/xendit'
import { usePaypalStore } from '@/stores/paypal'

const paystackStore = usePaystackStore()
const stripeStore = useStripeStore()
const binanceStore = useBinanceStore()
const paymongoStore = usePaymongoStore()
const xenditStore = useXenditStore()
const paypalStore = usePaypalStore()

onMounted(() => {
  console.log('=== Environment Variables Debug ===')
  console.log('All env vars:', import.meta.env)
  console.log('Binance API Key:', import.meta.env.VITE_BINANCE_API_KEY)
  console.log('Paymongo Public Key:', import.meta.env.VITE_PAYMONGO_PUBLIC_KEY)
  console.log('Xendit API Key:', import.meta.env.VITE_XENDIT_API_KEY)
  console.log('PayPal Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID)
  console.log('Binance Secret exists:', !!import.meta.env.VITE_BINANCE_API_SECRET)
  console.log('Xendit Secret exists:', !!import.meta.env.VITE_XENDIT_SECRET_KEY)
  console.log('==================================')
  
  // Load PayPal SDK
  loadPayPalSDK()
})

// Load PayPal SDK dynamically
function loadPayPalSDK() {
  if (document.getElementById('paypal-sdk')) return // Already loaded
  
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  if (!clientId) {
    console.error('PayPal Client ID not configured')
    return
  }
  
  const script = document.createElement('script')
  script.id = 'paypal-sdk'
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
  script.async = true
  script.onload = () => console.log('PayPal SDK loaded')
  script.onerror = () => console.error('Failed to load PayPal SDK')
  document.head.appendChild(script)
}

// Payment method selection
const paymentMethod = ref('paystack') // Default to paystack
const showPayPalModal = ref(false)
const selectedPackageForPayPal = ref(null)

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
  else if (paymentMethod.value === 'paypal') {
    processPayPalPayment(packageData, email)
      .then((res) => console.log("PayPal payment success:", res))
      .catch((err) => console.error("PayPal payment failed:", err.message))
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
      'PHP', // Currency: PHP, USD, IDR, etc.
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

// Process payment with PayPal
async function processPayPalPayment(packageData, emailValue) {
  try {
    selectedPackageForPayPal.value = packageData
    showPayPalModal.value = true
    
    // Wait for modal to render, then initialize PayPal buttons
    setTimeout(() => {
      paypalStore.initializePayPalButtons(
        packageData.price,
        'USD',
        {
          packageType: packageData.type,
          packageDescription: packageData.description,
          customerEmail: emailValue,
        },
        {
          callback: (response) => {
            console.log('PayPal payment successful:', response)
            showPayPalModal.value = false
            alert('Payment successful!')
          },
          onClose: () => {
            showPayPalModal.value = false
          }
        }
      )
    }, 100)
  } catch (error) {
    console.error('❌ PayPal payment error:', error)
    alert(`Payment failed: ${error.message}`)
    throw error
  }
}

function closePayPalModal() {
  showPayPalModal.value = false
  selectedPackageForPayPal.value = null
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
      <button
        @click="paymentMethod = 'paypal'"
        :class="[
          'px-6 py-2 rounded-lg font-semibold transition-colors',
          paymentMethod === 'paypal'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
      >
        Pay with PayPal
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

    <!-- PayPal Modal -->
    <div 
      v-if="showPayPalModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closePayPalModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            Complete Payment
          </h2>
          <button 
            @click="closePayPalModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div v-if="selectedPackageForPayPal" class="mb-4">
          <p class="text-gray-600 dark:text-gray-300">
            Package: <strong>{{ selectedPackageForPayPal.type }}</strong>
          </p>
          <p class="text-gray-600 dark:text-gray-300">
            Amount: <strong>${{ selectedPackageForPayPal.price }}</strong>
          </p>
        </div>

        <!-- PayPal Button Container -->
        <div id="paypal-button-container"></div>
      </div>
    </div>
  </div>
</template>