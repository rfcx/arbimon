import { VueQueryPlugin } from '@tanstack/vue-query'
import { ViteSSG } from 'vite-ssg'

import { getApiClient } from '@rfcx-bio/utils/api'

import appComponent from '@/_layout'
import { identify, initAnalytics } from '~/analytics'
import { getIdToken, handleAuthCallback, useAuth0Client } from '~/auth-client'
import { FEATURE_TOGGLES } from '~/feature-toggles'
import { installMasqueradeClient, masqueradeTargetEmail } from '~/masquerade'
import routerOptions, { ROUTE_NAMES } from '~/router'
import { pinia, useStoreOutsideSetup } from '~/store'
import { installAnalysisJobsSource } from '~/tasks/sources/analysis-jobs'
import { installMasqueradeSource } from '~/tasks/sources/masquerade'
import { componentsFromGlob } from '~/vue/register-components'
import { apiClientArbimonLegacyKey, apiClientCoreKey, apiClientDeviceKey, apiClientKey, apiClientMediaKey, authClientKey, routeNamesKey, storeKey, togglesKey } from './globals'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'virtual:windi.css'
import './main.scss'

export const createApp = ViteSSG(appComponent, routerOptions, async ({ app, router, isClient, initialState }) => {
  // Setup app
  app
    .use(pinia)
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
  app.provide(togglesKey, FEATURE_TOGGLES)
    .provide(routeNamesKey, ROUTE_NAMES)

  if (isClient) {
    // Initialise analytics (PostHog) client-side only, with manual pageviews.
    // Conservative config (autocapture/replay OFF) per the #2461 gate — see
    // ~/analytics. Env-gated + fail-safe (never blocks app boot).
    await initAnalytics(router)

    // Authenticate current user
    const authClient = await useAuth0Client()
    const targetAfterAuth = await handleAuthCallback(authClient)
    const user = await authClient.getUser()

    // Associate the PostHog person with the account email (canonical identity).
    identify(user)

    // Save to store
    const store = useStoreOutsideSetup()
    await store.updateUser(user)

    // Setup API token
    const getToken = user ? async () => await getIdToken(authClient) : undefined
    // Superuser masquerade: while active, every bio-facing client stamps
    // X-Masquerade-Email so the modern UI is rendered AS the target (bio-api
    // re-verifies the real super server-side). Read reactively per-request.
    const masqueradeOpts = { getMasqueradeEmail: () => masqueradeTargetEmail.value }
    const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, getToken, masqueradeOpts)
    const apiClientCore = getApiClient(import.meta.env.VITE_CORE_API_BASE_URL, getToken, masqueradeOpts)
    const apiClientMedia = getApiClient(import.meta.env.VITE_MEDIA_API_BASE_URL, getToken, masqueradeOpts)
    const apiClientArbimonLegacy = getApiClient(import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL, getToken)
    const apiClientDevice = getApiClient(import.meta.env.VITE_DEVICE_API_BASE_URL, getToken, masqueradeOpts)

    // Inject globals
    app
      .provide(authClientKey, authClient)
      .provide(apiClientKey, apiClient)
      .provide(apiClientCoreKey, apiClientCore)
      .provide(apiClientMediaKey, apiClientMedia)
      .provide(apiClientDeviceKey, apiClientDevice)
      .provide(apiClientArbimonLegacyKey, apiClientArbimonLegacy)
      .provide(storeKey, store) // TODO: Delete this & use useStore() directly in components

    // Install the analysis-jobs task source (floating tray). Current-project
    // scoped; polls the bio /jobs endpoint. Registered here so it has the
    // authed bio apiClient + store + router. Uploads self-register in app-root.
    installAnalysisJobsSource(app, {
      getApiClient: () => apiClient,
      getProjectIdCore: () => store.project?.idCore,
      getProjectSlug: () => store.project?.slug,
      getUserEmail: () => store.user?.email,
      navigate: (path) => { void router.push(path) }
    })

    // Install the masquerade tray (superuser "view as user"). Uses the
    // same-origin legacy api client to read/drive the shared masquerade
    // session; the header injection above mirrors it onto bio-api requests.
    installMasqueradeClient(apiClientArbimonLegacy)
    installMasqueradeSource(app)

    // Handle redirects
    if (targetAfterAuth !== undefined) {
      await router.replace(targetAfterAuth)
    }
  }
})
