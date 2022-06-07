import { coreMediaRoute } from '@rfcx-bio/common/api-bio/core-proxy/core-media'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { coreMediaHandler } from './controller-core-media'

export const routesCoreProxy: RouteRegistration[] = [
  {
    method: GET,
    url: coreMediaRoute,
    handler: coreMediaHandler
  }
]
