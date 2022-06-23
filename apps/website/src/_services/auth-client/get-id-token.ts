import { Auth0Client } from '@auth0/auth0-spa-js'

export const getIdToken = async (client: Auth0Client): Promise<string> => {
  const idToken = await client.getIdTokenClaims()
  if (!idToken) throw new Error('Failed to get ID token')
  return idToken.__raw
}
