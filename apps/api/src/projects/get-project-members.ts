import { type GetProjectMembersParams, type GetProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'
import { type ProjectRole } from '@rfcx-bio/common/roles'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { get, getUserRoleForProject } from './get-project-members-dao'

export const getProjectMembersHandler: Handler<GetProjectMembersResponse, GetProjectMembersParams> = async (req) => {
  const { projectId } = req.params
  const projectIdInteger = parseInt(projectId)

  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectUsers = await get(projectIdInteger)
  return projectUsers
}

export const getProjectPermissionHandler: Handler<ProjectRole, GetProjectMembersParams> = async (req) => {
  const { projectId } = req.params
  const userId = req.userId
  const projectIdInteger = parseInt(projectId)

  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await getUserRoleForProject(userId, projectIdInteger)
}
