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
    // Init Auth0 client
    const { domain, clientId, audience } = config
    const client = await createAuth0Client({ audience, client_id: clientId, domain, redirect_uri: redirectUri, theme: 'dark' })
    this.clientAuth0 = client

    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      // Handle callbacks
      const redirectLoginResult = await this.clientAuth0.handleRedirectCallback()
      const redirectAfterAuth = redirectLoginResult.appState?.redirectPath

      // Set user
      await this.updateUser(client)

      // Calculate redirect
      if (redirectAfterAuth !== undefined && redirectAfterAuth !== '/') return redirectAfterAuth
      if (this.store.selectedProject) return { name: ROUTE_NAMES.dashboard, params: { projectSlug: this.store.selectedProject.slug } }
      return '/'
    } else {
      // Set user
      await this.updateUser(client)

      return undefined
    }
  }

  async loginWithRedirect (options: RedirectLoginOptions): Promise<void> {
    await this.clientAuth0.loginWithRedirect(options)
  }

  async logout (): Promise<void> {
    // Auth0 logout forces a full refresh
    await this.clientAuth0.logout({ returnTo: window.location.origin })
    // ...if we could avoid the refresh, we would need to update the user:
    // await this.updateUser(this.clientAuth0)
  }

  async getAccessToken (): Promise<string | undefined> {
    return await this.clientAuth0?.getTokenSilently()
  }

  async getIdToken (): Promise<string | undefined> {
    return (await this.clientAuth0.getIdTokenClaims())?.__raw
  }

  private async updateUser (client: Auth0Client): Promise<void> {
    const user = await client.getUser()
    this.isAuthenticated = user !== undefined
    await this.store.updateUser(user)
  }
}

const authClient = new AuthClientClass()
export const useAuthClient = (): AuthClient => authClient
