import { createApp } from 'vue'

import App from './App.vue'
import { Auth0Plugin } from './auth/auth'
import router from './router'

import 'virtual:windi.css'
import './styles/global.scss'

createApp(App)
  .use(Auth0Plugin, {
    redirectUri: window.location.origin,
    onRedirectCallback: async (appState: { targetUrl: string } | undefined) => {
      await router.push(appState?.targetUrl ? appState.targetUrl : window.location.pathname)
    }
  })
  .use(router)
  .mount('#app')
