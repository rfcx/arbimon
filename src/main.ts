import { createApp } from 'vue'

import appComponent from '@/_layout'
import { useAuthClient } from '~/auth'
import router from '~/router'
import { pinia, useStore } from '~/store'
import * as globalComponents from './_components'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  const authClient = useAuthClient()
  const redirectAfterAuth = await authClient.init(window.location.origin)

  const app = createApp(appComponent)
    .use(pinia)
    .use(router)
    .provide('auth', authClient)
    .provide('store', useStore())

  // TODO 156 - Make this an installer
  Object.entries(globalComponents).forEach(([name, component]) => { app.component(name, component) })
  app.mount('#app')

  if (redirectAfterAuth) await router.replace({ path: redirectAfterAuth, query: undefined })
}

void init()
