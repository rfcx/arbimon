import { userProfileRoute } from '@rfcx-bio/common/api-bio/users/profile'

import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { userProfileHandler } from './user-profile-handler'

export const routesUserProfile: RouteRegistration[] = [
  {
    method: GET,
    url: userProfileRoute,
    handler: userProfileHandler
  }
]
