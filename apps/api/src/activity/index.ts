import { activityDatasetRoute } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { activityDatasetHandler } from './activity-dataset-handler'

export const routesActivity: RouteRegistration[] = [
  {
    method: GET,
    url: activityDatasetRoute,
    preHandler: [setIsProjectMember],
    handler: activityDatasetHandler
  }
]
