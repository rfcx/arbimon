import { spotlightDatasetRoute } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { spotlightDatasetHandler } from './spotlight-dataset-handler'

export const routesSpotlight: RouteRegistration[] = [
  {
    method: GET,
    url: spotlightDatasetRoute,
    preHandler: [setIsProjectMember],
    handler: spotlightDatasetHandler
  }
]
