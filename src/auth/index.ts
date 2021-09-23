import { App, computed, Plugin, reactive, watchEffect } from 'vue'
import { NavigationGuardNext, NavigationGuardWithThis, RouteLocationNormalized } from 'vue-router'

import createAuth0Client, {
  Auth0Client,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  RedirectLoginOptions
} from '@auth0/auth0-spa-js'

import { Auth0User } from '@/models'
import config from './config'

let client: Auth0Client

interface Auth0PluginState {
  loading: boolean
  isAuthenticated: boolean
  user: Auth0User | undefined
  popupOpen: boolean
  error: any
}

const state = reactive<Auth0PluginState>({
  loading: true,
  isAuthenticated: false,
  user: undefined,
  popupOpen: false,
  error: null
})

async function handleRedirectCallback (): Promise<void> {
  state.loading = true

  try {
    await client.handleRedirectCallback()
    state.user = await client.getUser()
    state.isAuthenticated = true
  } catch (e) {
    state.error = e
  } finally {
    state.loading = false
  }
}

async function loginWithRedirect (o: RedirectLoginOptions): Promise<void> {
  return await client.loginWithRedirect(o)
}

async function getIdTokenClaims (o: GetIdTokenClaimsOptions): Promise<IdToken> {
  return await client.getIdTokenClaims(o)
}

/** get access token */
async function getTokenSilently (o: GetTokenSilentlyOptions): Promise<string> {
  return await client.getTokenSilently(o)
}

async function getTokenWithPopup (o: GetTokenWithPopupOptions): Promise<string> {
  return await client.getTokenWithPopup(o)
}

function logout (o: LogoutOptions): Promise<void> | void {
  return client.logout(o)
}

const authPlugin = {
  isAuthenticated: computed(() => state.isAuthenticated),
  loading: computed(() => state.loading),
  user: computed(() => state.user),
  getIdTokenClaims,
  getTokenSilently,
  getTokenWithPopup,
  handleRedirectCallback,
  loginWithRedirect,
  logout
}

const routeGuard: NavigationGuardWithThis<undefined> = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const { isAuthenticated, loading, loginWithRedirect } = authPlugin

  const verify = async (): Promise<void> => {
    if (isAuthenticated.value) {
      return next()
    }

    await loginWithRedirect({ appState: { redirectPath: to.fullPath } })
  }

  if (!loading.value) {
    return verify()
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  watchEffect(() => {
    if (!loading.value) {
      return verify()
    }
  })
}

interface Auth0PluginOptions {
  domain?: string
  clientId?: string
  audience?: string
  redirectUri: string
}

async function init (options: Auth0PluginOptions): Promise<{Auth0Plugin: Plugin, redirectAfterAuth: string}> {
  const { domain, clientId, audience } = config

  client = await createAuth0Client({
    domain: domain,
    client_id: clientId,
    audience: audience,
    redirect_uri: options.redirectUri,
    theme: 'dark'
  })

  let redirectAfterAuth = null
  try {
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      const { appState } = await client.handleRedirectCallback()
      redirectAfterAuth = appState.redirectPath
    }
  } catch (e) {
    state.error = e
  } finally {
    state.isAuthenticated = await client.isAuthenticated()
    state.user = await client.getUser()
    state.loading = false
  }

  return {
    Auth0Plugin: {
      install: (app: App) => {
        app.provide('auth', authPlugin)
      }
    },
    redirectAfterAuth
  }
}

interface Auth0Plugin {
  init: (options: Auth0PluginOptions) => Promise<{Auth0Plugin: Plugin, redirectAfterAuth: string}>
  routeGuard: NavigationGuardWithThis<undefined>
}

export const Auth0: Auth0Plugin = {
  init,
  routeGuard
}
