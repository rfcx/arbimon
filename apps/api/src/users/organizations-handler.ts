import { type OrganizationsResponse } from '@rfcx-bio/common/api-bio/users/profile'

import { type Handler } from '~/api-helpers/types'
import { getAllOrganizations } from './user-profile-bll'

export const organizationsListHandler: Handler<OrganizationsResponse> = async () => {
  return await getAllOrganizations()
}
