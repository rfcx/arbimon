import { spotlightDatasetRoute } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { requireProjectPermission } from '@/_middleware/require-permission'
import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { spotlightDatasetHandler } from './spotlight-dataset-handler'

export const routesSpotlight: RouteRegistration[] = [
  {
    method: GET,
    url: spotlightDatasetRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: spotlightDatasetHandler
  }
]
