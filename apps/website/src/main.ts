import { VueQueryPlugin } from '@tanstack/vue-query'
import { ViteSSG } from 'vite-ssg'
import VueGtag from 'vue-gtag'

import { getApiClient } from '@rfcx-bio/utils/api'

import appComponent from '@/_layout'
import { ANALYTICS_CONFIGS } from '~/analytics'
import { getIdToken, handleAuthCallback, useAuth0Client } from '~/auth-client'
import { FEATURE_TOGGLES } from '~/feature-toggles'
import routerOptions, { ROUTE_NAMES } from '~/router'
import { pinia, useStoreOutsideSetup } from '~/store'
import { componentsFromGlob } from '~/vue/register-components'
import { apiClientArbimonLegacyKey, apiClientCoreKey, apiClientDeviceKey, apiClientKey, apiClientMediaKey, authClientKey, gtagKey, routeNamesKey, storeKey, togglesKey } from './globals'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

export const createApp = ViteSSG(appComponent, routerOptions, async ({ app, router, isClient, initialState }) => {
  // Setup app
  app
    .use(pinia)
    .use(VueGtag, ANALYTICS_CONFIGS, router)
    .use(VueQueryPlugin)
    .use(componentsFromGlob, import.meta.globEager('/src/_components/**/*.vue'))

  if (import.meta.env.SSR) {
    // this will be stringified and set to window.__INITIAL_STATE__
    initialState.pinia = pinia.state.value
  } else {
    // on the client side, we restore the state
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    pinia.state.value = initialState.pinia || {}
  }

  // Inject globals (ssg and client)
  app.provide(gtagKey, app.config.globalProperties.$gtag)
    .provide(togglesKey, FEATURE_TOGGLES)
    .provide(routeNamesKey, ROUTE_NAMES)

  if (isClient) {
    // Authenticate current user
    const authClient = await useAuth0Client()
    const targetAfterAuth = await handleAuthCallback(authClient)
    let user = await authClient.getUser()
    if (user === undefined) {
      try {
        await authClient.getTokenSilently()
        user = await authClient.getUser()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to silently retrieve Auth0 session', error)
        }
      }
    }

    // Save to store
    const store = useStoreOutsideSetup()
    await store.updateUser(user)

    // Setup API token
    const getToken = user ? async () => await getIdToken(authClient) : undefined
    const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, getToken)
    const apiClientCore = getApiClient(import.meta.env.VITE_CORE_API_BASE_URL, getToken)
    const apiClientMedia = getApiClient(import.meta.env.VITE_MEDIA_API_BASE_URL, getToken)
    const apiClientArbimonLegacy = getApiClient(import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL, getToken)
    const apiClientDevice = getApiClient(import.meta.env.VITE_DEVICE_API_BASE_URL, getToken)

    // Inject globals
    app
      .provide(authClientKey, authClient)
      .provide(apiClientKey, apiClient)
      .provide(apiClientCoreKey, apiClientCore)
      .provide(apiClientMediaKey, apiClientMedia)
      .provide(apiClientDeviceKey, apiClientDevice)
      .provide(apiClientArbimonLegacyKey, apiClientArbimonLegacy)
      .provide(storeKey, store) // TODO: Delete this & use useStore() directly in components

    // Handle redirects
    if (targetAfterAuth !== undefined) {
      await router.replace(targetAfterAuth)
    }
  }
})
