import { activityDatasetRoute } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { activityDatasetHandler } from './activity-dataset-handler'

export const routesActivity: RouteRegistration[] = [
  {
    method: GET,
    url: activityDatasetRoute,
    handler: activityDatasetHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
