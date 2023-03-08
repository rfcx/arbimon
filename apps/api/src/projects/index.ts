import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { setMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { projectFiltersHandler } from './project-filters-handler'
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
  }
]
