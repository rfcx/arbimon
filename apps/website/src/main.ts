import { createApp } from 'vue'
import VueGtag from 'vue-gtag'
import { VueQueryPlugin } from 'vue-query'

import { getApiClient } from '@rfcx-bio/utils/api'

import appComponent from '@/_layout'
import { ANALYTICS_CONFIGS } from '~/analytics'
import { getIdToken, handleAuthCallback, useAuth0Client } from '~/auth-client'
import { FEATURE_TOGGLES } from '~/feature-toggles'
import router, { ROUTE_NAMES } from '~/router'
import { pinia, useStoreOutsideSetup } from '~/store'
import { componentsFromGlob } from '~/vue/register-components'
import { apiClientBioKey, apiClientCoreKey, apiMediaKey, authClientKey, gtagKey, routeNamesKey, storeKey, togglesKey } from './globals'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  // Authenticate current user
  const authClient = await useAuth0Client()
  const redirectAfterAuth = await handleAuthCallback(authClient)
  const user = await authClient.getUser()

  // Save to store
  const store = useStoreOutsideSetup()

  // Updates user and selected project to the first project in the array (if there is some).
  // This will not update the project's filters. That will be updated upon route enter.
  await store.updateUser(user)

  // Setup API token
  const getToken = user ? async () => await getIdToken(authClient) : undefined
  const apiClientBio = getApiClient(import.meta.env.VITE_BIO_API_BASE_URL, getToken)
  const apiClientCore = getApiClient(import.meta.env.VITE_CORE_API_BASE_URL, getToken)
  // TODO: This should be changed to a proper environment variable
  const apiMedia = getApiClient(import.meta.env.VITE_CORE_API_BASE_URL === 'https://api.rfcx.org' ? 'https://media-api.rfcx.org' : import.meta.env.VITE_CORE_API_BASE_URL, getToken)

  // Setup app
  const app = createApp(appComponent)
    .use(pinia)
    .use(router)
    .use(VueGtag, ANALYTICS_CONFIGS, router)
    .use(VueQueryPlugin)
    .use(componentsFromGlob, import.meta.globEager('/src/_components/**/*.vue'))

  // Inject globals
  app
    .provide(authClientKey, authClient)
    .provide(apiClientBioKey, apiClientBio)
    .provide(apiClientCoreKey, apiClientCore)
    .provide(apiMediaKey, apiMedia)
    .provide(storeKey, store) // TODO: Delete this & use useStore() directly in components
    .provide(gtagKey, app.config.globalProperties.$gtag)
    .provide(togglesKey, FEATURE_TOGGLES)
    .provide(routeNamesKey, ROUTE_NAMES)

  // Go go go!
  app.mount('#app')

  // Handle redirects
  if (redirectAfterAuth !== undefined) await router.replace(redirectAfterAuth)
}

void init()
