import { type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { extractUserId } from '~/auth0/extract-user'
import { getUserProfile } from './user-profile-bll'

export const userProfileHandler: Handler<UserProfileResponse> = async (req) => {
  const userIdAuth0 = await extractUserId(req)
  return await getUserProfile(userIdAuth0)
}
