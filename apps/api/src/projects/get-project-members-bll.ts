import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'

import { getProjectMembersFromApi } from '~/api-core/api-core'
import { BioNotFoundError } from '~/errors'
import { get } from './get-project-members-dao'

export const getProjectMembersFromCore = async (token: string, locationProjectId: number): Promise<CoreUser[]> => {
  const idCore = await get(locationProjectId)

  if (idCore == null || idCore === '') {
    throw BioNotFoundError()
  }

  const projectUsers = await getProjectMembersFromApi(token, idCore)
  return projectUsers
}
