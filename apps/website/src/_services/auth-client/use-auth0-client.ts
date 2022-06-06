import { Auth0Client } from '@auth0/auth0-spa-js'

import { getAuth0Client } from './auth0-client'

let auth0Client: Auth0Client
export const useAuth0Client = async (): Promise<Auth0Client> => {
  auth0Client ??= await getAuth0Client(window.location.origin)
  return auth0Client
}
