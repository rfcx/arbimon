import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { dashboardGeneratedHandler } from './dashboard-generated-handler'
import { contentHandler, mapDatasetHandler, projectMetricsHandler, richnessByHourHandler, sidebarHandler, speciesHighlightedHandler, speciesThreatenedHandler } from './dashboard-multiple-routes'
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
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-generated/project-metrics',
    handler: projectMetricsHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-generated/sidebar',
    handler: sidebarHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-profile/content',
    handler: contentHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-generated/map-dataset',
    handler: mapDatasetHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-generated/richness-by-hour',
    handler: richnessByHourHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-generated/species-threatened',
    handler: speciesThreatenedHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/dashboard-generated/species-highlighted',
    handler: speciesHighlightedHandler
  }
]
