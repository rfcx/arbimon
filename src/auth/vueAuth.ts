
import createAuth0Client, { Auth0Client, GetIdTokenClaimsOptions, GetTokenSilentlyOptions, GetTokenWithPopupOptions, IdToken, LogoutOptions, PopupConfigOptions, PopupLoginOptions, RedirectLoginOptions, User } from '@auth0/auth0-spa-js'

import config from './config.json'

export type UserComponent = User & {
  roles?: string[]
}

export interface Auth0Options {
  domain: string
  clientId: string
  audience?: string
  [key: string]: string | undefined
}

export type RedirectCallback = (appState: unknown) => void

export default class VueAuth {
  public isLoading = true
  public isAuth0Authenticated = false
  public user?: UserComponent
  public auth0Client?: Auth0Client
  public popupOpen = false
  public error: Error | null = null

  public async init (onRedirectCallback: RedirectCallback, redirectUri: string): Promise<void> {
    const { domain, clientId, audience } = config

    this.isLoading = true
    this.auth0Client = await createAuth0Client({
      domain,
      client_id: clientId,
      audience,
      redirect_uri: redirectUri
    })

    try {
      if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        const { appState } = await this.auth0Client?.handleRedirectCallback() ?? { appState: undefined }
        onRedirectCallback(appState)
      }
    } catch (e) {
      this.error = e
    } finally {
      this.isAuth0Authenticated = await this.auth0Client?.isAuthenticated()
      this.user = await this.auth0Client?.getUser()
    }
    this.isLoading = false
  }

  public get isAuthenticated (): boolean {
    return this.isAuth0Authenticated
  }

  public async loginWithPopup (options: PopupLoginOptions, config?: PopupConfigOptions): Promise<void> {
    this.popupOpen = true
    try {
      await this.auth0Client?.loginWithPopup(options, config)
      this.user = await this.auth0Client?.getUser()
      this.isAuth0Authenticated = true
      this.error = null
    } catch (e) {
      console.error(e)
      this.isAuth0Authenticated = false
      this.error = e
    }
    this.popupOpen = false
  }

  public async loginWithRedirect (options?: RedirectLoginOptions): Promise<void> {
    return await this.auth0Client?.loginWithRedirect(options)
  }

  public async logout (options?: LogoutOptions): Promise<void> {
    return await this.auth0Client?.logout(options)
  }

  public async getIdTokenClaims (options?: GetIdTokenClaimsOptions): Promise<IdToken | undefined> {
    return await this.auth0Client?.getIdTokenClaims(options)
  }

  // Get access token
  public async getTokenSilently (options?: GetTokenSilentlyOptions): Promise<void> {
    return await this.auth0Client?.getTokenSilently(options)
  }

  public async getTokenWithPopup (options?: GetTokenWithPopupOptions): Promise<string | undefined> {
    return await this.auth0Client?.getTokenWithPopup(options)
  }

  public haveAllowedRoles (strictRouteRoles: string[] | undefined): boolean {
    if (!strictRouteRoles || strictRouteRoles.length === 0) {
      return true
    }

    const userRoles = this.user?.roles
    if (!userRoles || userRoles.length === 0) {
      return false
    }

    return userRoles.some(role => strictRouteRoles.includes(role))
  }
}
