import { spotlightDatasetRoute } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { loadIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { spotlightDatasetHandler } from './spotlight-dataset-handler'

export const routesSpotlight: RouteRegistration[] = [
  {
    method: GET,
    url: spotlightDatasetRoute,
    preHandler: [loadIsProjectMember],
    handler: spotlightDatasetHandler
  }
]
