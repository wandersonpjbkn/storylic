// core
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import persisteStorage from 'pinia-plugin-persistedstate'
import VueGtm from '@gtm-support/vue-gtm'

// components
import App from './App.vue'

// composables
import router from './router'

// styles
import '@/assets/css/style.css'
import '@/assets/scss/main.scss'

// init
const app = createApp(App)
const pinia = createPinia()
const head = createHead()

// config :: core
pinia.use(persisteStorage)

// config :: components
app.use(pinia)
app.use(head)
app.use(VueGtm, {
  id: import.meta.env.VITE_GTM_ID,
  defer: false,
  compatibility: false,
  enabled: import.meta.env.PROD,
  loadScript: true,
  vueRouter: router,
  trackOnNextTick: false,
})

// config :: composables
app.use(router)

// build
app.mount('#app')
