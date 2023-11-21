import { projectSettingsRoute } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectSettingsHandler, projectSettingsUpdateHandler } from './project-settings-handler'

export const routesProjectProfile: RouteRegistration[] = [
  {
    method: GET,
    url: projectSettingsRoute,
    handler: projectSettingsHandler
  },
  {
    method: PATCH,
    url: projectSettingsRoute,
    handler: projectSettingsUpdateHandler
  }
]
