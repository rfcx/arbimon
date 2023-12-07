import { type OrganizationsResponse, type UpdateUserProfileRequestBody, type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { extractUserId } from '~/auth0/extract-user'
import { getAllOrganizations, getUserProfile, patchUserProfile } from './user-profile-bll'

export const userProfileHandler: Handler<UserProfileResponse> = async (req) => {
  const userIdAuth0 = await extractUserId(req)
  return await getUserProfile(userIdAuth0)
}

export const patchUserProfileHandler: Handler<string, unknown, unknown, UpdateUserProfileRequestBody> = async (req, rep) => {
  const userIdAuth0 = await extractUserId(req)
  await patchUserProfile(userIdAuth0, req.body)

  rep.statusCode = 204
  return ''
}

export const organizationsListHandler: Handler<OrganizationsResponse> = async (req) => {
  const organizations = await getAllOrganizations()

  return organizations
}
