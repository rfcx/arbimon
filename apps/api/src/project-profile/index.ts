import { projectProfileRoute } from '@rfcx-bio/common/api-bio/project-profile/project-profile'
import { projectSettingsRoute } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { projectProfileHandler } from './project-profile-handler'
import { projectProfileUpdateHandler } from './project-profile-update-handler'
import { projectSettingsHandler, projectSettingsUpdateHandler } from './project-settings-handler'

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
  },
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
