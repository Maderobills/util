import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'

import App from './App.vue'
import router from './router'
import 'notivue/notification.css' 
import 'notivue/animations.css'
import 'notivue/notification-progress.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';


const notivue = createNotivue()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(notivue)
app.use(PrimeVue,{
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark',
            cssLayer: false
        }
      },
})

app.mount('#app')
