import { type GetProjectMembersParams, type GetProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { getProjectMembersFromCore } from './get-project-members-bll'

export const getProjectMembersHandler: Handler<GetProjectMembersResponse, GetProjectMembersParams> = async (req) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  const { projectId } = req.params
  const projectIdInteger = parseInt(projectId)

  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectUsers = await getProjectMembersFromCore(token, projectIdInteger)
  return projectUsers
}
