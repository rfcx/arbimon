import { projectDataRoute } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectSettingsHandler, projectSettingsUpdateHandler } from './project-settings-handler'

export const routesProjectProfile: RouteRegistration[] = [
  {
    method: GET,
    url: projectDataRoute,
    handler: projectSettingsHandler
  },
  {
    method: PATCH,
    url: projectDataRoute + '/settings',
    handler: projectSettingsUpdateHandler
  }
]
