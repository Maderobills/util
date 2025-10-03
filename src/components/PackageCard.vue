<script setup>
const props = defineProps({
  type: String,
  description: String,
  price: Number
})

const emit = defineEmits(["click"])

function handleClick() {
  emit("click", props) // emit package data when clicked
}
</script>

<template>
  <div 
    class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-lg transition"
    @click="handleClick"
  >
    <h1 class="text-4xl font-bold text-center text-foreground dark:text-dark-foreground">
      {{ props.type || 'Basic' }}
    </h1>
    <p class="text-center text-foreground dark:text-dark-foreground">
      {{ props.description || 'Basic package description' }}
    </p>
    <h3 class="text-2xl font-bold text-center text-foreground dark:text-dark-foreground">
      {{ props.price ? `$${props.price}` : '$9.99' }}
    </h3>
  </div>
</template>
