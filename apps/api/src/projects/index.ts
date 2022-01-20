import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { sitesRoute } from '@rfcx-bio/common/api-bio/common/sites'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { controllerProjectsAll } from './controller-projects-all'
import { controllerSitesAll } from './controller-sites-all'

export const routesProject: RouteRegistration[] = [
  [GET, projectsRoute, controllerProjectsAll],
  [GET, sitesRoute, controllerSitesAll]
]
