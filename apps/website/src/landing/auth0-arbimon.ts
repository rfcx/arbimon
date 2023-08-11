const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL
const arbimonClientId = 'eh2NHbG6hOVjHMGxkmCHGe307sLmKGKb'
const audience = 'https://rfcx.org'
const redirectUri = `${ARBIMON_BASE_URL}/login`
const universalLoginUrl = `https://auth.rfcx.org/authorize?audience=${audience}&scope=openid%20email%20profile%20offline_access` +
    `&response_type=code&client_id=${arbimonClientId}&redirect_uri=${redirectUri}&theme=dark`

export { universalLoginUrl }
