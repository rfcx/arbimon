import { createApp } from 'vue'
import VueGtag from 'vue-gtag'
import { VueQueryPlugin } from 'vue-query'

import { getApiClient } from '@rfcx-bio/utils/api'

import appComponent from '@/_layout'
import { ANALYTICS_CONFIGS } from '~/analytics'
import { getIdToken, useAuth0Client } from '~/auth-client'
import { handleAuthRedirect } from '~/auth-client/auth0-client'
import { FEATURE_TOGGLES } from '~/feature-toggles'
import router, { ROUTE_NAMES } from '~/router'
import { pinia, useStoreOutsideSetup } from '~/store'
import { componentsFromGlob } from '~/vue/register-components'
import { apiClientBioKey, authClientKey, gtagKey, routeNamesKey, storeKey, togglesKey } from './globals'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

async function init (): Promise<void> {
  // Authenticate current user
  const authClient = await useAuth0Client()
  const redirectAfterAuth = await handleAuthRedirect(authClient)
  const user = await authClient.getUser()

  // Save to store
  const store = useStoreOutsideSetup()
  await store.updateUser(user)

  // Setup API token
  const apiClientBio = getApiClient(import.meta.env.VITE_BIO_API_BASE_URL, user ? async () => await getIdToken(authClient) : undefined)

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
    .provide(storeKey, store) // TODO: Replace with useStore()
    .provide(gtagKey, app.config.globalProperties.$gtag)
    .provide(togglesKey, FEATURE_TOGGLES)
    .provide(routeNamesKey, ROUTE_NAMES)

  // Go go go!
  app.mount('#app')

  // Handle redirects
  if (redirectAfterAuth !== undefined) await router.replace(redirectAfterAuth)
  else if (store.selectedProject) await router.replace({ name: ROUTE_NAMES.dashboard, params: { projectSlug: store.selectedProject.slug } })
}

void init()
