import createAuth0Client, { type Auth0Client } from '@auth0/auth0-spa-js'

// const arbimonClientId = 'eh2NHbG6hOVjHMGxkmCHGe307sLmKGKb'

const getAuth0Client = async (redirectUri: string): Promise<Auth0Client> => await createAuth0Client({
  audience: 'https://rfcx.org', // 'https://rfcx.eu.auth0.com/api/v2/',
  client_id: 'LiojdvNUserGnCaLj8ckcxeGPHOKitOc',
  domain: 'auth.rfcx.org',
  redirect_uri: redirectUri,
  theme: 'dark'
})

let auth0Client: Auth0Client
export const useAuth0Client = async (): Promise<Auth0Client> => {
  auth0Client ??= await getAuth0Client(window.location.origin + '/callback')
  return auth0Client
}
