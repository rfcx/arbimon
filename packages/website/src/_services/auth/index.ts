import createAuth0Client, { Auth0Client, LogoutOptions, RedirectLoginOptions } from '@auth0/auth0-spa-js'
import { RouteLocationRaw } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import { useStoreOutsideSetup } from '~/store'
import { config } from './env'

export interface AuthClient {
  init: (redirectUri: string) => Promise<RouteLocationRaw | undefined>
  isAuthenticated: boolean
  loginWithRedirect: (options: RedirectLoginOptions) => Promise<void>
  logout: (options?: LogoutOptions) => Promise<void>
  getAccessToken: () => Promise<string|undefined>
  getIdToken: () => Promise<string|undefined>
}

class AuthClientClass implements AuthClient {
  clientAuth0!: Auth0Client
  store = useStoreOutsideSetup()

  isAuthenticated = false

  async init (redirectUri: string): Promise<RouteLocationRaw | undefined> {
    const { domain, clientId, audience } = config

    try {
      // Init
      this.clientAuth0 = await createAuth0Client({ audience, client_id: clientId, domain, redirect_uri: redirectUri, theme: 'dark' })

      // Handle callbacks
      if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        const redirectLoginResult = await this.clientAuth0.handleRedirectCallback()
        const redirectAfterAuth = redirectLoginResult.appState?.redirectPath

        // Init auth state & store user
        await this.initAuthState()

        // Redirects
        if (redirectAfterAuth !== undefined && redirectAfterAuth !== '/') return redirectAfterAuth
        if (this.store.selectedProject) return { name: ROUTE_NAMES.overview, params: { projectId: this.store.selectedProject.id } }
        return '/'
      } else {
        await this.initAuthState()
      }
    } catch (e: any) {}
    return undefined
  }

  async loginWithRedirect (options: RedirectLoginOptions): Promise<void> {
    await this.clientAuth0.loginWithRedirect(options)
  }

  async logout (): Promise<void> {
    await this.clientAuth0.logout({ returnTo: window.location.origin })
  }

  async getAccessToken (): Promise<string | undefined> {
    return await this.clientAuth0?.getTokenSilently()
  }

  async getIdToken (): Promise<string | undefined> {
    return (await this.clientAuth0.getIdTokenClaims())?.__raw
  }

  async initAuthState (): Promise<void> {
    const user = await this.clientAuth0.getUser()
    this.isAuthenticated = user !== undefined
    await this.store.updateUser(user)
  }
}

const authClient = new AuthClientClass()
export const useAuthClient = (): AuthClient => authClient
