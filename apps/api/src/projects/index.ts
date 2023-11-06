import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectLocationRoute } from '@rfcx-bio/common/api-bio/project/project-location'
import { projectRecordingCountRoute, projectSitesRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { setMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { type RouteRegistration, GET, POST } from '../_services/api-helpers/types'
import { projectCreateHandler } from './project-create-handler'
import { projectFiltersHandler, projectRecordingCountBySiteHandler, projectRecordingCountHandler } from './project-filters-handler'
import { projectLocationHandler } from './project-location-handler'
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
    url: projectLocationRoute,
    handler: projectLocationHandler
  },
  {
    method: GET,
    url: projectRecordingCountRoute,
    handler: projectRecordingCountHandler
  },
  {
    method: GET,
    url: projectSitesRecordingCountRoute,
    handler: projectRecordingCountBySiteHandler
  },
  {
    method: POST,
    url: projectCreateRoute,
    handler: projectCreateHandler
  }
]
