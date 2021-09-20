import { createApp } from 'vue'

import App from './App.vue'
import { Auth0 } from './auth'
import router from './router'
import stores from './stores'

import 'virtual:windi.css'
import './styles/global.scss'

async function init (): Promise<void> {
  const Auth0Plugin = await Auth0.init({
    redirectUri: window.location.origin,
    onRedirectCallback: (appState) => {
      void router.replace(appState?.targetUrl ?? window.location.pathname)
    }
  })

  createApp(App)
    .use(Auth0Plugin)
    .use(stores)
    .use(router)
    .mount('#app')
}

void init()
