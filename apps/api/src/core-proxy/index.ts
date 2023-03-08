import { coreMediaRoute } from '@rfcx-bio/common/api-bio/core-proxy/core-media'

import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { coreMediaHandler } from './controller-core-media'

export const routesCoreProxy: RouteRegistration[] = [
  {
    method: GET,
    url: coreMediaRoute,
    handler: coreMediaHandler
  }
]
