<!-- Parent component -->
<script setup>
import { ref } from 'vue';
import Text from '../components/ui/Text.vue';
import Button from '@/components/ui/Button.vue';
import { AlertCircle, Ban, Bell, CheckCircle, Info, SpellCheck } from 'lucide-vue-next';
import {
  Notivue, NotificationProgress,
  Notification,
  outlinedIcons, push
} from 'notivue';

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
  { primary: 'Primary', onClick: handleClickprimary, icon: SpellCheck },
  { success: 'Success', onClick: handleClicksuccess, icon: CheckCircle },
  { error: 'Error', onClick: handleClickerror, icon: Ban },
  { warning: 'Warning', onClick: handleClickwarning, icon: AlertCircle },
  { info: 'Info', onClick: handleClickinfo, icon: Info },
  { secondary: 'Secondary', onClick: handleClicksecondary, icon: Bell },
  { surface: 'Surface', onClick: handleClicksurface, icon: Bell }
]);

const handleClick = () => alert('Success!');
</script>

<template>
  <!-- <Text :msg="bannerMessage" />
  <Text :msg="{ banner: 'just a text' }" />
  <Button :btnText="btnText" />
  <Button 
    :btnText="[{ primary: 'Button' }]" 
    @click="handleClick"
  />-->

  <button @click="push.success('Hello from your first notification!')">
    Push
  </button>

  <Notivue v-slot="item">
    <Notification :item="item">
      <NotificationProgress :item="item"
      :icons="outlinedIcons"/>
    </Notification>
  </Notivue>
    
</template>