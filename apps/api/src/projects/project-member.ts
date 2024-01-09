import { type DeleteProjectMemberResponse, type GetProjectMembersResponse, type ProjectMemberResponseBody, type ProjectMembersParams } from '@rfcx-bio/common/api-bio/project/project-members'
import { type ProjectRole } from '@rfcx-bio/common/roles'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { deleteProjectMember, get, getUserRoleForProject } from './dao/project-member-dao'

export const getProjectMembersHandler: Handler<GetProjectMembersResponse, ProjectMembersParams> = async (req) => {
  const { projectId } = req.params
  const projectIdInteger = parseInt(projectId)

  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectUsers = await get(projectIdInteger)
  return projectUsers
}

export const getProjectPermissionHandler: Handler<ProjectRole, ProjectMembersParams> = async (req) => {
  const { projectId } = req.params
  const userId = req.userId
  const projectIdInteger = parseInt(projectId)

  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await getUserRoleForProject(userId, projectIdInteger)
}

export const deleteProjectMemberHandler: Handler<DeleteProjectMemberResponse, ProjectMembersParams, unknown, ProjectMemberResponseBody> = async (req) => {
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const userId = req.body.userId
  await deleteProjectMember(projectIdInteger, userId)
  return { message: 'Project member is deleted' }
}
