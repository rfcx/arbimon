import { coreMediaRoute } from '@rfcx-bio/common/api-bio/media/core-media'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { coreMediaHandler } from './controller-core-media'

export const routesMedia: RouteRegistration[] = [
  {
    method: GET,
    url: coreMediaRoute,
    handler: coreMediaHandler
  }
]
