import { createApp } from 'vue'

import appComponent from '@/_layout'
import { useAuthClient } from '~/auth'
import { featureToggles } from '~/feature-toggles'
import router from '~/router'
import { pinia, useStore } from '~/store'
import { componentsFromGlob } from '~/vue/register-components'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  const authClient = useAuthClient()
  const redirectAfterAuth = await authClient.init(window.location.origin)

  createApp(appComponent)
    .use(pinia)
    .use(router)
    .use(componentsFromGlob, import.meta.globEager('/src/_components/**/*.vue'))
    .provide('auth', authClient)
    .provide('store', useStore())
    .provide('toggles', featureToggles)
    .mount('#app')

  if (redirectAfterAuth !== undefined) await router.replace(redirectAfterAuth)
}

void init()
