import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectFiltersRoute, projectRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { setMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { type RouteRegistration, GET, POST } from '../_services/api-helpers/types'
import { projectCreateHandler } from './project-create-handler'
import { projectFiltersHandler, projectRecordingCountHandler } from './project-filters-handler'
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
    method: POST,
    url: projectCreateRoute,
    handler: projectCreateHandler
  }
]
