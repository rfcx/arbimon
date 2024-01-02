import { updateInsightsPublishStatusRoute } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'
import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectProfileImageRoute } from '@rfcx-bio/common/api-bio/project/project-image'
import { projectRecordingCountRoute, projectSitesRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { myProjectsRoute, projectDirectoryRoute, projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { requireAuthorized } from '@/_hooks/require-authenticated'
import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, GET, PATCH, POST } from '../_services/api-helpers/types'
import { projectsDirectoryHandler } from './get-directory-projects-handler'
import { getProjectMembersHandler, getProjectPermissionHandler } from './get-project-members'
import { patchInsightsPublishStatusHandler } from './patch-insights-publish-status-handler'
import { projectCreateHandler } from './project-create-handler'
import { projectFiltersHandler, projectRecordingCountBySiteHandler, projectRecordingCountHandler } from './project-filters-handler'
import { projectUpdateImageHandler } from './project-image-handler'
import { myProjectsHandler, projectsAllHandler } from './projects-handler'

export const routesProject: RouteRegistration[] = [
  {
    method: GET,
    url: projectsRoute,
    handler: projectsAllHandler
  },
  {
    method: GET,
    url: projectDirectoryRoute,
    handler: projectsDirectoryHandler
  },
  {
    method: GET,
    url: myProjectsRoute,
    preHandler: [requireAuthorized],
    handler: myProjectsHandler
  },
  {
    method: GET,
    url: projectFiltersRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectFiltersHandler
  },
  {
    method: GET,
    url: projectRecordingCountRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectRecordingCountHandler
  },
  {
    method: GET,
    url: projectSitesRecordingCountRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectRecordingCountBySiteHandler
  },
  {
    method: POST,
    url: projectCreateRoute,
    preHandler: [requireAuthorized],
    handler: projectCreateHandler
  },
  {
    method: PATCH,
    url: projectProfileImageRoute,
    preHandler: [requireProjectPermission('update-profile')],
    handler: projectUpdateImageHandler
  },
  {
    method: PATCH,
    url: updateInsightsPublishStatusRoute,
    preHandler: [requireProjectPermission('update-publish-status')],
    handler: patchInsightsPublishStatusHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/users',
    preHandler: [requireProjectPermission('read-users')],
    handler: getProjectMembersHandler
  },
  {
    method: GET,
    url: '/projects/:projectId/role',
    handler: getProjectPermissionHandler
  }
]
