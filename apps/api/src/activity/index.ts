import { activityDatasetRoute } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { activityDatasetController } from './controller-activity-dataset'

export const routesActivity: RouteRegistration[] = [
  {
    method: GET,
    route: activityDatasetRoute,
    controller: activityDatasetController
  }
]
