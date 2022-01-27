import { activityDatasetRoute } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { activityDatasetHandler } from './controller-activity-dataset'

export const routesActivity: RouteRegistration[] = [
  {
    method: GET,
    url: activityDatasetRoute,
    handler: activityDatasetHandler
  }
]
