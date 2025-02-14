<script setup>
import { ref } from 'vue';
import Text from '../components/ui/Text.vue';

const bannerMessage = ref({
  banner: 'Welcome to Our Site!',
    heading: 'Welcome to Our Site!',
    subheading: 'Your One-Stop Solution',
    body: 'Explore our wide range of services tailored just for you.',
    success: 'Operation completed successfully!',
    error: 'There was an error processing your request.',
    warning: 'Please check your inputs.',
    info: 'New features are coming soon!'
});
</script>

<template>
  <Text :msg="bannerMessage" />
  <Text :msg="{ banner: 'just a text' }" />
  
</template>