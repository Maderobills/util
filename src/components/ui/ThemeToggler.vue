<script setup>
import { ref, onMounted } from "vue";

const isDarkMode = ref(false);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark", isDarkMode.value);
};

onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
});

</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 transition-all"
       :class="isDarkMode ? 'bg-dark-background text-dark-foreground' : 'bg-background text-foreground'">
    
    <!-- Theme Toggle Button -->
    <button @click="toggleTheme"
            class="px-4 py-2 rounded-md text-white transition-all"
            :class="isDarkMode ? 'bg-dark-primary' : 'bg-primary'">
      Toggle Theme
    </button>

    </div>
</template>



