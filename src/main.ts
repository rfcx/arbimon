import { createApp } from 'vue'

import appComponent from '@/_layout'
import { Auth0 } from '~/auth'
import router from '~/router'
import { pinia, useStore } from '~/store'
import * as globalComponents from './_components'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  const { Auth0Plugin, redirectAfterAuth } = await Auth0.init({ redirectUri: window.location.origin })

  const app = createApp(appComponent)
    .use(pinia)
    .use(router)
    .provide('store', useStore())

  Object.entries(globalComponents).forEach(([name, component]) => { app.component(name, component) })

  app.mount('#app')
  if (redirectAfterAuth) await router.replace({ path: redirectAfterAuth, query: undefined })
}

void init()
