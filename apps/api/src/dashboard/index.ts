import { dashboardContentRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { dashboardDataByHourRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-hour'
import { dashboardDataBySiteRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-site'
import { dashboardMetricsRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { dashboardSpeciesByRiskDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-by-risk'
import { dashboardSpeciesDataRoute, speciesHighlightedDeleteRoute, speciesHighlightedPostRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { type RouteRegistration, DELETE, GET, PATCH, POST } from '../_services/api-helpers/types'
import { dashboardContentHandler, updateDashboardContentHandler } from './dashboard-content-handler'
import { dashboardDataByHourHandler } from './dashboard-data-by-hour-handler'
import { dashboardDataBySiteHandler } from './dashboard-data-by-site-handler'
import { dashboardMetricsHandler } from './dashboard-metrics-handler'
import { dashboardSpeciesByRiskDataHandler } from './dashboard-species-by-risk-handler'
import { dashboardSpeciesDataHandler, dashboardSpeciesHighlightedDeleteHandler, dashboardSpeciesHighlightedPostHandler } from './dashboard-species-data-handler'

export const routesDashboard: RouteRegistration[] = [
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
    method: PATCH,
    url: dashboardContentRoute,
    handler: updateDashboardContentHandler
  },
  {
    method: GET,
    url: dashboardDataBySiteRoute,
    handler: dashboardDataBySiteHandler
  },
  { // TODO: remove this route
    method: GET,
    url: dashboardSpeciesDataRoute,
    handler: dashboardSpeciesDataHandler
  },
  {
    method: GET,
    url: dashboardProfileRoute,
    handler: dashboardContentHandler
  },
  {
    method: GET,
    url: dashboardSpeciesByRiskDataRoute,
    handler: dashboardSpeciesByRiskDataHandler
  },
  {
    method: POST,
    url: speciesHighlightedPostRoute,
    handler: dashboardSpeciesHighlightedPostHandler
  },
  {
    method: DELETE,
    url: speciesHighlightedDeleteRoute,
    handler: dashboardSpeciesHighlightedDeleteHandler
  }
]
