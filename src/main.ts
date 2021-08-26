import { createApp } from 'vue'

import { Auth0 } from '@/services/auth/auth.service'
import App from './App.vue'
import router from './router'

import 'virtual:windi.css'
import './styles/global.scss'

async function init (): Promise<void> {
  const AuthPlugin = await Auth0.init({
    redirectUri: window.location.origin,
    onRedirectCallback: async (appState) => {
      await router.push(appState?.targetUrl ? appState.targetUrl : window.location.pathname)
    }
  })

  createApp(App)
    .use(AuthPlugin)
    .use(router)
    .mount('#app')
}

void init()
