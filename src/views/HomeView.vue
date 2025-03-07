<script setup>
import { ref, watch } from 'vue';
import Text from '../components/ui/Text.vue';
import Button from '@/components/ui/Button.vue';
import { AlertCircle, Ban, Bell, CheckCircle, ChevronRight, Home, Info, SpellCheck } from 'lucide-vue-next';
import {
  Notivue, NotificationProgress,
  Notification,
  outlinedIcons, push
} from 'notivue';
import InputField from '@/components/ui/InputField.vue';
import { Breadcrumb } from 'primevue';
import { useBreadCrumbStore } from '@/stores/breadCrumb';
import BreadCrumb from '@/components/ui/BreadCrumb.vue';
import router from '@/router';

// Input value refs
const searchValue = ref('');
const emailValue = ref('');
const passwordValue = ref('');
const numberValue = ref('');
const phoneValue = ref('');

// Banner message state
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

// Watch all input values
watch(searchValue, (newValue) => {
  bannerMessage.value = {
    ...bannerMessage.value,
    body: `Searching for: ${newValue}`
  };
  if (newValue) push.info(`Searching: ${newValue}`);
});

watch(emailValue, (newValue) => {
  bannerMessage.value = {
    ...bannerMessage.value,
    heading: newValue
  };
  if (newValue && isValidEmail(newValue)) {
    push.success('Valid email format');
  }
});

watch(numberValue, (newValue) => {
  bannerMessage.value = {
    ...bannerMessage.value,
    subheading: `Amount: ${newValue}`
  };
  if (newValue) push.info(`Amount entered: ${newValue}`);
});

watch(phoneValue, (newValue) => {
  if (newValue && isValidPhone(newValue)) {
    push.success('Valid phone format');
  }
});

// Validation helpers
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
};

// Input change handler
const handleInputChange = ({ type, value }) => {
  switch(type) {
    case 'email':
      bannerMessage.value = {
        ...bannerMessage.value,
        heading: value
      };
      break;
    case 'search':
      bannerMessage.value = {
        ...bannerMessage.value,
        body: `Searching for: ${value}`
      };
      break;
    case 'number':
      bannerMessage.value = {
        ...bannerMessage.value,
        subheading: `Amount: ${value}`
      };
      break;
    case 'phone':
      if (isValidPhone(value)) {
        push.success('Valid phone number format');
      }
      break;
  }
};

// Button click handlers
const handleClickprimary = () => {
  push.info('Primary action triggered!');
};
const handleClicksuccess = () => {
  push.success('Success action completed!');
};
const handleClickerror = () => {
  push.error('Error action occurred!');
};
const handleClickwarning = () => {
  push.warning('Warning action triggered!');
};
const handleClickinfo = () => {
  push.info('Info action triggered!');
  alert('Info!');
};
const handleClicksecondary = () => {
  push.info('Secondary action triggered!');
};
const handleClicksurface = () => {
  push.info('Surface action triggered!');
  router.push('/tabs')
};

// Button configuration
const btnText = ref([
  { primary: 'Primary', onClick: handleClickprimary, icon: SpellCheck },
  { success: 'Success', onClick: handleClicksuccess, icon: CheckCircle },
  { error: 'Error', onClick: handleClickerror, icon: Ban },
  { warning: 'Warning', onClick: handleClickwarning, icon: AlertCircle },
  { info: 'Info', onClick: handleClickinfo, icon: Info },
  { secondary: 'Secondary', onClick: handleClicksecondary, icon: Bell },
  { surface: 'Surface', onClick: handleClicksurface, icon: Bell }
]);

// Setup breadcrumbs
const breadcrumbStore = useBreadCrumbStore();
    
// Set full breadcrumb path
breadcrumbStore.setBreadcrumbs([
  { label: 'Home', route: '/', icon: 'home' },
  { label: 'Products', route: '/tabs', icon: 'file' },
  { label: 'Product Details', route: null, icon: null }
]);
</script>

<template>

  <BreadCrumb/>

  <Text :msg="bannerMessage" />
  <Button :btnText="btnText" />
  <Text :msg="{ heading: emailValue }" />

  <Button 
    @click="push.success('Hello from your first notification!')"
    :btnText="[{ info: 'Notification' }]"
  />
   
  <div class="w-68 my-2">
    <InputField
      :inputField="[
        {
          search: 'Search...',
          icon: 'search',
          value: searchValue,
          onInput: (e) => searchValue = e.target.value
        },
        {
          email: 'Enter email',
          icon: 'mail',
          value: emailValue,
          onInput: (e) => emailValue = e.target.value
        },
        {
          password: 'Enter password',
          icon: 'lock',
          value: passwordValue,
          onInput: (e) => passwordValue = e.target.value
        },
        {
          number: 'Enter amount',
          icon: 'hash',
          value: numberValue,
          onInput: (e) => numberValue = e.target.value
        },
        {
          phone: 'Enter phone number',
          icon: 'phone',
          value: phoneValue,
          onInput: (e) => phoneValue = e.target.value
        },
        {
        otp: 'Enter OTP',
        icon: 'otp',
        value: otpValue,
        onInput: (e) => otpValue.value = e.target.value
      }
      ]"
      @valueChange="handleInputChange"
    />
  </div>

  <Notivue v-slot="item">
    <Notification :item="item">
      <NotificationProgress 
        :item="item"
        :icons="outlinedIcons"
      />
    </Notification>
  </Notivue>
</template>