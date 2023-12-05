import { userProfileRoute } from '@rfcx-bio/common/api-bio/users/profile'
import { userProfileImageRoute } from '@rfcx-bio/common/api-bio/users/profile-image'

import { type RouteRegistration, GET, PATCH } from '../_services/api-helpers/types'
import { patchUserProfileHandler, userProfileHandler } from './user-profile-handler'
import { getUserProfileImageHandler, patchUserProfileImageHandler } from './user-profile-image-handler'

export const routesUserProfile: RouteRegistration[] = [
  {
    method: GET,
    url: userProfileRoute,
    handler: userProfileHandler
  },
  {
    method: PATCH,
    url: userProfileRoute,
    handler: patchUserProfileHandler
  },
  {
    method: GET,
    url: userProfileImageRoute,
    handler: getUserProfileImageHandler
  },
  {
    method: PATCH,
    url: userProfileImageRoute,
    handler: patchUserProfileImageHandler

  }
]
