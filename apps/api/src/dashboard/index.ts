import { dashboardContentRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { dashboardDataByHourRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-hour'
import { dashboardDataBySiteRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-site'
import { dashboardMetricsRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { dashboardSpeciesByRiskDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-by-risk'
import { dashboardSpeciesDataRoute, speciesHighlightedDeleteRoute, speciesHighlightedPostRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'
import { dashboardStakeholdersRoute, updateDashboardStakeholdersRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, DELETE, GET, PATCH, POST } from '../_services/api-helpers/types'
import { dashboardContentHandler, updateDashboardContentHandler } from './dashboard-content-handler'
import { dashboardDataByHourHandler } from './dashboard-data-by-hour-handler'
import { dashboardDataBySiteHandler } from './dashboard-data-by-site-handler'
import { dashboardMetricsHandler } from './dashboard-metrics-handler'
import { dashboardSpeciesByRiskDataHandler } from './dashboard-species-by-risk-handler'
import { dashboardSpeciesDataHandler, dashboardSpeciesHighlightedDeleteHandler, dashboardSpeciesHighlightedPostHandler } from './dashboard-species-data-handler'
import { dashboardStakeholdersHandler, updateDashboardStakeholdersHandler } from './dashboard-stakeholders-handler'

export const routesDashboard: RouteRegistration[] = [
  {
    method: GET,
    url: dashboardMetricsRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardMetricsHandler
  },
  {
    method: GET,
    url: dashboardDataByHourRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardDataByHourHandler
  },
  {
    method: GET,
    url: dashboardContentRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardContentHandler
  },
  {
    method: PATCH,
    url: dashboardContentRoute,
    preHandler: [requireProjectPermission('update-profile')],
    handler: updateDashboardContentHandler
  },
  {
    method: GET,
    url: dashboardDataBySiteRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardDataBySiteHandler
  },
  {
    method: GET,
    url: dashboardSpeciesDataRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardSpeciesDataHandler
  },
  {
    method: GET,
    url: dashboardProfileRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardContentHandler
  },
  {
    method: GET,
    url: dashboardSpeciesByRiskDataRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: dashboardSpeciesByRiskDataHandler
  },
  {
    method: POST,
    url: speciesHighlightedPostRoute,
    preHandler: [requireProjectPermission('update-profile')],
    handler: dashboardSpeciesHighlightedPostHandler
  },
  {
    method: DELETE,
    url: speciesHighlightedDeleteRoute,
    preHandler: [requireProjectPermission('update-profile')],
    handler: dashboardSpeciesHighlightedDeleteHandler
  },
  {
    method: GET,
    url: dashboardStakeholdersRoute,
    handler: dashboardStakeholdersHandler
  },
  {
    method: PATCH,
    url: updateDashboardStakeholdersRoute,
    preHandler: [requireProjectPermission('update-profile')],
    handler: updateDashboardStakeholdersHandler
  }
]
