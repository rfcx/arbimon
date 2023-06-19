import { dashboardContentRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { dashboardDataByHourRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-hour'
import { dashboardDataBySiteRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-site'
import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardMetricsRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { dashboardSpeciesDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { dashboardContentHandler } from './dashboard-content-handler'
import { dashboardDataByHourHandler } from './dashboard-data-by-hour-handler'
import { dashboardDataBySiteHandler } from './dashboard-data-by-site-handler'
import { dashboardGeneratedHandler } from './dashboard-generated-handler'
import { dashboardMetricsHandler } from './dashboard-metrics-handler'
import { dashboardProfileHandler } from './dashboard-profile-handler'
import { dashboardSpeciesDataHandler } from './dashboard-species-data-handler'

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
  },
  {
    method: GET,
    url: dashboardMetricsRoute,
    handler: dashboardMetricsHandler
  },
  {
    method: GET,
    url: dashboardDataByHourRoute,
    handler: dashboardDataByHourHandler
  },
  {
    method: GET,
    url: dashboardContentRoute,
    handler: dashboardContentHandler
  },
  {
    method: GET,
    url: dashboardDataBySiteRoute,
    handler: dashboardDataBySiteHandler
  },
  {
    method: GET,
    url: dashboardSpeciesDataRoute,
    handler: dashboardSpeciesDataHandler
  }
]
