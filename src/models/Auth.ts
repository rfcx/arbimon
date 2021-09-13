import {
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  User
} from '@auth0/auth0-spa-js'
import { ComputedRef } from '@vue/reactivity'

export interface Auth0User extends User {
  roles: string[]
}

export interface Auth0Option {
  isAuthenticated: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  user: ComputedRef<Auth0User>
  getIdTokenClaims: (o?: GetIdTokenClaimsOptions) => Promise<IdToken>
  getTokenSilently: (o?: GetTokenSilentlyOptions) => Promise<string>
  getTokenWithPopup: (o?: GetTokenWithPopupOptions) => Promise<string>
  handleRedirectCallback: (o?: GetTokenWithPopupOptions) => Promise<string>
  loginWithRedirect: (o?: GetTokenWithPopupOptions) => Promise<string>
  logout: (o?: LogoutOptions) => Promise<void> | void
}
