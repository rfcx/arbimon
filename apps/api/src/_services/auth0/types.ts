export interface Auth0UserInfo {
  auth0_user_id: string
  'https://rfcx.org/app_metadata': {
    authorization: {
      roles: string[]
    }
    guid: string
    loginsNumber: number
    accessibleSites?: string[]
    defaultSite?: string
  }
  user_metadata: {
    name?: string
    given_name?: string
    family_name?: string
    consentGiven?: string | boolean
    consentGivenDashboard?: string | boolean
    consentGivenAcousticsExplorer?: string | boolean
    consentGivenRangerApp?: string | boolean
  }
  'https://rfcx.org/user_metadata': {
    name?: string
    given_name?: string
    family_name?: string
    consentGiven?: string | boolean
    consentGivenDashboard?: string | boolean
    consentGivenAcousticsExplorer?: string | boolean
    consentGivenRangerApp?: string | boolean
  }
  guid: string
  loginsNumber: string
  given_name?: string
  family_name?: string
  nickname: string
  name: string
  picture: string | null
  updated_at: string
  email: string
  email_verified: string | boolean
  iss: string
  iat: number
  exp: number
  sub: string
  sid: string
  nonce: string
}
