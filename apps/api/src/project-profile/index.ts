import { projectProfileRoute } from '@rfcx-bio/common/api-bio/project-profile/project-profile'

import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectProfileHandler } from './project-profile-handler'
import { projectProfileUpdateHandler } from './project-profile-update-handler'

export const routesProjectProfile: RouteRegistration[] = [
  {
    method: GET,
    url: projectProfileRoute,
    handler: projectProfileHandler
  },
  {
    method: PATCH,
    url: projectProfileRoute,
    handler: projectProfileUpdateHandler
  }
]
