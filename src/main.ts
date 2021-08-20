import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './styles/global.scss'

createApp(App)
  .use(ElementPlus)
  .use(router)
  .mount('#app')
