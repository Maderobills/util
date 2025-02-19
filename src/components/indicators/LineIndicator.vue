<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import Text from '@/components/ui/Text.vue';

const props = defineProps({
  progress: Number,
  total: Number,
});

const animatedProgress = ref(0);

const progressWidth = computed(() => {
  if (animatedProgress.value <= 0) return '0%';
  return `${((animatedProgress.value / props.total) * 100).toFixed(1)}%`;
});

const formattedProgress = computed(() => {
  return animatedProgress.value <= 0 ? '0' : animatedProgress.value.toFixed(0);
});

// Dynamically determine progress bar color
const progressColor = computed(() => {
  const percentage = (animatedProgress.value / props.total) * 100;

  if (percentage >= 60) return 'bg-linear-65 from-warning to-success dark:from-dark-warning dark:to-dark-success';
  if (percentage >= 40) return 'bg-linear-65 from-error to-warning dark:from-dark-error dark:to-dark-warning';
  return 'bg-error dark:bg-dark-error';
});

// Animation function
const animateProgress = (start, end, duration = 4000) => {
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    
    animatedProgress.value = start + (end - start) * easeOutQuart;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

// Watch for changes and animate
watch(() => props.progress, (newValue, oldValue) => {
  animateProgress(oldValue || 0, newValue);
}, { immediate: true });

onMounted(() => {
  animateProgress(0, props.progress);
});
</script>

<template>
  <div class="w-full flex flex-col gap-0.5">
    <div class="w-full bg-background dark:bg-dark-background rounded-full shadow shadow-surface dark:shadow-dark-surface">
      <div
        class="h-0.5 rounded transition-all duration-500"
        :class="progressColor"
        :style="{ width: progressWidth, transition: 'width 0.6s ease-out' }"
      ></div>
    </div>
    <div class="flex justify-between">
      <Text :msg="{ info: formattedProgress }" />
      <Text :msg="{ info: progressWidth }" />
    </div>
  </div>
</template>
