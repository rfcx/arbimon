import { type UpdateUserProfileRequestBody, type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { type Auth0UserToken } from '~/auth0/types'
import { getUserProfile, patchUserProfile } from './user-profile-bll'

export const userProfileHandler: Handler<UserProfileResponse> = async (req) => {
  return await getUserProfile(req.userId as number)
}

export const patchUserProfileHandler: Handler<string, unknown, unknown, UpdateUserProfileRequestBody> = async (req, rep) => {
  await patchUserProfile(req.headers.authorization as string, req.userToken as Auth0UserToken, req.userId as number, req.body)

  rep.statusCode = 204
  return ''
}
