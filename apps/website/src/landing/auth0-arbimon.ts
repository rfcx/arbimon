import { useAuth0Client } from '~/auth-client'

const auth0Client = await useAuth0Client()

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL
const arbimonClientId = 'eh2NHbG6hOVjHMGxkmCHGe307sLmKGKb'
const audience = 'https://rfcx.org'
const redirectUri = `${ARBIMON_BASE_URL}/auth0-login`
const universalLoginUrl = `https://auth.rfcx.org/authorize?audience=${audience}&scope=openid%20email%20profile%20offline_access` +
    `&response_type=code&client_id=${arbimonClientId}&redirect_uri=${redirectUri}&theme=dark`
const isAuthenticated = await auth0Client.isAuthenticated()

// These code should be deleted after testing!
try {
  const authenticated = await auth0Client.isAuthenticated()
  console.info('authenticated', auth0Client, authenticated)
} catch (e) {
  console.info('authenticated err', e)
}

export {
  isAuthenticated,
  universalLoginUrl
}
