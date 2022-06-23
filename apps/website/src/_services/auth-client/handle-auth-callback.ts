import { Auth0Client } from '@auth0/auth0-spa-js'

export const handleAuthCallback = async (client: Auth0Client): Promise<string | undefined> => {
  if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) return undefined

  // Handle callbacks
  const redirectLoginResult = await client.handleRedirectCallback()
  return redirectLoginResult.appState?.redirectPath
}
