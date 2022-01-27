import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { dashboardGeneratedHandler } from './controller-dashboard-generated'
import { dashboardProfileHandler } from './controller-dashboard-profile'

export const routesDashboard: RouteRegistration[] = [
  {
    method: GET,
    url: dashboardGeneratedRoute,
    handler: dashboardGeneratedHandler
  },
  {
    method: GET,
    url: dashboardProfileRoute,
    handler: dashboardProfileHandler
  }
]
