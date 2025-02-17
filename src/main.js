import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'

import App from './App.vue'
import router from './router'
import 'notivue/notification.css' 
import 'notivue/animations.css'
import 'notivue/notification-progress.css'


const notivue = createNotivue()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(notivue)

app.mount('#app')
