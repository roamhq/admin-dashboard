document.title = "Roam";

import './styles/main.css'

import { createApp } from 'vue'
import AppShell from './components/AppShell.vue'
import router from './router'

const app = createApp(AppShell)

app.use(router)
app.mount('#app')