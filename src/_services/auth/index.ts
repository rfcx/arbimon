import createAuth0Client, { Auth0Client, LogoutOptions, RedirectLoginOptions } from '@auth0/auth0-spa-js'
import { ref, watchEffect } from 'vue'

import { useStoreOutsideSetup } from '~/store'
import { config } from './env'

export interface AuthClient {
  init: (redirectUri: string) => Promise<string>
  isReady: () => Promise<boolean>
  isAuthenticated: boolean
  loginWithRedirect: (options: RedirectLoginOptions) => Promise<void>
  logout: (options?: LogoutOptions) => Promise<void>
  getAccessToken: () => Promise<string|undefined>
  getIdToken: () => Promise<string|undefined>
}

class AuthClientClass implements AuthClient {
  clientAuth0!: Auth0Client
  isAuthenticated = false
  isReadyInternal = ref(false)
  isReadyPromise!: Promise<boolean>

  async init (redirectUri: string): Promise<string> {
    const { domain, clientId, audience } = config

    // Other callers must wait for init
    this.isReadyPromise = new Promise((resolve, reject) => {
      watchEffect(() => { if (this.isReadyInternal.value) return resolve(this.isAuthenticated) })
    })

    let redirectPath = ''
    try {
      // Init
      this.clientAuth0 = await createAuth0Client({ audience, client_id: clientId, domain, redirect_uri: redirectUri, theme: 'dark' })

      // Handle callbacks
      if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        const redirectLoginResult = await this.clientAuth0.handleRedirectCallback()
        redirectPath = redirectLoginResult.appState?.redirectPath ?? '/'
      }

      // Get auth status
      const user = await this.clientAuth0.getUser()
      this.isAuthenticated = user !== undefined
      this.isReadyInternal.value = true

      // Store user in Pinia
      void useStoreOutsideSetup().updateUser(user)
    } catch (e: any) { } // TODO 156 - Return error to main
    return redirectPath
  }

  async isReady (): Promise<boolean> {
    return await this.isReadyPromise
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
}

const authClient = new AuthClientClass()
export const useAuthClient = (): AuthClient => authClient
