import { type Auth0Client } from '@auth0/auth0-spa-js'
import { type RouteLocationRaw } from 'vue-router'

export const handleAuthCallback = async (client: Auth0Client): Promise<RouteLocationRaw | undefined> => {
  if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) return undefined

  // Handle callbacks
  const redirectLoginResult = await client.handleRedirectCallback()
  return redirectLoginResult.appState?.target
}
