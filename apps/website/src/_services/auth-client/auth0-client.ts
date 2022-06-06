import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js'

export const getAuth0Client = async (redirectUri: string): Promise<Auth0Client> => await createAuth0Client({
  audience: 'https://rfcx.eu.auth0.com/api/v2/',
  client_id: 'LiojdvNUserGnCaLj8ckcxeGPHOKitOc',
  domain: 'auth.rfcx.org',
  redirect_uri: redirectUri,
  theme: 'dark'
})

export const handleAuthRedirect = async (client: Auth0Client): Promise<string | undefined> => {
  if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) return undefined

  // Handle callbacks
  const redirectLoginResult = await client.handleRedirectCallback()
  const redirectAfterAuth = redirectLoginResult.appState?.redirectPath

  // Calculate redirect
  if (redirectAfterAuth !== undefined && redirectAfterAuth !== '/') return redirectAfterAuth
  return undefined
}

export const getIdToken = async (client: Auth0Client): Promise<string> => {
  const idToken = await client.getIdTokenClaims()
  if (!idToken) throw new Error('Failed to get ID token')
  return idToken.__raw
}
