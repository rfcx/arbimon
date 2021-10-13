import { createApp } from 'vue'

import * as Views from '@/_components'
import { Auth0 } from './_services/auth'
import router from './_services/router'
import stores from './_services/stores'
import App from './app/App.vue'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  const { Auth0Plugin, redirectAfterAuth } = await Auth0.init({ redirectUri: window.location.origin })

  const app = createApp(App)
    .use(Auth0Plugin)
    .use(stores)
    .use(router)

  Object.entries(Views).forEach(([name, view]) => { app.component(name, view) })

  app.mount('#app')
  if (redirectAfterAuth) await router.replace({ path: redirectAfterAuth, query: undefined })
}

void init()
