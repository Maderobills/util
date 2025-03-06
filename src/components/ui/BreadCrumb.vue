<template>
  <div class="flex items-center gap-1">
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <!-- Link for all but the last item -->
      <template v-if="index < breadcrumbs.length - 1">
        <RouterLink :to="crumb.route">
          <div class="flex items-center gap-1">
            <component 
              v-if="crumb.icon" 
              :is="crumb.icon" 
              class="w-4 h-4 text-info dark:text-dark-info"
            />
            <Text :msg="{ info: crumb.label }" />
          </div>
        </RouterLink>
        <ChevronRight class="w-4 h-4 text-muted dark:text-dark-muted" />
      </template>
      
      <!-- Current (last) item - not a link -->
      <template v-else>
        <div class="flex items-center gap-1">
          <component 
            v-if="crumb.icon" 
            :is="crumb.icon" 
            class="w-4 h-4 text-muted dark:text-dark-muted"
          />
          <Text :msg="{ mute: crumb.label }" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import Text from '@/components/ui/Text.vue';
import { useBreadCrumbStore } from '@/stores/breadCrumb';

const breadcrumbStore = useBreadCrumbStore();
const breadcrumbs = computed(() => breadcrumbStore.breadcrumbs);
</script>