import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/common/project-filters'
import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'

import { verifyUserAccessibleProjects } from '~/decorators'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { projectFiltersHandler } from './project-filters-handler'
import { projectsAllHandler } from './projects-handler'

export const routesProject: RouteRegistration[] = [
  {
    method: GET,
    url: projectsRoute,
    handler: projectsAllHandler,
    preHandler: [
      verifyUserAccessibleProjects
    ]
  },
  {
    method: GET,
    url: projectFiltersRoute,
    handler: projectFiltersHandler
  }
]
