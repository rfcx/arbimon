import { projectDataRoute } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { requireProjectPermission } from '@/_middleware/require-permission'
import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectProfileHandler, projectProfileUpdateHandler } from './project-profile-handler'

export const routesProjectProfile: RouteRegistration[] = [
  {
    method: GET,
    url: projectDataRoute + '/profile',
    preHandler: [requireProjectPermission('read-profile')],
    handler: projectProfileHandler
  },
  {
    method: PATCH,
    url: projectDataRoute + '/profile',
    preHandler: [requireProjectPermission('update-profile')],
    handler: projectProfileUpdateHandler
  }
]
