import { Auth0Client } from '@auth0/auth0-spa-js'

export const handleAuthCallback = async (client: Auth0Client): Promise<string | undefined> => {
  if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) return undefined

  // Handle callbacks
  const redirectLoginResult = await client.handleRedirectCallback()
  const redirectAfterAuth = redirectLoginResult.appState?.redirectPath

  // Calculate redirect
  if (redirectAfterAuth !== undefined && redirectAfterAuth !== '/') return redirectAfterAuth
  return undefined
}
