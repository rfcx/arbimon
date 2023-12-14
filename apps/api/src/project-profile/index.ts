import { projectDataRoute } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { setMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectProfileHandler, projectProfileUpdateHandler } from './project-profile-handler'

export const routesProjectProfile: RouteRegistration[] = [
  {
    method: GET,
    url: projectDataRoute + '/profile',
    preHandler: [setMemberProjectCoreIds],
    handler: projectProfileHandler
  },
  {
    method: PATCH,
    url: projectDataRoute + '/profile',
    preHandler: [setMemberProjectCoreIds],
    handler: projectProfileUpdateHandler
  }
]
