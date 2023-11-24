import { type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { BioNotFoundError } from '~/errors'
import { getUserProfile as daoGetUserProfile } from './user-profile-dao'

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const profile = await daoGetUserProfile(userId)
  if (profile === undefined) {
    throw BioNotFoundError()
  }
  return profile
}
