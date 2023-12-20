import { type GetProjectMembersParams, type GetProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { get } from './get-project-members-dao'

export const getProjectMembersHandler: Handler<GetProjectMembersResponse, GetProjectMembersParams> = async (req) => {
  const { projectId } = req.params
  const projectIdInteger = parseInt(projectId)

  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectUsers = await get(projectIdInteger)
  return projectUsers
}
