<script setup>
import { RouterLink, RouterView } from 'vue-router'
import ThemeToggler from './components/ui/ThemeToggler.vue';

</script>

<template>
<div class="absolute top-4 right-4">
  <ThemeToggler/></div>
    <main class="flex flex-col items-center justify-center h-screen bg-background dark:bg-dark-background text-white dark:text-white">
      
      <RouterView />
    </main>
  
</template>

<style scoped></style>