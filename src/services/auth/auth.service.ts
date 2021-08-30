import { App, computed, Plugin, reactive, watchEffect } from 'vue'
import { NavigationGuardNext, NavigationGuardWithThis, RouteLocationNormalized } from 'vue-router'

import createAuth0Client, { Auth0Client, GetIdTokenClaimsOptions, GetTokenSilentlyOptions, GetTokenWithPopupOptions, LogoutOptions, RedirectLoginOptions, User } from '@auth0/auth0-spa-js'

import authConfig from './config.json'

export type UserComponent = User & {
  roles: string[]
}

interface AppState {
  targetUrl?: string
}

let client: Auth0Client

interface Auth0PluginState {
  loading: boolean
  isAuthenticated: boolean
  user: User | undefined
  popupOpen: boolean
  error: any
}

const state = reactive<Auth0PluginState>({
  loading: true,
  isAuthenticated: false,
  user: {},
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
  await client.loginWithRedirect(o)
}

async function getIdTokenClaims (o: GetIdTokenClaimsOptions): Promise<void> {
  await client.getIdTokenClaims(o)
}

async function getTokenSilently (o: GetTokenSilentlyOptions): Promise<void> {
  await client.getTokenSilently(o)
}

async function getTokenWithPopup (o: GetTokenWithPopupOptions): Promise<void> {
  await client.getTokenWithPopup(o)
}

async function logout (o: LogoutOptions): Promise<void> {
  await client.logout(o)
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

  const verify = (): void => {
    // If the user is authenticated, continue with the route
    if (isAuthenticated.value) {
      return next()
    }

    // Otherwise, log in
    void loginWithRedirect({ appState: { targetUrl: to.fullPath } })
  }

  // If loading has already finished, check our auth state using `fn()`
  if (!loading.value) {
    return verify()
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (!loading.value) {
      verify()
    }
  })
}

interface Auth0PluginOptions {
  redirectUri: string
  onRedirectCallback: (appState: AppState) => void
}

async function init (options: Auth0PluginOptions): Promise<Plugin> {
  client = await createAuth0Client({
    domain: authConfig.domain,
    client_id: authConfig.clientId,
    audience: authConfig.audience,
    redirect_uri: options.redirectUri
  })

  try {
    // If the user is returning to the app after authentication
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      // handle the redirect and retrieve tokens
      const redirectLoginResult = await client.handleRedirectCallback()

      // const token: string = await client.getTokenSilently()
      // console.log('Token', token)

      // Notify subscribers that the redirect callback has happened, passing the appState
      // (useful for retrieving any pre-authentication state)
      options.onRedirectCallback(redirectLoginResult.appState)
    }
  } catch (e) {
    state.error = e
  } finally {
    // Initialize our internal authentication state
    state.isAuthenticated = await client.isAuthenticated()
    state.user = await client.getUser()
    state.loading = false
  }

  return {
    install: (app: App) => {
      app.provide('auth', authPlugin)
    }
  }
}

interface Auth0Plugin {
  init: (options: Auth0PluginOptions) => Promise<Plugin>
  routeGuard: NavigationGuardWithThis<undefined>
}

export const Auth0: Auth0Plugin = {
  init,
  routeGuard
}
