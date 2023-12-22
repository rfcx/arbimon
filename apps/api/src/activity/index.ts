import { activityDatasetRoute } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { requireProjectPermission } from '@/_middleware/require-permission'
import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { activityDatasetHandler } from './activity-dataset-handler'

export const routesActivity: RouteRegistration[] = [
  {
    method: GET,
    url: activityDatasetRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: activityDatasetHandler
  }
]
