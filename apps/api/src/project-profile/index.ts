import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'

import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectProfileHandler, projectProfileStakeholdersReadOnlyHandler, projectProfileUpdateHandler } from './project-profile-handler'

export const routesProjectProfile: RouteRegistration[] = [
  {
    method: GET,
    url: projectDataRoute + '/profile',
    handler: projectProfileHandler
  },
  {
    method: GET,
    url: projectDataRoute + '/profile/stakeholders',
    preHandler: [requireProjectPermission('read-profile')],
    handler: projectProfileStakeholdersReadOnlyHandler
  },
  {
    method: PATCH,
    url: projectDataRoute + '/profile',
    preHandler: [requireProjectPermission('update-profile')],
    handler: projectProfileUpdateHandler
  }
]
