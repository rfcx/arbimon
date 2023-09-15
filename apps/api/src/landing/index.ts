import { landingPublicationsRoute } from '@rfcx-bio/common/api-bio/landing/landing-publications'

import { type RouteRegistration, GET } from '~/api-helpers/types'
import { landingPublicationsHandler } from './publications/landing-publications-handler'

export const routesLanding: RouteRegistration[] = [
  {
    method: GET,
    url: landingPublicationsRoute,
    handler: landingPublicationsHandler
  }
]
