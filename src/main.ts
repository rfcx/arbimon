import { createApp } from 'vue'

import App from './App.vue'
import { Auth0 } from './auth2'
// import { Auth0Plugin } from './auth/auth'
import router from './router'
import stores from './stores'

import 'virtual:windi.css'
import './styles/global.scss'

// createApp(App)
//   .use(Auth0Plugin, {
//     redirectUri: window.location.origin,
//     onRedirectCallback: async (appState: { targetUrl: string } | undefined) => {
//       await router.push(appState?.targetUrl ? appState.targetUrl : window.location.pathname)
//     }
//   })
//   .use(stores)
//   .use(router)
//   .mount('#app')

async function init (): Promise<void> {
  const Auth0Plugin = await Auth0.init({
    redirectUri: window.location.origin,
    onRedirectCallback: (appState) => {
      void router.push(appState?.targetUrl ?? window.location.pathname)
    }
  })

  const app = createApp(App)
  app.use(Auth0Plugin)
    .use(stores)
    .use(router)
    .mount('#app')
}

void init()
