<!-- Parent component -->
<script setup>
import { ref } from 'vue';
import Text from '../components/ui/Text.vue';
import Button from '@/components/ui/Button.vue';

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

const handleClickprimary = () => alert('Primary!');
const handleClicksuccess = () => alert('Success!');
const handleClickerror = () => alert('Error!');
const handleClickwarning = () => alert('Warning!');
const handleClickinfo = () => alert('Info!');
const handleClicksecondary = () => alert('Secondary!');
const handleClicksurface = () => alert('Surface!');

const btnText = ref([
  { primary: 'Primary', onClick: handleClickprimary },
  { success: 'Success', onClick: handleClicksuccess },
  { error: 'Error', onClick: handleClickerror },
  { warning: 'Warning', onClick: handleClickwarning },
  { info: 'Info', onClick: handleClickinfo },
  { secondary: 'Secondary', onClick: handleClicksecondary },
  { surface: 'Surface', onClick: handleClicksurface }
]);

const handleClick = () => alert('Success!');
</script>

<template>
  <Text :msg="bannerMessage" />
  <Text :msg="{ banner: 'just a text' }" />
  <Button :btnText="btnText" />
  <Button 
    :btnText="[{ primary: 'Button' }]" 
    @click="handleClick"
  />
</template>