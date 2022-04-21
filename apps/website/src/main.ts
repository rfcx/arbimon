import { createApp } from 'vue'
import VueGtag from 'vue-gtag'
import { VueQueryPlugin } from 'vue-query'

import appComponent from '@/_layout'
import { ANALYTICS_CONFIGS } from '~/analytics'
import { useAuthClient } from '~/auth-client'
import { FEATURE_TOGGLES } from '~/feature-toggles'
import router, { ROUTE_NAMES } from '~/router'
import { pinia, useStore } from '~/store'
import { componentsFromGlob } from '~/vue/register-components'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  const authClient = useAuthClient()
  const redirectAfterAuth = await authClient.init(window.location.origin)

  const app = createApp(appComponent)
    .use(pinia)
    .use(router)
    .use(VueGtag, ANALYTICS_CONFIGS, router)
    .use(VueQueryPlugin)
    .use(componentsFromGlob, import.meta.globEager('/src/_components/**/*.vue'))
    .provide('auth', authClient)
    .provide('store', useStore())
    .provide('TOGGLES', FEATURE_TOGGLES)
    .provide('ROUTE_NAMES', ROUTE_NAMES)

  app.provide('gtag', app.config.globalProperties.$gtag)
  app.mount('#app')

  if (redirectAfterAuth !== undefined) await router.replace(redirectAfterAuth)
}

void init()
