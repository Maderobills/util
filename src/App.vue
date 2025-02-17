<script setup>
import { RouterLink, RouterView } from 'vue-router'
import ThemeToggler from './components/ui/ThemeToggler.vue';
import { useDark } from '@vueuse/core';
import { watch } from 'vue';

const isDark = useDark();


const handleThemeChange = () => {
  document.documentElement.classList.add('theme-transition');
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 1000);
};


// Watch for theme changes
watch(isDark, () => {
  handleThemeChange();
});
</script>

<template>
<div class="absolute top-4 right-4">
  <ThemeToggler/></div>
    <main class="flex flex-col items-center justify-center h-screen bg-background dark:bg-dark-background text-white dark:text-white">
      
      <RouterView />
    </main>
  
</template>


<style>
/* Global theme transition styles */
.theme-transition,
.theme-transition *,
.theme-transition *:before,
.theme-transition *:after {
  transition: all 1000ms ease-in-out !important;
  transition-delay: 0 !important;
}

/* Route transition animations */
.scroll-enter-active,
.scroll-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.scroll-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.scroll-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.scroll-smooth {
  scroll-behavior: smooth;
}
</style>