import { type UpdateUserProfileRequestBody, type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { BioUnauthorizedError } from '~/errors'
import { getUserProfile, patchUserProfile } from './user-profile-bll'

export const userProfileHandler: Handler<UserProfileResponse> = async (req) => {
  // If this is null then you don't have the token from the start.
  if (req.extractedUser === null) {
    throw BioUnauthorizedError()
  }

  return await getUserProfile(req.extractedUser.email)
}

export const patchUserProfileHandler: Handler<string, unknown, unknown, UpdateUserProfileRequestBody> = async (req, rep) => {
  if (req.headers.authorization === undefined || req.headers.authorization === '') {
    throw BioUnauthorizedError()
  }

  if (req.extractedUser === null) {
    throw BioUnauthorizedError()
  }
  await patchUserProfile(req.headers.authorization, req.extractedUser.email, req.body)

  rep.statusCode = 204
  return ''
}
