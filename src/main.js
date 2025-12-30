import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

import store from '@/store'
app.use(store)

import router from '@/router'
app.use(router)

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
app.config.globalProperties.$toast = toast;

app.mount('#app')
