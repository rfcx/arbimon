import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { dashboardGeneratedController } from './controller-dashboard-generated'
import { dashboardProfileController } from './controller-dashboard-profile'

export const routesDashboard: RouteRegistration[] = [
  [GET, dashboardGeneratedRoute, dashboardGeneratedController],
  [GET, dashboardProfileRoute, dashboardProfileController]
]
