import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectDetectionCountRoute, projectFiltersRoute, projectRecordingCountRoute, projectSitesRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { setMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { type RouteRegistration, GET, POST } from '../_services/api-helpers/types'
import { projectCreateHandler } from './project-create-handler'
import { projectDetectionCountHandler, projectFiltersHandler, projectRecordingCountHandler, projectSitesRecordingCountHandler } from './project-filters-handler'
import { projectsAllHandler } from './projects-handler'

export const routesProject: RouteRegistration[] = [
  {
    method: GET,
    url: projectsRoute,
    preHandler: [setMemberProjectCoreIds],
    handler: projectsAllHandler
  },
  {
    method: GET,
    url: projectFiltersRoute,
    handler: projectFiltersHandler
  },
  {
    method: GET,
    url: projectRecordingCountRoute,
    handler: projectRecordingCountHandler
  },
  {
    method: GET,
    url: projectDetectionCountRoute,
    handler: projectDetectionCountHandler
  },
  {
    method: GET,
    url: projectSitesRecordingCountRoute,
    handler: projectSitesRecordingCountHandler
  },
  {
    method: POST,
    url: projectCreateRoute,
    handler: projectCreateHandler
  }
]
