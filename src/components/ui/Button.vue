<script setup>
const props = defineProps({
  btnText: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = (handler) => {
  if (handler) {
    handler();
  } else {
    emit('click');
  }
};
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <template v-for="(btn, index) in btnText" :key="index">
      <button 
        v-if="btn.primary" 
        @click="handleClick(btn.onClick)" 
        class="bg-primary dark:bg-dark-primary text-white px-4 py-1 shadow rounded-md"
      >
        {{ btn.primary }}
      </button>
      <button 
        v-if="btn.success" 
        @click="handleClick(btn.onClick)" 
        class="bg-success dark:bg-dark-success text-white px-4 py-1 shadow rounded-md"
      >
        {{ btn.success }}
      </button>
      <button 
        v-if="btn.error" 
        @click="handleClick(btn.onClick)" 
        class="bg-error dark:bg-dark-error text-white px-4 py-1 shadow rounded-md"
      >
        {{ btn.error }}
      </button>
      <button 
        v-if="btn.warning" 
        @click="handleClick(btn.onClick)" 
        class="bg-warning dark:bg-dark-warning text-white px-4 py-1 shadow rounded-md"
      >
        {{ btn.warning }}
      </button>
      <button 
        v-if="btn.info" 
        @click="handleClick(btn.onClick)" 
        class="bg-info dark:bg-dark-info text-white px-4 py-1 shadow rounded-md"
      >
        {{ btn.info }}
      </button>
      <button 
        v-if="btn.secondary" 
        @click="handleClick(btn.onClick)" 
        class="bg-secondary dark:bg-dark-secondary text-white px-4 py-1 shadow rounded-md"
      >
        {{ btn.secondary }}
      </button>
      <button 
        v-if="btn.surface" 
        @click="handleClick(btn.onClick)" 
        class="shadow-2xl shadow-foreground dark:shadow-dark-foreground border-foreground dark:border-dark-foreground text-foreground dark:text-dark-foreground px-4 py-1 rounded-md"
      >
        {{ btn.surface }}
      </button>
    </template>
  </div>
</template>

<style scoped>
</style>