import { spotlightDatasetRoute } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { spotlightDatasetHandler } from './spotlight-dataset-handler'

export const routesSpotlight: RouteRegistration[] = [
  {
    method: GET,
    url: spotlightDatasetRoute,
    handler: spotlightDatasetHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
