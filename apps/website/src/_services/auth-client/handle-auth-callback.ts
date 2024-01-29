import { type Auth0Client } from '@auth0/auth0-spa-js'
import { type RouteLocationRaw } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

export const handleAuthCallback = async (client: Auth0Client): Promise<RouteLocationRaw | undefined> => {
  const error = window.location.search.includes('error_description=')
  if (error) {
    const params = new URLSearchParams(window.location.search)
    const errorDescription = params.get('error_description')
    return { name: ROUTE_NAMES.error, query: { error: errorDescription } }
  }

  if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) return undefined

  // Handle callbacks
  const redirectLoginResult = await client.handleRedirectCallback()
  return redirectLoginResult.appState?.target
}
