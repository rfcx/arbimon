import { type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { BioNotFoundError } from '~/errors'

export const userProfileHandler: Handler<UserProfileResponse> = async (req) => {
  // TODO: implement bll/dao
  throw BioNotFoundError()
}
