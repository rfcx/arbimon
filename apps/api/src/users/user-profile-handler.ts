import { type UpdateUserProfileRequestBody, type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { extractUserId } from '~/auth0/extract-user'
import { getUserProfile, patchUserProfile } from './user-profile-bll'

export const userProfileHandler: Handler<UserProfileResponse> = async (req) => {
  const idAuth0 = await extractUserId(req)
  return await getUserProfile(idAuth0)
}

export const patchUserProfileHandler: Handler<string, unknown, unknown, UpdateUserProfileRequestBody> = async (req, rep) => {
  const idAuth0 = await extractUserId(req)
  await patchUserProfile(idAuth0, req.body)

  rep.statusCode = 204
  return ''
}
