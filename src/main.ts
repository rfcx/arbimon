import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import 'element-plus/lib/theme-chalk/index.css'

createApp(App)
  .use(ElementPlus)
  .use(router)
  .mount('#app')
