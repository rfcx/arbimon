import { type UsersLightResponse, type UsersRequestQueryParams } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { getUsers } from './user-profile-bll'

export const usersHandler: Handler<UsersLightResponse, void, UsersRequestQueryParams> = async (request, reply) => {
  const q = request.query.q
  if (q === undefined) {
    return []
  }

  return await getUsers(q)
}
