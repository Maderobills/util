<script setup>
import { computed } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggleTheme = useToggle(isDark);

const activeIcon = computed(() => (isDark.value ? Moon : Sun));
const activeLabel = computed(() => (isDark.value ? 'Switch to light mode' : 'Switch to dark mode'));
</script>

<template>
    <button
      @click="toggleTheme()"
      class="group relative p-2 rounded-full transition-all duration-300 bg-background dark:bg-dark-background hover:bg-surface dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-outline focus:ring-offset-2 dark:focus:ring-offset-dark-outline shadow-xl shadow-dark-surface"
      :aria-label="activeLabel"
    >
      <component
        :is="activeIcon"
        class="w-3 h-3 text-foreground dark:text-dark-foreground transition-transform duration-300 group-hover:scale-110"
        :stroke-width="1.5"
      />
    </button>
</template>