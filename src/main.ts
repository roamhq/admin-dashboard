document.title = 'Roam'

import './styles/main.css'

import { createApp } from 'vue'
import AppShell from './components/AppShell.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(AppShell)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth state from localStorage
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app') 