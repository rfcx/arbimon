import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { dashboardGeneratedHandler } from './dashboard-generated-handler'
import { dashboardProfileHandler } from './dashboard-profile-handler'

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
