import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { sitesRoute } from '@rfcx-bio/common/api-bio/common/sites'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { projectsAllHandler } from './controller-projects-all'
import { sitesAllHandler } from './controller-sites-all'

export const routesProject: RouteRegistration[] = [
  {
    method: GET,
    url: projectsRoute,
    handler: projectsAllHandler
  },
  {
    method: GET,
    url: sitesRoute,
    handler: sitesAllHandler
  }
]
